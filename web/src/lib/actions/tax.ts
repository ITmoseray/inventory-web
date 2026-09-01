"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

function serializeTax(t: any) {
  return {
    ...t,
    taxableAmount: Number(t.taxableAmount || 0),
    taxRate: Number(t.taxRate || 0),
    taxAmount: Number(t.taxAmount || 0),
    paidAmount: Number(t.paidAmount || 0),
    paymentDate: t.paymentDate ? t.paymentDate.toISOString() : null,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    updatedAt: t.updatedAt?.toISOString?.() ?? t.updatedAt,
    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
  };
}

export async function getTaxRecords(filters?: {
  taxType?: string;
  paymentStatus?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const where: any = {
    businessId,
    deletedAt: null,
  };

  if (filters?.taxType && filters.taxType !== "ALL") {
    where.taxType = filters.taxType;
  }

  if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim();
    where.OR = [
      { taxName: { contains: s, mode: "insensitive" } },
      { taxAuthority: { contains: s, mode: "insensitive" } },
      { taxPeriod: { contains: s, mode: "insensitive" } },
      { referenceNumber: { contains: s, mode: "insensitive" } },
      { tinNumber: { contains: s, mode: "insensitive" } },
    ];
  }

  const records = await prisma.taxRecord.findMany({
    where,
    orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
  });

  return records.map(serializeTax);
}

export async function getTaxAnalytics() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  // 1. Fetch all tax records for this business
  const records = await prisma.taxRecord.findMany({
    where: { businessId, deletedAt: null },
    orderBy: { paymentDate: "desc" },
  });

  // 2. Aggregate metrics
  let totalTaxesAssessed = 0;
  let totalTaxesPaid = 0;
  let totalPendingLiabilities = 0;

  const byType: Record<string, { count: number; assessed: number; paid: number }> = {
    GST_15: { count: 0, assessed: 0, paid: 0 },
    PAYE_PAYROLL: { count: 0, assessed: 0, paid: 0 },
    WITHHOLDING_TAX: { count: 0, assessed: 0, paid: 0 },
    CORPORATE_INCOME_TAX: { count: 0, assessed: 0, paid: 0 },
    CUSTOMS_DUTY: { count: 0, assessed: 0, paid: 0 },
    CITY_COUNCIL_RATES: { count: 0, assessed: 0, paid: 0 },
    TRADE_LICENSE: { count: 0, assessed: 0, paid: 0 },
    OTHER: { count: 0, assessed: 0, paid: 0 },
  };

  records.forEach((r) => {
    const assessed = Number(r.taxAmount || 0);
    const paid = Number(r.paidAmount || 0);
    totalTaxesAssessed += assessed;
    totalTaxesPaid += paid;

    if (r.paymentStatus === "PENDING" || r.paymentStatus === "PARTIAL" || r.paymentStatus === "OVERDUE") {
      totalPendingLiabilities += Math.max(0, assessed - paid);
    }

    const typeKey = byType[r.taxType] ? r.taxType : "OTHER";
    byType[typeKey].count += 1;
    byType[typeKey].assessed += assessed;
    byType[typeKey].paid += paid;
  });

  // 3. Fetch sales for GST context
  const paidSales = await prisma.sale.findMany({
    where: { businessId, paymentStatus: "PAID", deletedAt: null },
    select: { totalAmount: true, createdAt: true },
  });
  const grossSalesRevenue = paidSales.reduce((acc, s) => acc + Number(s.totalAmount), 0);
  const estimatedSalesGst = grossSalesRevenue - (grossSalesRevenue / 1.15);

  return {
    totalTaxesAssessed,
    totalTaxesPaid,
    totalPendingLiabilities,
    recordCount: records.length,
    byType,
    grossSalesRevenue,
    estimatedSalesGst,
    recentRecords: records.slice(0, 5).map(serializeTax),
  };
}

export async function createTaxRecord(data: {
  taxType: string;
  taxName: string;
  taxAuthority?: string;
  taxPeriod: string;
  taxableAmount?: number;
  taxRate?: number;
  taxAmount: number;
  paidAmount?: number;
  paymentStatus?: string;
  paymentDate?: string | Date | null;
  dueDate?: string | Date | null;
  paymentMethod?: string;
  referenceNumber?: string;
  tinNumber?: string;
  receiptFileUrl?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  if (!data.taxName || !data.taxPeriod || data.taxAmount === undefined) {
    throw new Error("Missing required tax information");
  }

  const taxAmountNum = Number(data.taxAmount || 0);
  const paidAmountNum = Number(data.paidAmount ?? taxAmountNum);

  // Auto-calculate payment status if not explicitly given
  let calculatedStatus = data.paymentStatus || "PAID";
  if (!data.paymentStatus) {
    if (paidAmountNum >= taxAmountNum) {
      calculatedStatus = "PAID";
    } else if (paidAmountNum > 0) {
      calculatedStatus = "PARTIAL";
    } else {
      calculatedStatus = "PENDING";
    }
  }

  const newRecord = await prisma.taxRecord.create({
    data: {
      businessId,
      taxType: data.taxType || "GST_15",
      taxName: data.taxName,
      taxAuthority: data.taxAuthority || "National Revenue Authority (NRA)",
      taxPeriod: data.taxPeriod,
      taxableAmount: data.taxableAmount ?? 0,
      taxRate: data.taxRate ?? 0,
      taxAmount: taxAmountNum,
      paidAmount: paidAmountNum,
      paymentStatus: calculatedStatus,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paymentMethod: data.paymentMethod || "BANK_TRANSFER",
      referenceNumber: data.referenceNumber || null,
      tinNumber: data.tinNumber || null,
      receiptFileUrl: data.receiptFileUrl || null,
      notes: data.notes || null,
      recordedById: session.user.id,
    },
  });

  try {
    await logAudit({
      businessId,
      userId: session.user.id,
      action: "CREATE",
      entity: "TAX_RECORD",
      details: `Recorded tax filing: ${data.taxName} (${data.taxType}) for ${data.taxPeriod} of amount Le ${taxAmountNum.toLocaleString()}`,
    });
  } catch (e) {
    console.error("Audit log failed for tax record", e);
  }

  revalidatePath("/dashboard/accounting/taxes");
  revalidatePath("/dashboard/accounting");
  revalidatePath("/dashboard/reports");

  return serializeTax(newRecord);
}

export async function updateTaxRecord(
  id: string,
  data: {
    taxType?: string;
    taxName?: string;
    taxAuthority?: string;
    taxPeriod?: string;
    taxableAmount?: number;
    taxRate?: number;
    taxAmount?: number;
    paidAmount?: number;
    paymentStatus?: string;
    paymentDate?: string | Date | null;
    dueDate?: string | Date | null;
    paymentMethod?: string;
    referenceNumber?: string;
    tinNumber?: string;
    receiptFileUrl?: string;
    notes?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const existing = await prisma.taxRecord.findUnique({
    where: { id, businessId, deletedAt: null },
  });
  if (!existing) throw new Error("Tax record not found");

  const taxAmountNum = data.taxAmount !== undefined ? Number(data.taxAmount) : Number(existing.taxAmount);
  const paidAmountNum = data.paidAmount !== undefined ? Number(data.paidAmount) : Number(existing.paidAmount);

  let updatedStatus = data.paymentStatus || existing.paymentStatus;
  if (!data.paymentStatus) {
    if (paidAmountNum >= taxAmountNum) {
      updatedStatus = "PAID";
    } else if (paidAmountNum > 0) {
      updatedStatus = "PARTIAL";
    } else {
      updatedStatus = "PENDING";
    }
  }

  const updated = await prisma.taxRecord.update({
    where: { id },
    data: {
      ...(data.taxType && { taxType: data.taxType }),
      ...(data.taxName && { taxName: data.taxName }),
      ...(data.taxAuthority && { taxAuthority: data.taxAuthority }),
      ...(data.taxPeriod && { taxPeriod: data.taxPeriod }),
      ...(data.taxableAmount !== undefined && { taxableAmount: data.taxableAmount }),
      ...(data.taxRate !== undefined && { taxRate: data.taxRate }),
      ...(data.taxAmount !== undefined && { taxAmount: taxAmountNum }),
      ...(data.paidAmount !== undefined && { paidAmount: paidAmountNum }),
      paymentStatus: updatedStatus,
      ...(data.paymentDate !== undefined && {
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      ...(data.referenceNumber !== undefined && { referenceNumber: data.referenceNumber }),
      ...(data.tinNumber !== undefined && { tinNumber: data.tinNumber }),
      ...(data.receiptFileUrl !== undefined && { receiptFileUrl: data.receiptFileUrl }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  try {
    await logAudit({
      businessId,
      userId: session.user.id,
      action: "UPDATE",
      entity: "TAX_RECORD",
      details: `Updated tax filing: ${updated.taxName} (${updated.taxType}) for ${updated.taxPeriod}`,
    });
  } catch (e) {
    console.error("Audit log failed for tax record update", e);
  }

  revalidatePath("/dashboard/accounting/taxes");
  revalidatePath("/dashboard/accounting");
  revalidatePath("/dashboard/reports");

  return serializeTax(updated);
}

export async function deleteTaxRecord(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const existing = await prisma.taxRecord.findUnique({
    where: { id, businessId, deletedAt: null },
  });
  if (!existing) throw new Error("Tax record not found");

  await prisma.taxRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  try {
    await logAudit({
      businessId,
      userId: session.user.id,
      action: "DELETE",
      entity: "TAX_RECORD",
      details: `Deleted tax record: ${existing.taxName} (${existing.taxType}) of Le ${Number(existing.taxAmount).toLocaleString()}`,
    });
  } catch (e) {
    console.error("Audit log failed for tax record deletion", e);
  }

  revalidatePath("/dashboard/accounting/taxes");
  revalidatePath("/dashboard/accounting");
  revalidatePath("/dashboard/reports");

  return { success: true };
}
