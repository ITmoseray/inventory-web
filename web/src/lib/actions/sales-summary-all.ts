"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getSalesOrderSummaryAll(start: Date, end: Date) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);

    // Fetch ALL sales (Paid + Pending/Other)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    const summary = sales.reduce(
      (acc, sale) => {
        // Handle Decimal conversion
        const amount = typeof sale.totalAmount === 'number' 
          ? sale.totalAmount 
          : (sale.totalAmount as any).toNumber?.() || Number(sale.totalAmount) || 0;
        
        acc.totalOrders += 1;

        const status = (sale.status || "PENDING").toLowerCase();
        if (!acc.statusSummary[status]) {
          acc.statusSummary[status] = { count: 0, amount: 0 };
        }
        acc.statusSummary[status].count += 1;
        acc.statusSummary[status].amount += amount;

        return acc;
      },
      {
        totalOrders: 0,
        statusSummary: {} as Record<string, { count: number; amount: number }>,
      }
    );

    return summary;
  } catch (error: any) {
    console.error("SUMMARY SYNC ERROR:", error);
    throw new Error(`Summary Registry Sync Failed: ${error.message}`);
  }
}
