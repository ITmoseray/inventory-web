import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCloudBackup, restoreCloudBackup, restoreFromRawPayload, createBusinessBackup, restoreBusinessBackup } from "@/lib/backup-engine";
import { logAudit } from "@/lib/actions/audit";

export async function GET() {
  try {
    const session = await auth();
    const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudBackups = await (prisma as any).systemBackup.findMany({
      select: {
        id: true,
        filename: true,
        sizeBytes: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cloudBackups || []);
  } catch (error: any) {
    console.error("GET /api/super-admin/backups error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "create";

    if (action === "create") {
      const result = await createCloudBackup("MANUAL");
      await logAudit({
        action: `GENERATED DATABASE BACKUP: ${result.filename}`,
        entity: "SYSTEM",
      });
      return NextResponse.json({ success: true, filename: result.filename });
    }

    if (action === "restore") {
      const { filename } = body;
      if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });
      const res = await restoreCloudBackup(filename);
      await logAudit({
        action: `RESTORED DATABASE FROM BACKUP: ${filename}`,
        entity: "SYSTEM",
      });
      return NextResponse.json(res);
    }

    if (action === "restore-upload") {
      const { rawJson, filename } = body;
      if (!rawJson) return NextResponse.json({ error: "Backup JSON is required" }, { status: 400 });
      const res = await restoreFromRawPayload(rawJson, filename || "uploaded-file");
      await logAudit({
        action: `RESTORED DATABASE FROM UPLOADED BACKUP: ${filename || "uploaded-file"}`,
        entity: "SYSTEM",
      });
      return NextResponse.json(res);
    }

    if (action === "backup-business") {
      const { businessId } = body;
      if (!businessId) return NextResponse.json({ error: "businessId is required" }, { status: 400 });
      const result = await createBusinessBackup(businessId);
      await logAudit({
        action: `GENERATED BUSINESS BACKUP: ${result.filename}`,
        entity: "BUSINESS",
      });
      return NextResponse.json({ success: true, filename: result.filename });
    }

    if (action === "restore-business") {
      const { rawJson } = body;
      if (!rawJson) return NextResponse.json({ error: "Backup JSON is required" }, { status: 400 });
      const res = await restoreBusinessBackup(rawJson);
      await logAudit({
        action: `RESTORED BUSINESS DATA: ${res.businessName}`,
        entity: "BUSINESS",
      });
      return NextResponse.json(res);
    }

    if (action === "delete") {
      const { filename } = body;
      if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });
      await (prisma as any).systemBackup.deleteMany({
        where: { filename },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/super-admin/backups error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
