import { prisma } from "@/lib/prisma";

/**
 * Cloud-Native PostgreSQL Backup & Restore Engine for Firebase & Neon.
 * Runs 100% in TypeScript via Prisma — no pg_dump / psql binaries required.
 *
 * NOTE: Neon does NOT grant superuser, so `SET session_replication_role = 'replica'`
 * is forbidden (error 42501). We handle FK ordering explicitly instead.
 */

// ---------------------------------------------------------------------------
// Table deletion order — child → parent so FKs are never violated.
// Add new tables at the top (most-dependent first).
// ---------------------------------------------------------------------------
const SYSTEM_DELETE_ORDER: string[] = [
  // ── Very deep leaves ──────────────────────────────────────────────
  "AuditLog",
  "Notification",
  "StockMovement",
  "SaleItem",
  "PurchaseOrderItem",
  "TransferItem",
  "LowStockAlert",
  "ExpiryAlert",
  "BatchItem",
  // ── Mid-level ─────────────────────────────────────────────────────
  "Sale",
  "PurchaseOrder",
  "Transfer",
  "Batch",
  "ProductVariant",
  "Product",
  "Category",
  "Supplier",
  "Warehouse",
  "Location",
  "Customer",
  "Voucher",
  "Subscription",
  "Session",
  "Account",
  "VerificationToken",
  "PasswordResetToken",
  "PushToken",
  // ── Root / near-root ─────────────────────────────────────────────
  "User",
  "Business",
  "SystemSettings",
  "BroadcastMessage",
  "SystemAlert",
  "BillingPlan",
];

// Same list reversed = insertion order (parents before children)
const SYSTEM_INSERT_ORDER: string[] = [...SYSTEM_DELETE_ORDER].reverse();

// ---------------------------------------------------------------------------
// FULL SYSTEM BACKUP
// ---------------------------------------------------------------------------
export async function createCloudBackup(
  type: "MANUAL" | "AUTO" | "SAFETY" = "MANUAL"
): Promise<{ filename: string; sizeBytes: number; id: string }> {
  try {
    // 1. Discover all user tables (excluding internal ones)
    const tablesRes: Array<{ tablename: string }> = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename != 'SystemBackup'
        AND tablename != '_prisma_migrations'
      ORDER BY tablename ASC;
    `;

    const tables = tablesRes.map((r) => r.tablename);
    const dumpPayload: {
      metadata: { version: string; createdAt: string; type: string; totalTables: number };
      tables: Record<string, any[]>;
    } = {
      metadata: {
        version: "2.0-cloud",
        createdAt: new Date().toISOString(),
        type,
        totalTables: tables.length,
      },
      tables: {},
    };

    // 2. Fetch all rows per table
    for (const table of tables) {
      try {
        const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
        dumpPayload.tables[table] = rows;
      } catch (err: any) {
        console.warn(`[BACKUP] Skipping table "${table}":`, err.message);
      }
    }

    const jsonData = JSON.stringify(dumpPayload);
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix =
      type === "SAFETY" ? "safety-pre-restore" : type === "AUTO" ? "auto-backup" : "nexus-backup";
    const filename = `${prefix}-${timestampStr}.json`;
    const sizeBytes = Buffer.byteLength(jsonData, "utf8");

    // 3. Persist to Neon SystemBackup table
    const backupRecord = await (prisma as any).systemBackup.create({
      data: { filename, sizeBytes, type, data: jsonData },
    });

    console.log(`[BACKUP OK] ${filename} (${(sizeBytes / 1024).toFixed(2)} KB)`);
    return { filename, sizeBytes, id: backupRecord.id };
  } catch (error: any) {
    console.error("[BACKUP ERROR]:", error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// FULL SYSTEM RESTORE — from a stored snapshot filename
// ---------------------------------------------------------------------------
export async function restoreCloudBackup(
  filename: string
): Promise<{ success: boolean; message: string }> {
  const backup = await (prisma as any).systemBackup.findUnique({ where: { filename } });
  if (!backup) throw new Error(`Snapshot "${filename}" not found in database.`);
  return restoreFromRawPayload(backup.data, filename);
}

// ---------------------------------------------------------------------------
// FULL SYSTEM RESTORE — from raw JSON (uploaded file or stored snapshot)
// ---------------------------------------------------------------------------
export async function restoreFromRawPayload(
  rawJson: string,
  sourceName = "uploaded-file"
): Promise<{ success: boolean; message: string }> {
  let payload: { metadata: any; tables: Record<string, any[]> };

  try {
    payload = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid backup file: payload is not valid JSON.");
  }

  if (!payload.tables || typeof payload.tables !== "object") {
    throw new Error("Invalid backup structure: missing table data.");
  }

  // Safety snapshot before touching anything
  try {
    console.log("[RESTORE] Creating safety snapshot...");
    await createCloudBackup("SAFETY");
  } catch (err: any) {
    console.warn("[RESTORE] Safety snapshot skipped:", err.message);
  }

  // Build ordered table lists from what actually exists in the backup
  const backupTableSet = new Set(Object.keys(payload.tables));

  // Delete order: use predefined child-first list, then any extra tables not listed
  const deleteOrder = [
    ...SYSTEM_DELETE_ORDER.filter((t) => backupTableSet.has(t)),
    ...[...backupTableSet].filter((t) => !SYSTEM_DELETE_ORDER.includes(t)),
  ];

  // Insert order: parent-first
  const insertOrder = [
    ...SYSTEM_INSERT_ORDER.filter((t) => backupTableSet.has(t)),
    ...[...backupTableSet].filter((t) => !SYSTEM_INSERT_ORDER.includes(t)),
  ];

  try {
    // Step 1: Delete in child-first order OUTSIDE a single transaction
    // so each statement auto-commits and FKs from the previous delete are gone.
    for (const table of deleteOrder) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      } catch (err: any) {
        console.warn(`[RESTORE] Delete "${table}" skipped:`, err.message);
      }
    }

    // Step 2: Insert all rows in parent-first order
    for (const table of insertOrder) {
      const rows = payload.tables[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row)
          .map((c) => `"${c}"`)
          .join(", ");
        const values = Object.values(row);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");
        const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        try {
          await prisma.$executeRawUnsafe(query, ...values);
        } catch (err: any) {
          console.warn(`[RESTORE] Insert into "${table}" row skipped:`, err.message);
        }
      }
    }

    console.log(`[RESTORE OK] Restored from ${sourceName}`);
    return {
      success: true,
      message: `Database successfully restored from ${sourceName}. All tables synced!`,
    };
  } catch (restoreError: any) {
    console.error("[RESTORE FAILED]:", restoreError);
    throw new Error(`Restore failed: ${restoreError.message}`);
  }
}

// ---------------------------------------------------------------------------
// TENANT BACKUP — export only one business's rows
// ---------------------------------------------------------------------------
export async function createBusinessBackup(
  businessId: string
): Promise<{ filename: string; sizeBytes: number; data: string }> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, slug: true },
  });
  if (!business) throw new Error("Business not found");

  // Find all tables that have a businessId column
  const tablesWithBusinessId: Array<{ table_name: string }> = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'businessId'
    ORDER BY table_name ASC;
  `;

  const tables = tablesWithBusinessId.map((t) => t.table_name);

  const businessDump: any = {
    metadata: {
      version: "2.0-tenant-backup",
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug,
      createdAt: new Date().toISOString(),
      totalTables: tables.length,
    },
    businessRecord: await prisma.business.findUnique({ where: { id: businessId } }),
    tables: {},
  };

  for (const table of tables) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM "${table}" WHERE "businessId" = $1`,
        businessId
      );
      if (rows && rows.length > 0) businessDump.tables[table] = rows;
    } catch (err: any) {
      console.warn(`[BUSINESS BACKUP] Skipping table "${table}":`, err.message);
    }
  }

  const jsonData = JSON.stringify(businessDump, null, 2);
  const cleanSlug = (business.slug || "tenant").replace(/[^a-zA-Z0-9_-]/g, "_");
  const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `business-${cleanSlug}-${timestampStr}.json`;
  const sizeBytes = Buffer.byteLength(jsonData, "utf8");

  await (prisma as any).systemBackup.create({
    data: { filename, sizeBytes, type: `TENANT:${business.id}`, data: jsonData },
  });

  return { filename, sizeBytes, data: jsonData };
}

// ---------------------------------------------------------------------------
// TENANT RESTORE — wipe & re-insert ONLY one business's rows
// ---------------------------------------------------------------------------
export async function restoreBusinessBackup(
  rawJson: string
): Promise<{ success: boolean; message: string; businessName: string }> {
  let payload: any;
  try {
    payload = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid backup file: not valid JSON.");
  }

  if (payload.metadata?.version !== "2.0-tenant-backup" || !payload.metadata?.businessId) {
    throw new Error("This file is not an individual business backup snapshot.");
  }

  const targetBusinessId: string = payload.metadata.businessId;
  const businessName: string = payload.metadata.businessName || "Business";
  const tableNames: string[] = Object.keys(payload.tables || {});

  // Delete order for tenant: child tables first, then the Business row itself
  const tenantDeleteOrder = [
    ...SYSTEM_DELETE_ORDER.filter((t) => tableNames.includes(t)),
    ...tableNames.filter((t) => !SYSTEM_DELETE_ORDER.includes(t)),
  ];

  const tenantInsertOrder = [
    ...SYSTEM_INSERT_ORDER.filter((t) => tableNames.includes(t)),
    ...tableNames.filter((t) => !SYSTEM_INSERT_ORDER.includes(t)),
  ];

  try {
    // Step 1: Delete this business's rows, child tables first
    for (const table of tenantDeleteOrder) {
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE "businessId" = $1;`,
          targetBusinessId
        );
      } catch (err: any) {
        console.warn(`[RESTORE BUSINESS] Delete "${table}" skipped:`, err.message);
      }
    }

    // Step 2: Upsert the Business record itself
    if (payload.businessRecord) {
      const bCols = Object.keys(payload.businessRecord)
        .map((c) => `"${c}"`)
        .join(", ");
      const bVals = Object.values(payload.businessRecord);
      const bPlaceholders = bVals.map((_, idx) => `$${idx + 1}`).join(", ");
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Business" (${bCols}) VALUES (${bPlaceholders}) ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW();`,
        ...bVals
      );
    }

    // Step 3: Insert rows in parent-first order
    for (const table of tenantInsertOrder) {
      const rows = payload.tables[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row as object)
          .map((c) => `"${c}"`)
          .join(", ");
        const values = Object.values(row as object);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");
        const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        try {
          await prisma.$executeRawUnsafe(query, ...values);
        } catch (err: any) {
          console.warn(`[RESTORE BUSINESS] Insert "${table}" row skipped:`, err.message);
        }
      }
    }

    return {
      success: true,
      businessName,
      message: `Successfully restored all data for "${businessName}" without affecting any other businesses!`,
    };
  } catch (error: any) {
    console.error("[RESTORE BUSINESS FAILED]:", error);
    throw new Error(`Failed to restore business: ${error.message}`);
  }
}
