import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const BACKUPS_DIR = path.join(process.cwd(), "../backups");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUPS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Backup download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
