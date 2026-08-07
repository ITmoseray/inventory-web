"use server";

import { prisma as globalPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPayrolls() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    const payrolls: any = await globalPrisma.$queryRaw`
      SELECT 
        p.id,
        u.name as "userName",
        u.email as "userEmail",
        p.amount,
        p.status,
        p."periodStart",
        p."periodEnd",
        p."paymentDate",
        p."paymentMethod"
      FROM "Payroll" p
      LEFT JOIN "User" u ON p."userId" = u.id
      WHERE p."businessId" = ${businessId} AND p."deletedAt" IS NULL
      ORDER BY p."createdAt" DESC
    `;

    return payrolls.map((p: any) => ({
      ...p,
      amount: parseFloat(p.amount),
      periodStart: new Date(p.periodStart).toISOString(),
      periodEnd: new Date(p.periodEnd).toISOString(),
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString() : null,
    }));
  } catch (error: any) {
    console.error("PAYROLL ERROR (getPayrolls):", error);
    throw new Error(`Payroll fetch failed: ${error.message}`);
  }
}

export async function processPayroll(
  userId: string,
  amount: number,
  periodStart: Date,
  periodEnd: Date
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    // Use crypto.randomUUID() instead of Math.random() for security
    const id = `pay_${crypto.randomUUID()}`;

    await globalPrisma.$executeRaw`
      INSERT INTO "Payroll" (id, "userId", "businessId", amount, status, "periodStart", "periodEnd", "updatedAt", "createdAt")
      VALUES (${id}, ${userId}, ${businessId}, ${amount}, ${"PENDING"}, ${periodStart}, ${periodEnd}, NOW(), NOW())
    `;

    revalidatePath("/dashboard/staff/payroll");
    return { success: true, id };
  } catch (error: any) {
    console.error("PAYROLL ERROR (processPayroll):", error);
    throw error;
  }
}

export async function markAsPaid(payrollId: string, method: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    await globalPrisma.$executeRaw`
      UPDATE "Payroll" 
      SET status = 'PAID', "paymentDate" = NOW(), "paymentMethod" = ${method}, "updatedAt" = NOW()
      WHERE id = ${payrollId} AND "businessId" = ${businessId}
    `;

    revalidatePath("/dashboard/staff/payroll");
    return { success: true };
  } catch (error: any) {
    console.error("PAYROLL ERROR (markAsPaid):", error);
    throw error;
  }
}
