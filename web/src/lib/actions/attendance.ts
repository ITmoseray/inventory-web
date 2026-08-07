"use server";

import { prisma as globalPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

/**
 * Uses Prisma safe tagged-template $queryRaw / $executeRaw instead of
 * $queryRawUnsafe / $executeRawUnsafe to eliminate any future SQL-injection risk.
 */

export async function getAttendanceLogs() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    const logs: any = await globalPrisma.$queryRaw`
      SELECT 
        a.id, 
        u.name as "userName", 
        u.email as "userEmail",
        u."imageUrl" as "userImage",
        a."clockIn", 
        a."clockOut", 
        a.status, 
        a.note
      FROM "Attendance" a
      LEFT JOIN "User" u ON a."userId" = u.id
      WHERE a."businessId" = ${businessId} AND a."deletedAt" IS NULL
      ORDER BY a."clockIn" DESC
      LIMIT 100
    `;

    return logs.map((l: any) => ({
      id: l.id,
      userName: l.userName || "Unknown",
      userEmail: l.userEmail,
      userImage: l.userImage || null,
      clockIn: new Date(l.clockIn).toISOString(),
      clockOut: l.clockOut ? new Date(l.clockOut).toISOString() : null,
      status: l.status,
      note: l.note,
    }));
  } catch (error: any) {
    console.error("ATTENDANCE ERROR (Logs):", error);
    throw new Error(`Attendance fetch failed: ${error.message}`);
  }
}

export async function clockIn(userId: string, note?: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    // Check for active session
    const existing: any = await globalPrisma.$queryRaw`
      SELECT id FROM "Attendance" 
      WHERE "userId" = ${userId} AND "businessId" = ${businessId} AND "clockOut" IS NULL AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new Error("User is already clocked in.");
    }

    // Use crypto.randomUUID() instead of Math.random() for security
    const id = `att_${crypto.randomUUID()}`;
    const noteValue = note || "General Duty";

    await globalPrisma.$executeRaw`
      INSERT INTO "Attendance" (id, "userId", "businessId", "clockIn", status, note, "updatedAt", "createdAt")
      VALUES (${id}, ${userId}, ${businessId}, NOW(), ${"ON_TIME"}, ${noteValue}, NOW(), NOW())
    `;

    await logAudit({
      action: `CLOCKED IN (${noteValue})`,
      entity: "ATTENDANCE",
      entityId: id,
      newData: { userId, note },
    });

    revalidatePath("/dashboard/staff/attendance");
    return { success: true, id };
  } catch (error: any) {
    console.error("ATTENDANCE ERROR (Clock-In):", error);
    throw error;
  }
}

export async function clockOut(logId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    await globalPrisma.$executeRaw`
      UPDATE "Attendance" 
      SET "clockOut" = NOW(), "updatedAt" = NOW()
      WHERE id = ${logId} AND "businessId" = ${businessId}
    `;

    await logAudit({
      action: `CLOCKED OUT`,
      entity: "ATTENDANCE",
      entityId: logId,
    });

    revalidatePath("/dashboard/staff/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("ATTENDANCE ERROR (Clock-Out):", error);
    throw error;
  }
}
