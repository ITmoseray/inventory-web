"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, format } from "date-fns";

export interface RecordSimpleDailyEntryInput {
  id?: string;
  date: string; // YYYY-MM-DD or ISO string
  totalSales: number;
  totalPurchases: number;
  otherIncome?: number;
  expenses: number;
  notes?: string;
}

export async function recordSimpleDailyEntry(input: RecordSimpleDailyEntryInput) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized. Please sign in.");
  }

  const businessId = session.user.businessId;
  const userId = session.user.id;

  // Validation
  if (!input.date) {
    throw new Error("Date is required.");
  }

  const totalSales = Number(input.totalSales) || 0;
  const totalPurchases = Number(input.totalPurchases) || 0;
  const otherIncome = Number(input.otherIncome) || 0;
  const expenses = Number(input.expenses) || 0;

  if (totalSales < 0) throw new Error("Total Sales cannot be negative.");
  if (totalPurchases < 0) throw new Error("Total Stock/Purchases cannot be negative.");
  if (otherIncome < 0) throw new Error("Other Income cannot be negative.");
  if (expenses < 0) throw new Error("Expenses cannot be negative.");

  // Mathematical Calculations
  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit + otherIncome - expenses;

  // Normalize date to UTC start of day
  const rawDate = parseISO(input.date);
  const entryDate = startOfDay(isNaN(rawDate.getTime()) ? new Date(input.date) : rawDate);

  let result;
  if (input.id) {
    // Verify ownership
    const existing = await prisma.simpleDailyEntry.findFirst({
      where: { id: input.id, businessId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Record not found or access denied.");
    }

    result = await prisma.simpleDailyEntry.update({
      where: { id: input.id },
      data: {
        date: entryDate,
        totalSales,
        totalPurchases,
        otherIncome,
        expenses,
        grossProfit,
        netProfit,
        notes: input.notes?.trim() || null,
        userId,
      },
    });
  } else {
    // Check if an entry already exists for this date for this business
    const existingForDate = await prisma.simpleDailyEntry.findFirst({
      where: {
        businessId,
        date: {
          gte: startOfDay(entryDate),
          lte: endOfDay(entryDate),
        },
        deletedAt: null,
      },
    });

    if (existingForDate) {
      // Update existing entry for the day
      result = await prisma.simpleDailyEntry.update({
        where: { id: existingForDate.id },
        data: {
          totalSales,
          totalPurchases,
          otherIncome,
          expenses,
          grossProfit,
          netProfit,
          notes: input.notes?.trim() || existingForDate.notes,
          userId,
        },
      });
    } else {
      // Create new record
      result = await prisma.simpleDailyEntry.create({
        data: {
          businessId,
          userId,
          date: entryDate,
          totalSales,
          totalPurchases,
          otherIncome,
          expenses,
          grossProfit,
          netProfit,
          notes: input.notes?.trim() || null,
        },
      });
    }
  }

  // Also log audit entry
  try {
    await prisma.auditLog.create({
      data: {
        action: input.id ? "UPDATED_SIMPLE_DAILY_ENTRY" : "CREATED_SIMPLE_DAILY_ENTRY",
        entity: "SIMPLE_FINANCIAL_ENTRY",
        entityId: result.id,
        userId,
        businessId,
        newData: {
          date: input.date,
          totalSales,
          totalPurchases,
          expenses,
          grossProfit,
          netProfit,
        },
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/simple-sales");
  revalidatePath("/dashboard/simple-purchases");
  revalidatePath("/dashboard/simple-profit-loss");
  revalidatePath("/dashboard/simple-reports");

  return {
    success: true,
    entry: {
      ...result,
      totalSales: Number(result.totalSales),
      totalPurchases: Number(result.totalPurchases),
      otherIncome: Number(result.otherIncome),
      expenses: Number(result.expenses),
      grossProfit: Number(result.grossProfit),
      netProfit: Number(result.netProfit),
      date: result.date.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    },
  };
}

export async function getSimpleDashboardMetrics() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const sevenDaysAgo = startOfDay(subDays(now, 6));

  const [todayEntries, monthEntries, last7DaysEntries, recentEntries, business] = await Promise.all([
    prisma.simpleDailyEntry.findMany({
      where: { businessId, date: { gte: todayStart, lte: todayEnd }, deletedAt: null },
    }),
    prisma.simpleDailyEntry.findMany({
      where: { businessId, date: { gte: monthStart, lte: monthEnd }, deletedAt: null },
    }),
    prisma.simpleDailyEntry.findMany({
      where: { businessId, date: { gte: sevenDaysAgo, lte: todayEnd }, deletedAt: null },
      orderBy: { date: "asc" },
    }),
    prisma.simpleDailyEntry.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { date: "desc" },
      take: 15,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true, name: true },
    }),
  ]);

  // Today Totals
  const todayTotals = todayEntries.reduce(
    (acc, curr) => ({
      sales: acc.sales + Number(curr.totalSales),
      purchases: acc.purchases + Number(curr.totalPurchases),
      otherIncome: acc.otherIncome + Number(curr.otherIncome),
      expenses: acc.expenses + Number(curr.expenses),
      grossProfit: acc.grossProfit + Number(curr.grossProfit),
      netProfit: acc.netProfit + Number(curr.netProfit),
      hasEntry: true,
      lastUpdated: curr.updatedAt.toISOString(),
      notes: curr.notes,
      id: curr.id,
    }),
    { sales: 0, purchases: 0, otherIncome: 0, expenses: 0, grossProfit: 0, netProfit: 0, hasEntry: false, lastUpdated: null as string | null, notes: null as string | null, id: null as string | null }
  );

  // Month Totals
  const monthTotals = monthEntries.reduce(
    (acc, curr) => ({
      sales: acc.sales + Number(curr.totalSales),
      purchases: acc.purchases + Number(curr.totalPurchases),
      otherIncome: acc.otherIncome + Number(curr.otherIncome),
      expenses: acc.expenses + Number(curr.expenses),
      grossProfit: acc.grossProfit + Number(curr.grossProfit),
      netProfit: acc.netProfit + Number(curr.netProfit),
      count: acc.count + 1,
    }),
    { sales: 0, purchases: 0, otherIncome: 0, expenses: 0, grossProfit: 0, netProfit: 0, count: 0 }
  );

  // 7-day trend chart formatted data
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(subDays(now, i));
    const dayStr = format(d, "EEE dd");
    const found = last7DaysEntries.find(e => format(e.date, "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
    trendData.push({
      day: dayStr,
      date: format(d, "yyyy-MM-dd"),
      sales: found ? Number(found.totalSales) : 0,
      purchases: found ? Number(found.totalPurchases) : 0,
      expenses: found ? Number(found.expenses) : 0,
      netProfit: found ? Number(found.netProfit) : 0,
    });
  }

  return {
    currency: business?.currency || "SLL",
    businessName: business?.name || "My Business",
    today: todayTotals,
    month: monthTotals,
    trends: trendData,
    recentEntries: recentEntries.map(e => ({
      ...e,
      totalSales: Number(e.totalSales),
      totalPurchases: Number(e.totalPurchases),
      otherIncome: Number(e.otherIncome),
      expenses: Number(e.expenses),
      grossProfit: Number(e.grossProfit),
      netProfit: Number(e.netProfit),
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  };
}

export async function getSimpleDailyEntries(filters?: { startDate?: string; endDate?: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;
  const where: any = { businessId, deletedAt: null };

  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: startOfDay(parseISO(filters.startDate)),
      lte: endOfDay(parseISO(filters.endDate)),
    };
  }

  const entries = await prisma.simpleDailyEntry.findMany({
    where,
    orderBy: { date: "desc" },
    take: filters?.limit || 50,
    include: {
      user: { select: { name: true } },
    },
  });

  return entries.map(e => ({
    ...e,
    totalSales: Number(e.totalSales),
    totalPurchases: Number(e.totalPurchases),
    otherIncome: Number(e.otherIncome),
    expenses: Number(e.expenses),
    grossProfit: Number(e.grossProfit),
    netProfit: Number(e.netProfit),
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
}

export async function getSimpleReports(
  timeframe: "daily" | "weekly" | "monthly" | "custom" = "monthly",
  customRange?: { start?: string; end?: string }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);

  switch (timeframe) {
    case "daily":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case "weekly":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "monthly":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case "custom":
      startDate = customRange?.start ? startOfDay(parseISO(customRange.start)) : startOfMonth(now);
      endDate = customRange?.end ? endOfDay(parseISO(customRange.end)) : endOfDay(now);
      break;
    default:
      startDate = startOfMonth(now);
  }

  const [entries, business] = await Promise.all([
    prisma.simpleDailyEntry.findMany({
      where: {
        businessId,
        date: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      orderBy: { date: "asc" },
      include: {
        user: { select: { name: true } },
      },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true, name: true },
    }),
  ]);

  const summary = entries.reduce(
    (acc, e) => {
      const sales = Number(e.totalSales);
      const purchases = Number(e.totalPurchases);
      const otherIncome = Number(e.otherIncome);
      const exp = Number(e.expenses);
      const gross = Number(e.grossProfit);
      const net = Number(e.netProfit);

      return {
        totalSales: acc.totalSales + sales,
        totalPurchases: acc.totalPurchases + purchases,
        totalOtherIncome: acc.totalOtherIncome + otherIncome,
        totalExpenses: acc.totalExpenses + exp,
        grossProfit: acc.grossProfit + gross,
        netProfit: acc.netProfit + net,
        count: acc.count + 1,
      };
    },
    {
      totalSales: 0,
      totalPurchases: 0,
      totalOtherIncome: 0,
      totalExpenses: 0,
      grossProfit: 0,
      netProfit: 0,
      count: 0,
    }
  );

  const grossMargin = summary.totalSales > 0 ? ((summary.grossProfit / summary.totalSales) * 100).toFixed(1) : "0.0";
  const netMargin = summary.totalSales > 0 ? ((summary.netProfit / summary.totalSales) * 100).toFixed(1) : "0.0";

  const chartData = entries.map(e => ({
    date: format(e.date, "yyyy-MM-dd"),
    label: format(e.date, "MMM dd"),
    sales: Number(e.totalSales),
    purchases: Number(e.totalPurchases),
    expenses: Number(e.expenses),
    grossProfit: Number(e.grossProfit),
    netProfit: Number(e.netProfit),
  }));

  return {
    currency: business?.currency || "SLL",
    businessName: business?.name || "Business",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    timeframe,
    summary: {
      ...summary,
      grossMargin: Number(grossMargin),
      netMargin: Number(netMargin),
    },
    chartData,
    entries: entries.map(e => ({
      ...e,
      totalSales: Number(e.totalSales),
      totalPurchases: Number(e.totalPurchases),
      otherIncome: Number(e.otherIncome),
      expenses: Number(e.expenses),
      grossProfit: Number(e.grossProfit),
      netProfit: Number(e.netProfit),
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  };
}

export async function deleteSimpleDailyEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.businessId) {
    throw new Error("Unauthorized.");
  }

  const businessId = session.user.businessId;

  const existing = await prisma.simpleDailyEntry.findFirst({
    where: { id, businessId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Record not found or already deleted.");
  }

  await prisma.simpleDailyEntry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/simple-sales");
  revalidatePath("/dashboard/simple-purchases");
  revalidatePath("/dashboard/simple-profit-loss");
  revalidatePath("/dashboard/simple-reports");

  return { success: true };
}
