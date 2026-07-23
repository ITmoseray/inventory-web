"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

function serializeSupplier(s: any) {
  return {
    ...s,
    createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
    updatedAt: s.updatedAt?.toISOString?.() ?? s.updatedAt,
    deletedAt: s.deletedAt?.toISOString?.() ?? null,
  };
}

export async function getSuppliers() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const suppliers = await prisma.supplier.findMany({
    where: { businessId: session.user.businessId, deletedAt: null },
    include: {
      purchases: {
        where: { deletedAt: null },
        select: { totalAmount: true, paidAmount: true, paymentStatus: true, createdAt: true },
      },
      payments: { select: { amount: true, paymentDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return suppliers.map(s => {
    const totalPurchased = s.purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
    const totalPaid = s.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const outstandingBalance = s.purchases.reduce((sum, p) => {
      return sum + (Number(p.totalAmount) - Number(p.paidAmount));
    }, 0);
    return {
      ...serializeSupplier(s),
      purchases: undefined,
      payments: undefined,
      totalPurchased,
      totalPaid,
      outstandingBalance,
    };
  });
}

export async function getSupplierDetails(supplierId: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, businessId: session.user.businessId, deletedAt: null },
    include: {
      purchases: {
        where: { deletedAt: null },
        include: { items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!supplier) throw new Error("Supplier not found");

  const totalPurchased = supplier.purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalPaid = supplier.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstandingBalance = supplier.purchases.reduce((sum, p) => {
    return sum + (Number(p.totalAmount) - Number(p.paidAmount));
  }, 0);

  // Build statement: merge purchases and payments, sorted by date
  const purchaseTxns = supplier.purchases.map(p => ({
    date: p.createdAt.toISOString(),
    type: "PURCHASE" as const,
    reference: p.invoiceNumber || p.id.slice(-8),
    debit: Number(p.totalAmount),
    credit: 0,
    paymentStatus: p.paymentStatus,
    id: p.id,
  }));

  const paymentTxns = supplier.payments.map(p => ({
    date: p.paymentDate.toISOString(),
    type: "PAYMENT" as const,
    reference: p.referenceNumber || p.id.slice(-8),
    debit: 0,
    credit: Number(p.amount),
    paymentStatus: "PAID",
    id: p.id,
  }));

  const allTxns = [...purchaseTxns, ...paymentTxns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = 0;
  const statement = allTxns.map(txn => {
    runningBalance += txn.debit - txn.credit;
    return { ...txn, balance: runningBalance };
  });

  return {
    ...serializeSupplier(supplier),
    totalPurchased,
    totalPaid,
    outstandingBalance,
    statement,
    purchases: supplier.purchases.map(p => ({
      ...p,
      totalAmount: Number(p.totalAmount),
      paidAmount: Number(p.paidAmount),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt?.toISOString() ?? null,
      dueDate: p.dueDate?.toISOString() ?? null,
      items: p.items.map(i => ({
        ...i,
        unitCost: Number(i.unitCost),
        total: Number(i.total),
      })),
    })),
    payments: supplier.payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
}

export async function createSupplier(data: {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const supplier = await prisma.supplier.create({
    data: { ...data, businessId: session.user.businessId },
  });

  await logAudit({ action: `Created Supplier: ${supplier.name}`, entity: "SUPPLIER", entityId: supplier.id, newData: supplier });
  revalidatePath("/dashboard/purchases/suppliers");
  return serializeSupplier(supplier);
}

export async function updateSupplier(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const supplier = await prisma.supplier.update({
    where: { id, businessId: session.user.businessId },
    data,
  });

  await logAudit({ action: `Updated Supplier: ${supplier.name}`, entity: "SUPPLIER", entityId: supplier.id, newData: supplier });
  revalidatePath("/dashboard/purchases/suppliers");
  return serializeSupplier(supplier);
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  await prisma.supplier.update({
    where: { id, businessId: session.user.businessId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/purchases/suppliers");
  return { success: true };
}

export async function getPurchaseAnalytics() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const purchases = await prisma.purchase.findMany({
    where: { businessId: session.user.businessId, deletedAt: null },
    include: {
      supplier: { select: { name: true } },
      items: { include: { product: { select: { name: true, categoryId: true, category: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSpend = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalOutstanding = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) - Number(p.paidAmount)), 0);
  const totalPaid = totalSpend - totalOutstanding;

  // By supplier
  const bySupplier: Record<string, { name: string; total: number; count: number }> = {};
  for (const p of purchases) {
    const key = p.supplierId || "unknown";
    const name = p.supplier?.name || "No Supplier";
    if (!bySupplier[key]) bySupplier[key] = { name, total: 0, count: 0 };
    bySupplier[key].total += Number(p.totalAmount);
    bySupplier[key].count += 1;
  }

  // By category
  const byCategory: Record<string, { name: string; total: number }> = {};
  for (const p of purchases) {
    for (const item of p.items) {
      const catName = (item.product as any)?.category?.name || "Uncategorized";
      if (!byCategory[catName]) byCategory[catName] = { name: catName, total: 0 };
      byCategory[catName].total += Number(item.total);
    }
  }

  // Aging (by due date)
  const now = new Date();
  let aging = { current: 0, days30: 0, days60: 0, overdue60: 0 };
  for (const p of purchases) {
    if (p.paymentStatus === "PAID") continue;
    const outstanding = Number(p.totalAmount) - Number(p.paidAmount);
    if (!p.dueDate) { aging.current += outstanding; continue; }
    const daysOverdue = Math.floor((now.getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) aging.current += outstanding;
    else if (daysOverdue <= 30) aging.days30 += outstanding;
    else if (daysOverdue <= 60) aging.days60 += outstanding;
    else aging.overdue60 += outstanding;
  }

  // Monthly spend (last 6 months)
  const monthlySpend: Record<string, number> = {};
  for (const p of purchases) {
    const month = p.createdAt.toISOString().slice(0, 7);
    if (!monthlySpend[month]) monthlySpend[month] = 0;
    monthlySpend[month] += Number(p.totalAmount);
  }

  return {
    totalSpend,
    totalPaid,
    totalOutstanding,
    purchaseCount: purchases.length,
    topSuppliers: Object.values(bySupplier).sort((a, b) => b.total - a.total).slice(0, 10),
    byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
    aging,
    monthlySpend: Object.entries(monthlySpend).sort((a, b) => a[0].localeCompare(b[0])).slice(-6),
  };
}
