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
  subWeeks,
  subMonths,
  parseISO,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns";

export type ReportTimeframe = "weekly" | "monthly" | "custom";
export type WeeklyPreset = "this-week" | "last-week" | "2-weeks-ago" | "3-weeks-ago" | "4-weeks-ago";
export type MonthlyPreset = "this-month" | "last-month" | "custom-month";

export interface EnterpriseReportOptions {
  timeframe?: ReportTimeframe;
  weeklyPreset?: WeeklyPreset;
  monthlyPreset?: MonthlyPreset;
  selectedMonth?: number; // 0-11
  selectedYear?: number;
  customStart?: string;
  customEnd?: string;
}

export interface EnterpriseReportResult {
  currency: string;
  businessName: string;
  timeframe: ReportTimeframe;
  periodLabel: string;
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
    totalCreditSales: number;
    // Period Comparison & Growth
    previousRevenue: number;
    revenueGrowthPct: number;
    previousTransactions: number;
    transactionsGrowthPct: number;
    previousNetProfit: number;
    netProfitGrowthPct: number;
    previousCOGS: number;
    previousExpenses: number;
    // Inventory Valuation
    totalStockCostValuation: number;
    totalStockRetailValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalProductsCount: number;
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
  intervalBreakdown: {
    label: string;
    startDate: string;
    endDate: string;
    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    transactions: number;
    grossMargin: number;
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
    tax: number;
    discount: number;
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
    category: string;
    qtySold: number;
    unitPrice: number;
    costPrice: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    marginPct: number;
  }[];
  inventorySnapshot: {
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    costPrice: number;
    unitPrice: number;
    costValuation: number;
    retailValuation: number;
    potentialProfit: number;
    status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK";
  }[];
  staffPerformance: {
    name: string;
    email: string;
    transactions: number;
    totalRevenue: number;
    avgTransaction: number;
  }[];
  customerBreakdown: {
    topCustomers: {
      name: string;
      phone: string;
      transactions: number;
      totalSpent: number;
    }[];
    walkInRevenue: number;
    registeredCustomerRevenue: number;
  };
  expenseCategoryBreakdown: {
    category: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  supplierBreakdown: {
    supplier: string;
    totalSpent: number;
    purchaseCount: number;
  }[];
  paymentBreakdown: {
    method: string;
    total: number;
    count: number;
    percentage: number;
  }[];
}

function calcGrowth(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

export async function getEnterpriseReport(
  optionsOrTimeframe: ReportTimeframe | EnterpriseReportOptions = "monthly",
  legacyCustomRange?: { start?: string; end?: string }
): Promise<EnterpriseReportResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;
  const prisma = getTenantPrisma(businessId);
  const now = new Date();

  // Normalize options
  const options: EnterpriseReportOptions =
    typeof optionsOrTimeframe === "string"
      ? {
          timeframe: optionsOrTimeframe,
          customStart: legacyCustomRange?.start,
          customEnd: legacyCustomRange?.end,
        }
      : optionsOrTimeframe;

  const timeframe = options.timeframe || "monthly";

  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let periodLabel = "";

  if (timeframe === "weekly") {
    let refDate = now;
    if (options.weeklyPreset === "last-week") {
      refDate = subWeeks(now, 1);
    } else if (options.weeklyPreset === "2-weeks-ago") {
      refDate = subWeeks(now, 2);
    } else if (options.weeklyPreset === "3-weeks-ago") {
      refDate = subWeeks(now, 3);
    } else if (options.weeklyPreset === "4-weeks-ago") {
      refDate = subWeeks(now, 4);
    }

    startDate = startOfWeek(refDate, { weekStartsOn: 1 });
    endDate = endOfWeek(refDate, { weekStartsOn: 1 });
    prevStartDate = subWeeks(startDate, 1);
    prevEndDate = subWeeks(endDate, 1);

    periodLabel = `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
  } else if (timeframe === "monthly") {
    let refDate = now;
    if (options.monthlyPreset === "last-month") {
      refDate = subMonths(now, 1);
      startDate = startOfMonth(refDate);
      endDate = endOfMonth(refDate);
    } else if (
      options.monthlyPreset === "custom-month" &&
      typeof options.selectedMonth === "number" &&
      options.selectedYear
    ) {
      refDate = new Date(options.selectedYear, options.selectedMonth, 1);
      startDate = startOfMonth(refDate);
      endDate = endOfMonth(refDate);
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    prevStartDate = startOfMonth(subMonths(startDate, 1));
    prevEndDate = endOfMonth(subMonths(startDate, 1));
    periodLabel = format(startDate, "MMMM yyyy");
  } else {
    // Custom
    startDate = options.customStart
      ? startOfDay(parseISO(options.customStart))
      : startOfMonth(now);
    endDate = options.customEnd
      ? endOfDay(parseISO(options.customEnd))
      : endOfDay(now);

    const spanDays = Math.max(
      1,
      Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    prevStartDate = new Date(startDate.getTime() - spanDays * 24 * 60 * 60 * 1000);
    prevEndDate = new Date(endDate.getTime() - spanDays * 24 * 60 * 60 * 1000);

    periodLabel = `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`;
  }

  // Execute primary queries in parallel
  const [
    sales,
    purchases,
    expenses,
    prevSales,
    prevExpenses,
    activeProducts,
    business,
  ] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        businessId,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: { include: { product: { include: { category: true } } } },
        customer: true,
        user: true,
      },
    }),
    prisma.purchase.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        businessId,
        deletedAt: null,
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
        businessId,
        deletedAt: null,
      },
      orderBy: { date: "asc" },
      include: { user: true },
    }),
    // Previous period for comparative benchmarking
    prisma.sale.findMany({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        businessId,
        deletedAt: null,
      },
      select: {
        totalAmount: true,
        paymentStatus: true,
        items: {
          select: {
            quantity: true,
            product: { select: { costPrice: true } },
          },
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        date: { gte: prevStartDate, lte: prevEndDate },
        businessId,
        deletedAt: null,
      },
      select: { amount: true },
    }),
    // Current inventory snapshot
    prisma.product.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      include: { category: true },
      orderBy: { stockQuantity: "desc" },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true, name: true, receiptSettings: true },
    }),
  ]);

  // ── Financial summary calculations ─────────────────────────────────────────
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
      sum + ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
    0
  );

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpensesAmt;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Credit / Unpaid Sales
  const creditSales = sales.filter((s) => s.paymentStatus === "UNPAID" || s.paymentStatus === "PARTIAL");
  const totalCreditSales = creditSales.reduce(
    (sum, s) =>
      sum +
      (typeof s.totalAmount === "number"
        ? s.totalAmount
        : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
    0
  );

  // ── NRA Fiscal Tax (15% GST Standard) ─────────────────────────────────────
  const rawSettings = (business?.receiptSettings as any) || {};
  const gstRate = rawSettings.gstRate ?? 15;
  const rateDecimal = gstRate / 100;
  const taxableBase = totalRevenue / (1 + rateDecimal);
  const totalGST = totalRevenue - taxableBase;

  // ── Previous period benchmarks ────────────────────────────────────────────
  const prevPaidSales = prevSales.filter((s) => s.paymentStatus === "PAID");
  const previousRevenue = prevPaidSales.reduce(
    (sum, s) =>
      sum +
      (typeof s.totalAmount === "number"
        ? s.totalAmount
        : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
    0
  );

  const previousCOGS = prevPaidSales.reduce((sum, s) => {
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

  const previousExpenses = prevExpenses.reduce(
    (sum, e) =>
      sum + ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
    0
  );

  const previousNetProfit = previousRevenue - previousCOGS - previousExpenses;
  const revenueGrowthPct = calcGrowth(totalRevenue, previousRevenue);
  const transactionsGrowthPct = calcGrowth(paidSales.length, prevPaidSales.length);
  const netProfitGrowthPct = calcGrowth(netProfit, previousNetProfit);

  // ── Daily chart data ───────────────────────────────────────────────────────
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const chartData = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");

    const daySales = paidSales.filter(
      (s) => format(new Date(s.createdAt), "yyyy-MM-dd") === dayStr
    );

    const dayRevenue = daySales.reduce(
      (sum, s) =>
        sum +
        (typeof s.totalAmount === "number"
          ? s.totalAmount
          : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
      0
    );

    const dayCOGS = daySales.reduce((sum, s) => {
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

    const dayGrossProfit = dayRevenue - dayCOGS;
    const dayNetProfit = dayGrossProfit - dayExpenses;

    return {
      date: dayStr,
      label:
        timeframe === "weekly"
          ? format(day, "EEE d")
          : format(day, "MMM d"),
      revenue: dayRevenue,
      cogs: dayCOGS,
      expenses: dayExpenses,
      grossProfit: dayGrossProfit,
      netProfit: dayNetProfit,
      transactions: daySales.length,
    };
  });

  // ── Interval Sub-Breakdown ────────────────────────────────────────────────
  // In Weekly: 7 days of the week (Mon to Sun)
  // In Monthly: Weeks of the month (Week 1, 2, 3, 4, 5)
  let intervalBreakdown: EnterpriseReportResult["intervalBreakdown"] = [];

  if (timeframe === "weekly") {
    intervalBreakdown = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySales = paidSales.filter(
        (s) => format(new Date(s.createdAt), "yyyy-MM-dd") === dayStr
      );
      const rev = daySales.reduce(
        (sum, s) =>
          sum +
          (typeof s.totalAmount === "number"
            ? s.totalAmount
            : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
        0
      );
      const cogs = daySales.reduce((sum, s) => {
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
      const exp = expenses
        .filter((e) => format(new Date(e.date), "yyyy-MM-dd") === dayStr)
        .reduce(
          (sum, e) =>
            sum + ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
          0
        );
      const gp = rev - cogs;
      const np = gp - exp;

      return {
        label: format(day, "EEEE (MMM d)"),
        startDate: dayStr,
        endDate: dayStr,
        revenue: rev,
        cogs,
        expenses: exp,
        grossProfit: gp,
        netProfit: np,
        transactions: daySales.length,
        grossMargin: rev > 0 ? (gp / rev) * 100 : 0,
      };
    });
  } else {
    // Break into calendar weeks within the month
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    );

    intervalBreakdown = weeks.map((wStart, idx) => {
      const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
      const actualStart = wStart < startDate ? startDate : wStart;
      const actualEnd = wEnd > endDate ? endDate : wEnd;

      const weekSales = paidSales.filter((s) => {
        const d = new Date(s.createdAt);
        return d >= actualStart && d <= actualEnd;
      });

      const rev = weekSales.reduce(
        (sum, s) =>
          sum +
          (typeof s.totalAmount === "number"
            ? s.totalAmount
            : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0),
        0
      );

      const cogs = weekSales.reduce((sum, s) => {
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

      const exp = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d >= actualStart && d <= actualEnd;
        })
        .reduce(
          (sum, e) =>
            sum + ((e.amount as any).toNumber?.() || Number(e.amount) || 0),
          0
        );

      const gp = rev - cogs;
      const np = gp - exp;

      return {
        label: `Week ${idx + 1} (${format(actualStart, "MMM d")} – ${format(
          actualEnd,
          "MMM d"
        )})`,
        startDate: format(actualStart, "yyyy-MM-dd"),
        endDate: format(actualEnd, "yyyy-MM-dd"),
        revenue: rev,
        cogs,
        expenses: exp,
        grossProfit: gp,
        netProfit: np,
        transactions: weekSales.length,
        grossMargin: rev > 0 ? (gp / rev) * 100 : 0,
      };
    });
  }

  // ── Inventory Snapshot & Valuations ───────────────────────────────────────
  let totalStockCostValuation = 0;
  let totalStockRetailValuation = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const inventorySnapshot: EnterpriseReportResult["inventorySnapshot"] =
    activeProducts.map((p) => {
      const stock = Number(p.stockQuantity) || 0;
      const cost = Number(p.costPrice) || 0;
      const price = Number(p.unitPrice) || 0;
      const costVal = stock * cost;
      const retailVal = stock * price;

      totalStockCostValuation += costVal;
      totalStockRetailValuation += retailVal;

      let status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK" = "NORMAL";
      if (stock <= 0) {
        status = "OUT_OF_STOCK";
        outOfStockCount++;
      } else if (stock <= p.minStockLevel) {
        status = "LOW_STOCK";
        lowStockCount++;
      }

      return {
        name: p.name,
        sku: p.sku || p.barcode || "N/A",
        category: p.category?.name || "General",
        currentStock: stock,
        costPrice: cost,
        unitPrice: price,
        costValuation: costVal,
        retailValuation: retailVal,
        potentialProfit: retailVal - costVal,
        status,
      };
    });

  // ── Top Products & Margins ────────────────────────────────────────────────
  const productMap: Record<
    string,
    {
      name: string;
      category: string;
      qtySold: number;
      unitPrice: number;
      costPrice: number;
      revenue: number;
      cogs: number;
    }
  > = {};

  for (const sale of paidSales) {
    for (const item of sale.items) {
      const key = item.productId || item.productName || "unknown";
      const name = item.productName || item.product?.name || "Unknown";
      const category = item.product?.category?.name || "General";
      const itemTotal =
        typeof item.total === "number"
          ? item.total
          : (item.total as any).toNumber?.() || Number(item.total) || 0;
      const cost = item.product?.costPrice
        ? (item.product.costPrice as any).toNumber?.() ||
          Number(item.product.costPrice)
        : 0;

      if (!productMap[key]) {
        productMap[key] = {
          name,
          category,
          qtySold: 0,
          unitPrice: Number(item.price) || 0,
          costPrice: cost,
          revenue: 0,
          cogs: 0,
        };
      }
      productMap[key].qtySold += item.quantity;
      productMap[key].revenue += itemTotal;
      productMap[key].cogs += cost * item.quantity;
    }
  }

  const topProducts = Object.values(productMap)
    .map((p) => {
      const grossProfit = p.revenue - p.cogs;
      const marginPct = p.revenue > 0 ? (grossProfit / p.revenue) * 100 : 0;
      return {
        ...p,
        grossProfit,
        marginPct,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 25);

  // ── Staff Performance ─────────────────────────────────────────────────────
  const staffMap: Record<
    string,
    { name: string; email: string; transactions: number; totalRevenue: number }
  > = {};

  for (const sale of paidSales) {
    const sName = sale.staffName || sale.user?.name || "Cashier Staff";
    const sEmail = sale.user?.email || "staff@system.local";
    const key = sale.staffId || sale.userId || sName;

    if (!staffMap[key]) {
      staffMap[key] = {
        name: sName,
        email: sEmail,
        transactions: 0,
        totalRevenue: 0,
      };
    }
    staffMap[key].transactions++;
    staffMap[key].totalRevenue +=
      typeof sale.totalAmount === "number"
        ? sale.totalAmount
        : (sale.totalAmount as any).toNumber?.() || Number(sale.totalAmount) || 0;
  }

  const staffPerformance = Object.values(staffMap)
    .map((st) => ({
      ...st,
      avgTransaction: st.transactions > 0 ? st.totalRevenue / st.transactions : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // ── Customer Analysis ─────────────────────────────────────────────────────
  const customerMap: Record<
    string,
    { name: string; phone: string; transactions: number; totalSpent: number }
  > = {};
  let walkInRevenue = 0;
  let registeredCustomerRevenue = 0;

  for (const sale of paidSales) {
    const amount =
      typeof sale.totalAmount === "number"
        ? sale.totalAmount
        : (sale.totalAmount as any).toNumber?.() || Number(sale.totalAmount) || 0;

    if (sale.customer) {
      registeredCustomerRevenue += amount;
      const cKey = sale.customerId || sale.customer.name;
      if (!customerMap[cKey]) {
        customerMap[cKey] = {
          name: sale.customer.name,
          phone: sale.customer.phone || "N/A",
          transactions: 0,
          totalSpent: 0,
        };
      }
      customerMap[cKey].transactions++;
      customerMap[cKey].totalSpent += amount;
    } else {
      walkInRevenue += amount;
    }
  }

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 15);

  // ── Expense Category Breakdown ────────────────────────────────────────────
  const expCatMap: Record<string, { total: number; count: number }> = {};
  for (const exp of expenses) {
    const cat = exp.category || "General Operating";
    const amt = (exp.amount as any).toNumber?.() || Number(exp.amount) || 0;
    if (!expCatMap[cat]) expCatMap[cat] = { total: 0, count: 0 };
    expCatMap[cat].total += amt;
    expCatMap[cat].count++;
  }

  const expenseCategoryBreakdown = Object.entries(expCatMap).map(
    ([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalExpensesAmt > 0 ? (data.total / totalExpensesAmt) * 100 : 0,
    })
  );

  // ── Supplier Purchases Breakdown ──────────────────────────────────────────
  const supMap: Record<string, { totalSpent: number; purchaseCount: number }> = {};
  for (const pur of purchases) {
    const sName = pur.supplier?.name || "Direct Vendor";
    const amt =
      (pur.totalAmount as any).toNumber?.() || Number(pur.totalAmount) || 0;
    if (!supMap[sName]) supMap[sName] = { totalSpent: 0, purchaseCount: 0 };
    supMap[sName].totalSpent += amt;
    supMap[sName].purchaseCount++;
  }

  const supplierBreakdown = Object.entries(supMap).map(([supplier, data]) => ({
    supplier,
    totalSpent: data.totalSpent,
    purchaseCount: data.purchaseCount,
  }));

  // ── Payment Tender Breakdown ──────────────────────────────────────────────
  const payMap: Record<string, { total: number; count: number }> = {};
  for (const sale of paidSales) {
    const method = sale.paymentMethod || "CASH";
    const amt =
      typeof sale.totalAmount === "number"
        ? sale.totalAmount
        : (sale.totalAmount as any).toNumber?.() || Number(sale.totalAmount) || 0;
    if (!payMap[method]) payMap[method] = { total: 0, count: 0 };
    payMap[method].total += amt;
    payMap[method].count++;
  }

  const paymentBreakdown = Object.entries(payMap).map(([method, data]) => ({
    method,
    total: data.total,
    count: data.count,
    percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0,
  }));

  // ── Sales Rows for Export ─────────────────────────────────────────────────
  const salesRows = sales.map((s) => ({
    invoiceNumber: s.invoiceNumber,
    date: format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"),
    customer: s.customer?.name || "Walk-in Customer",
    staff: s.staffName || s.user?.name || "System Cashier",
    paymentMethod: s.paymentMethod,
    paymentStatus: s.paymentStatus,
    items: s.items.length,
    totalAmount:
      typeof s.totalAmount === "number"
        ? s.totalAmount
        : (s.totalAmount as any).toNumber?.() || Number(s.totalAmount) || 0,
    tax:
      typeof s.tax === "number"
        ? s.tax
        : (s.tax as any).toNumber?.() || Number(s.tax) || 0,
    discount:
      typeof s.discount === "number"
        ? s.discount
        : (s.discount as any).toNumber?.() || Number(s.discount) || 0,
  }));

  const purchaseRows = purchases.map((p) => ({
    invoiceNumber: p.invoiceNumber || "N/A",
    date: format(new Date(p.createdAt), "yyyy-MM-dd HH:mm"),
    supplier: p.supplier?.name || "Direct Vendor",
    items: p.items.length,
    totalAmount:
      (p.totalAmount as any).toNumber?.() || Number(p.totalAmount) || 0,
  }));

  const expenseRows = expenses.map((e) => ({
    description: e.description,
    category: e.category || "General",
    date: format(new Date(e.date), "yyyy-MM-dd"),
    amount: (e.amount as any).toNumber?.() || Number(e.amount) || 0,
    recordedBy: e.user?.name || "Admin",
  }));

  return {
    currency: business?.currency || "SLL",
    businessName: business?.name || "ProTech Enterprise OS",
    timeframe,
    periodLabel,
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
      totalCreditSales,
      previousRevenue,
      revenueGrowthPct,
      previousTransactions: prevPaidSales.length,
      transactionsGrowthPct,
      previousNetProfit,
      netProfitGrowthPct,
      previousCOGS,
      previousExpenses,
      totalStockCostValuation,
      totalStockRetailValuation,
      lowStockCount,
      outOfStockCount,
      totalProductsCount: activeProducts.length,
    },
    chartData,
    intervalBreakdown,
    salesRows,
    purchaseRows,
    expenseRows,
    topProducts,
    inventorySnapshot,
    staffPerformance,
    customerBreakdown: {
      topCustomers,
      walkInRevenue,
      registeredCustomerRevenue,
    },
    expenseCategoryBreakdown,
    supplierBreakdown,
    paymentBreakdown,
  };
}
