import { prisma } from "@/lib/prisma";

/**
 * Cloud-Native PostgreSQL Backup & Restore Engine for Firebase & Neon.
 * This runs 100% in TypeScript using Prisma & PostgreSQL queries without requiring `pg_dump` or `psql` command-line binaries.
 */

export async function createCloudBackup(type: "MANUAL" | "AUTO" | "SAFETY" = "MANUAL"): Promise<{ filename: string; sizeBytes: number; id: string }> {
  try {
    // 1. Get list of all user tables in the public schema
    const tablesRes: Array<{ tablename: string }> = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != 'SystemBackup'
        AND tablename != '_prisma_migrations'
      ORDER BY tablename ASC;
    `;

    const tables = tablesRes.map(r => r.tablename);
    const dumpPayload: { metadata: { version: string; createdAt: string; type: string; totalTables: number }; tables: Record<string, any[]> } = {
      metadata: {
        version: "2.0-cloud",
        createdAt: new Date().toISOString(),
        type,
        totalTables: tables.length,
      },
      tables: {},
    };

    // 2. Fetch all data for each table
    for (const table of tables) {
      try {
        const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
        dumpPayload.tables[table] = rows;
      } catch (err: any) {
        console.warn(`[CLOUD BACKUP] Note on table "${table}":`, err.message);
      }
    }

    const jsonData = JSON.stringify(dumpPayload);
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = type === "SAFETY" ? "safety-pre-restore" : type === "AUTO" ? "auto-backup" : "nexus-backup";
    const filename = `${prefix}-${timestampStr}.json`;
    const sizeBytes = Buffer.byteLength(jsonData, "utf8");

    // 3. Save to Neon PostgreSQL SystemBackup table
    const backupRecord = await (prisma as any).systemBackup.create({
      data: {
        filename,
        sizeBytes,
        type,
        data: jsonData,
      },
    });

    console.log(`[CLOUD BACKUP SUCCESS]: ${filename} (${(sizeBytes / 1024).toFixed(2)} KB) stored in Neon.`);
    return { filename, sizeBytes, id: backupRecord.id };
  } catch (error: any) {
    console.error("[CLOUD BACKUP ERROR]:", error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

export async function restoreCloudBackup(filename: string): Promise<{ success: boolean; message: string }> {
  // 1. Fetch the backup payload from Neon SystemBackup table
  const backup = await (prisma as any).systemBackup.findUnique({
    where: { filename },
  });

  if (!backup) {
    throw new Error(`Backup snapshot "${filename}" not found in database.`);
  }

  return await restoreFromRawPayload(backup.data, filename);
}

export async function restoreFromRawPayload(rawJson: string, sourceName: string = "uploaded-file"): Promise<{ success: boolean; message: string }> {
  let payload: { metadata: any; tables: Record<string, any[]> };
  try {
    payload = JSON.parse(rawJson);
  } catch (err) {
    throw new Error("Invalid backup file: Payload is not valid JSON.");
  }

  if (!payload.tables || typeof payload.tables !== "object") {
    throw new Error("Invalid backup structure: Missing table data.");
  }

  // 1. Safety snapshot first!
  try {
    console.log("[SYSTEM RESTORE] Creating safety snapshot before restore...");
    await createCloudBackup("SAFETY");
  } catch (safetyErr: any) {
    console.warn("[SYSTEM RESTORE] Could not create safety snapshot:", safetyErr.message);
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Temporarily disable foreign keys for clean overwrite
      await tx.$executeRawUnsafe("SET session_replication_role = 'replica';");

      const tableNames = Object.keys(payload.tables);

      // 2. Truncate target tables
      for (const table of tableNames) {
        try {
          await tx.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
        } catch (err: any) {
          console.warn(`[RESTORE] Note on truncate "${table}":`, err.message);
        }
      }

      // 3. Insert records for each table
      for (const [table, rows] of Object.entries(payload.tables)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;

        for (const row of rows) {
          const columns = Object.keys(row).map(c => `"${c}"`).join(", ");
          const values = Object.values(row);
          const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");

          const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
          await (tx as any).$executeRawUnsafe(query, ...values);
        }
      }

      // Re-enable constraints
      await tx.$executeRawUnsafe("SET session_replication_role = 'origin';");
    }, {
      timeout: 120000, // 2 minutes timeout for large datasets
    });

    console.log(`[SYSTEM RESTORE SUCCESS] Restored database from ${sourceName}`);
    return {
      success: true,
      message: `Database successfully restored from ${sourceName}. All tables synced!`,
    };
  } catch (restoreError: any) {
    try {
      await prisma.$executeRawUnsafe("SET session_replication_role = 'origin';");
    } catch {}
    console.error("[SYSTEM RESTORE FAILED]:", restoreError);
    throw new Error(`Restore failed: ${restoreError.message}`);
  }
}
