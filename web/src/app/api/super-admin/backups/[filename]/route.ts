import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const BACKUPS_DIR = path.join(process.cwd(), "../backups");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth();
    const isSuper = session?.user?.role === "SUPERADMIN" || (session?.user as any)?.originalRole === "SUPERADMIN";
    if (!isSuper) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await params;
    const safeFilename = path.basename(filename);

    // 1. Check Neon database first
    const dbBackup = await (prisma as any).systemBackup.findUnique({
      where: { filename: safeFilename },
    });

    if (dbBackup && dbBackup.data) {
      return new NextResponse(dbBackup.data, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
          "Content-Type": "application/json",
        },
      });
    }

    // 2. Fallback to local filesystem
    const filePath = path.join(BACKUPS_DIR, safeFilename);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
          "Content-Type": "application/octet-stream",
        },
      });
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (error) {
    console.error("Backup download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

