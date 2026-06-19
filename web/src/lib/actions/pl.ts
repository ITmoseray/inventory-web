"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getProfitLossData(start: Date, end: Date) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const prisma = getTenantPrisma(session.user.businessId);

    // 1. Revenue — sum of paid sale totals
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: "PAID",
      },
      select: { totalAmount: true },
    });

    // 2. COGS — sum of (costPrice × qty) for each sold item
    //    SaleItem has no own costPrice field; we join to product.costPrice.
    //    External-sourced items use their own externalCostPrice instead.
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: start, lte: end },
          paymentStatus: "PAID",
        },
      },
      select: {
        quantity: true,
        isExternalSourced: true,
        externalCostPrice: true,
        product: { select: { costPrice: true } },
      },
    });

    // 3. Operating Expenses — manual expense entries
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      select: { amount: true },
    });

    const totalRevenue = sales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0
    );

    const totalCOGS = saleItems.reduce((sum, item) => {
      const costPrice = item.isExternalSourced
        ? Number(item.externalCostPrice || 0)
        : Number(item.product?.costPrice || 0);
      return sum + costPrice * item.quantity;
    }, 0);

    const grossProfit = totalRevenue - totalCOGS;
    const operatingExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
    const netProfit = grossProfit - operatingExpenses;

    return {
      totalRevenue,
      totalCOGS,
      grossProfit,
      operatingExpenses,
      netProfit,
    };
  } catch (error) {
    console.error("Failed to fetch P&L data:", error);
    throw error;
  }
}
