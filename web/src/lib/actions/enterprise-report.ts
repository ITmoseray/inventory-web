"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns";

export type ReportTimeframe = "weekly" | "monthly" | "custom";

export interface EnterpriseReportResult {
  currency: string;
  businessName: string;
  timeframe: ReportTimeframe;
  startDate: string;
  endDate: string;
  summary: {
    totalRevenue: number;
    totalCOGS: number;
    grossProfit: number;
    grossMargin: number;
    totalExpenses: number;
    netProfit: number;
    netMargin: number;
    totalTransactions: number;
    avgTransactionValue: number;
    totalGST: number;
    taxableBase: number;
  };
  chartData: {
    label: string;
    date: string;
    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    transactions: number;
  }[];
  salesRows: {
    invoiceNumber: string;
    date: string;
    customer: string;
    staff: string;
    paymentMethod: string;
    paymentStatus: string;
    items: number;
    totalAmount: number;
  }[];
  purchaseRows: {
    invoiceNumber: string;
    date: string;
    supplier: string;
    items: number;
    totalAmount: number;
  }[];
  expenseRows: {
    description: string;
    category: string;
    date: string;
    amount: number;
    recordedBy: string;
  }[];
  topProducts: {
    name: string;
    qtySold: number;
    revenue: number;
  }[];
  paymentBreakdown: {
    method: string;
    total: number;
    count: number;
  }[];
}

export async function getEnterpriseReport(
  timeframe: ReportTimeframe = "monthly",
  customRange?: { start?: string; end?: string }
): Promise<EnterpriseReportResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;
  const prisma = getTenantPrisma(businessId);
  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  switch (timeframe) {
    case "weekly":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "monthly":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case "custom":
      startDate = customRange?.start
        ? startOfDay(parseISO(customRange.start))
        : startOfMonth(now);
      endDate = customRange?.end
        ? endOfDay(parseISO(customRange.end))
        : endOfDay(now);
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
  }

  const [sales, purchases, expenses, business] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: { include: { product: true } },
        customer: true,
        user: true,
      },
    }),
    prisma.purchase.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        businessId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    }),
    prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
      include: { user: true },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true, name: true, receiptSettings: true },
    }),
  ]);

  // ── Summary calculations ──────────────────────────────────────────────────
  const paidSales = sales.filter((s) => s.paymentStatus === "PAID");

  const totalRevenue = paidSales.reduce(
    (sum, s) =>
      sum +
      (typeof s.totalAmount === "number"
        ? s.totalAmount
        : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
    0
  );

  const totalCOGS = paidSales.reduce((sum, s) => {
    return (
      sum +
      s.items.reduce((itemSum, item) => {
        const cost = item.product?.costPrice
          ? (item.product.costPrice as any).toNumber?.() ||
            Number(item.product.costPrice)
          : 0;
        return itemSum + cost * item.quantity;
      }, 0)
    );
  }, 0);

  const totalExpensesAmt = expenses.reduce(
    (sum, e) =>
      sum +
      ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
    0
  );

  const totalPurchasesAmt = purchases.reduce(
    (sum, p) =>
      sum +
      ((p.totalAmount as any).toNumber?.() || Number(p.totalAmount) || 0),
    0
  );

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpensesAmt;
  const grossMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const rawSettings = (business?.receiptSettings as any) || {};
  const gstRate = rawSettings.gstRate ?? 15;
  const rateDecimal = gstRate / 100;
  const taxableBase = totalRevenue / (1 + rateDecimal);
  const totalGST = totalRevenue - taxableBase;

  // ── Chart data – build per-day buckets ───────────────────────────────────
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const chartData = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");

    const dayRevenue = paidSales
      .filter((s) => format(new Date(s.createdAt), "yyyy-MM-dd") === dayStr)
      .reduce(
        (sum, s) =>
          sum +
          (typeof s.totalAmount === "number"
            ? s.totalAmount
            : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
        0
      );

    const dayCOGS = paidSales
      .filter((s) => format(new Date(s.createdAt), "yyyy-MM-dd") === dayStr)
      .reduce((sum, s) => {
        return (
          sum +
          s.items.reduce((iSum, item) => {
            const cost = item.product?.costPrice
              ? (item.product.costPrice as any).toNumber?.() ||
                Number(item.product.costPrice)
              : 0;
            return iSum + cost * item.quantity;
          }, 0)
        );
      }, 0);

    const dayExpenses = expenses
      .filter((e) => format(new Date(e.date), "yyyy-MM-dd") === dayStr)
      .reduce(
        (sum, e) =>
          sum + ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
        0
      );

    const dayTransactions = paidSales.filter(
      (s) => format(new Date(s.createdAt), "yyyy-MM-dd") === dayStr
    ).length;

    const dayGrossProfit = dayRevenue - dayCOGS;
    const dayNetProfit = dayGrossProfit - dayExpenses;

    return {
      date: dayStr,
      label:
        timeframe === "monthly"
          ? format(day, "MMM d")
          : format(day, "EEE d"),
      revenue: dayRevenue,
      cogs: dayCOGS,
      expenses: dayExpenses,
      grossProfit: dayGrossProfit,
      netProfit: dayNetProfit,
      transactions: dayTransactions,
    };
  });

  // ── Rows for export ──────────────────────────────────────────────────────
  const salesRows = sales.map((s) => ({
    invoiceNumber: s.invoiceNumber,
    date: format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"),
    customer: s.customer?.name || "Walk-in",
    staff: s.user?.name || "System",
    paymentMethod: s.paymentMethod,
    paymentStatus: s.paymentStatus,
    items: s.items.length,
    totalAmount:
      typeof s.totalAmount === "number"
        ? s.totalAmount
        : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0,
  }));

  const purchaseRows = purchases.map((p) => ({
    invoiceNumber: p.invoiceNumber || "N/A",
    date: format(new Date(p.createdAt), "yyyy-MM-dd HH:mm"),
    supplier: p.supplier?.name || "Unknown",
    items: p.items.length,
    totalAmount:
      (p.totalAmount as any).toNumber?.() || Number(p.totalAmount) || 0,
  }));

  const expenseRows = expenses.map((e) => ({
    description: e.description,
    category: e.category || "General",
    date: format(new Date(e.date), "yyyy-MM-dd"),
    amount: (e.amount as any).toNumber?.() || Number(e.amount) || 0,
    recordedBy: e.user?.name || "System",
  }));

  // ── Top products ────────────────────────────────────────────────────────
  const productMap: Record<
    string,
    { name: string; qtySold: number; revenue: number }
  > = {};
  for (const sale of paidSales) {
    for (const item of sale.items) {
      const key =
        item.productId || item.productName || "unknown";
      const name = item.productName || item.product?.name || "Unknown";
      const itemTotal =
        typeof item.total === "number"
          ? item.total
          : (item.total as any).toNumber?.() || Number(item.total) || 0;
      if (!productMap[key]) {
        productMap[key] = { name, qtySold: 0, revenue: 0 };
      }
      productMap[key].qtySold += item.quantity;
      productMap[key].revenue += itemTotal;
    }
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── Payment breakdown ─────────────────────────────────────────────────
  const paymentMap: Record<string, { total: number; count: number }> = {};
  for (const sale of paidSales) {
    const method = sale.paymentMethod || "UNKNOWN";
    if (!paymentMap[method]) paymentMap[method] = { total: 0, count: 0 };
    paymentMap[method].total +=
      typeof sale.totalAmount === "number"
        ? sale.totalAmount
        : (sale.totalAmount as any).toNumber?.() ||
          Number(sale.totalAmount) ||
          0;
    paymentMap[method].count++;
  }
  const paymentBreakdown = Object.entries(paymentMap).map(([method, v]) => ({
    method,
    total: v.total,
    count: v.count,
  }));

  return {
    currency: business?.currency || "SLL",
    businessName: business?.name || "Enterprise OS",
    timeframe,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    summary: {
      totalRevenue,
      totalCOGS,
      grossProfit,
      grossMargin,
      totalExpenses: totalExpensesAmt,
      netProfit,
      netMargin,
      totalTransactions: paidSales.length,
      avgTransactionValue:
        paidSales.length > 0 ? totalRevenue / paidSales.length : 0,
      totalGST,
      taxableBase,
    },
    chartData,
    salesRows,
    purchaseRows,
    expenseRows,
    topProducts,
    paymentBreakdown,
  };
}
