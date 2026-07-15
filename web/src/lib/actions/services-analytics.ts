"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getServicesOverview() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);
  const businessId = session.user.businessId;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all service products for this business
  const serviceProducts = await prisma.product.findMany({
    where: { businessId, type: "SERVICE", deletedAt: null },
    select: { id: true, name: true }
  });
  const serviceProductIds = serviceProducts.map(s => s.id);

  if (serviceProductIds.length === 0) {
    return {
      totalRevenue: 0, monthRevenue: 0, lastMonthRevenue: 0,
      weekRevenue: 0, totalTransactions: 0, monthTransactions: 0,
      avgServiceValue: 0, topServices: [], staffPerformance: [],
      recentTransactions: [], dailyTrend: []
    };
  }

  // All service sales (items where productId is a service)
  // Note: SaleItem.businessId can be null for service items, so we filter only by productId
  const allServiceItems = await prisma.saleItem.findMany({
    where: { productId: { in: serviceProductIds } },
    include: {
      sale: {
        select: {
          id: true, invoiceNumber: true, createdAt: true,
          paymentMethod: true, totalAmount: true,
          customer: { select: { name: true } },
          staff: { select: { name: true } },
          staffName: true,
          businessId: true,
        }
      },
      product: { select: { name: true } }
    },
    orderBy: { sale: { createdAt: "desc" } }
  });

  // Filter to only this business's sales (via the sale's businessId)
  const businessItems = allServiceItems.filter(i => i.sale.businessId === businessId);

  // Total Revenue
  const totalRevenue = businessItems.reduce((sum, i) => sum + Number(i.total), 0);
  const totalTransactions = new Set(businessItems.map(i => i.saleId)).size;
  const avgServiceValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // This month
  const monthItems = businessItems.filter(i => i.sale.createdAt >= startOfMonth);
  const monthRevenue = monthItems.reduce((sum, i) => sum + Number(i.total), 0);
  const monthTransactions = new Set(monthItems.map(i => i.saleId)).size;

  // Last month
  const lastMonthItems = businessItems.filter(i => i.sale.createdAt >= startOfLastMonth && i.sale.createdAt <= endOfLastMonth);
  const lastMonthRevenue = lastMonthItems.reduce((sum, i) => sum + Number(i.total), 0);

  // This week
  const weekItems = businessItems.filter(i => i.sale.createdAt >= startOf7Days);
  const weekRevenue = weekItems.reduce((sum, i) => sum + Number(i.total), 0);

  // Top services by revenue
  const serviceRevMap: Record<string, { name: string; revenue: number; count: number }> = {};
  for (const item of businessItems) {
    const pid = item.productId!;
    if (!serviceRevMap[pid]) serviceRevMap[pid] = { name: item.product?.name || "Unknown", revenue: 0, count: 0 };
    serviceRevMap[pid].revenue += Number(item.total);
    serviceRevMap[pid].count += 1;
  }
  const topServices = Object.values(serviceRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Staff performance
  const staffMap: Record<string, { name: string; revenue: number; count: number }> = {};
  for (const item of businessItems) {
    const staffName = item.sale.staff?.name || item.sale.staffName || "Unassigned";
    if (!staffMap[staffName]) staffMap[staffName] = { name: staffName, revenue: 0, count: 0 };
    staffMap[staffName].revenue += Number(item.total);
    staffMap[staffName].count += 1;
  }
  const staffPerformance = Object.values(staffMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // Recent 10 transactions
  const seen = new Set<string>();
  const recentTransactions: any[] = [];
  for (const item of businessItems) {
    if (!seen.has(item.saleId)) {
      seen.add(item.saleId);
      recentTransactions.push({
        id: item.sale.id,
        invoiceNumber: item.sale.invoiceNumber,
        serviceName: item.product?.name,
        amount: Number(item.total),
        paymentMethod: item.sale.paymentMethod,
        customer: item.sale.customer?.name || "Walk-in",
        staff: item.sale.staff?.name || item.sale.staffName || "—",
        createdAt: item.sale.createdAt
      });
      if (recentTransactions.length >= 10) break;
    }
  }

  // Daily trend last 7 days
  const dayMap: Record<string, number> = {};
  for (let d = 6; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  for (const item of weekItems) {
    const key = item.sale.createdAt.toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key] += Number(item.total);
  }
  const dailyTrend = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue }));

  return JSON.parse(JSON.stringify({
    totalRevenue, monthRevenue, lastMonthRevenue,
    weekRevenue, totalTransactions, monthTransactions,
    avgServiceValue, topServices, staffPerformance,
    recentTransactions, dailyTrend
  }));
}
