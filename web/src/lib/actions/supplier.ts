"use server";

import { prisma } from "@/lib/prisma";
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
  const businessId = session.user.businessId;

  const suppliers = await prisma.supplier.findMany({
    where: { businessId, deletedAt: null },
    include: {
      purchases: {
        where: { deletedAt: null },
        select: { totalAmount: true, paidAmount: true, paymentStatus: true, createdAt: true },
      },
      goods: {
        where: { deletedAt: null },
        select: { totalCost: true, paidAmount: true, paymentStatus: true, deliveryDate: true },
      },
      payments: { select: { amount: true, paymentDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return suppliers.map(s => {
    const totalPurchased = (s.purchases || []).reduce((sum, p) => sum + Number(p.totalAmount), 0) +
                           (s.goods || []).reduce((sum, g) => sum + Number(g.totalCost), 0);
    const totalPaid = (s.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const outstandingBalance = (
      (s.purchases || []).reduce((sum, p) => sum + (Number(p.totalAmount) - Number(p.paidAmount)), 0) +
      (s.goods || []).reduce((sum, g) => sum + (Number(g.totalCost) - Number(g.paidAmount)), 0)
    );
    return {
      ...serializeSupplier(s),
      purchases: undefined,
      goods: undefined,
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
  const businessId = session.user.businessId;

  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, businessId, deletedAt: null },
    include: {
      goods: {
        where: { deletedAt: null },
        orderBy: { deliveryDate: "desc" },
      },
      purchases: {
        where: { deletedAt: null },
        include: { 
          items: { 
            include: { 
              product: { 
                select: { id: true, name: true, sku: true, stockQuantity: true, baseUnit: true } 
              } 
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!supplier) throw new Error("Supplier not found");

  const totalGoodsSpend = (supplier.goods || []).reduce((sum, g) => sum + Number(g.totalCost), 0);
  const totalPurchaseSpend = (supplier.purchases || []).reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalPurchased = totalGoodsSpend + totalPurchaseSpend;

  const totalPaid = (supplier.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  
  const outstandingBalance = (
    (supplier.goods || []).reduce((sum, g) => sum + (Number(g.totalCost) - Number(g.paidAmount)), 0) +
    (supplier.purchases || []).reduce((sum, p) => sum + (Number(p.totalAmount) - Number(p.paidAmount)), 0)
  );

  // Build statement: merge goods deliveries, purchases, and payments, sorted by date
  const goodsTxns = (supplier.goods || []).map(g => ({
    date: g.deliveryDate.toISOString(),
    type: "GOODS_DELIVERY" as const,
    reference: g.invoiceNumber || `DN-${g.id.slice(-6)}`,
    description: `${g.itemName} (${Number(g.quantity)} ${g.unit || "pcs"})`,
    debit: Number(g.totalCost),
    credit: 0,
    paymentStatus: g.paymentStatus,
    id: g.id,
  }));

  const purchaseTxns = (supplier.purchases || []).map(p => ({
    date: p.createdAt.toISOString(),
    type: "PURCHASE" as const,
    reference: p.invoiceNumber || p.id.slice(-8),
    description: "Purchase Order",
    debit: Number(p.totalAmount),
    credit: 0,
    paymentStatus: p.paymentStatus,
    id: p.id,
  }));

  const paymentTxns = (supplier.payments || []).map(p => ({
    date: p.paymentDate.toISOString(),
    type: "PAYMENT" as const,
    reference: p.referenceNumber || p.id.slice(-8),
    description: p.notes || "Supplier Payment",
    debit: 0,
    credit: Number(p.amount),
    paymentStatus: "PAID",
    id: p.id,
  }));

  const allTxns = [...goodsTxns, ...purchaseTxns, ...paymentTxns].sort(
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
    goods: (supplier.goods || []).map(g => ({
      ...g,
      quantity: Number(g.quantity),
      unitCost: Number(g.unitCost),
      totalCost: Number(g.totalCost),
      paidAmount: Number(g.paidAmount),
      deliveryDate: g.deliveryDate.toISOString(),
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      deletedAt: g.deletedAt?.toISOString() ?? null,
      dueDate: g.dueDate?.toISOString() ?? null,
    })),
    purchases: (supplier.purchases || []).map(p => ({
      ...p,
      totalAmount: Number(p.totalAmount),
      paidAmount: Number(p.paidAmount),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt?.toISOString() ?? null,
      dueDate: p.dueDate?.toISOString() ?? null,
      items: (p.items || []).map(i => ({
        ...i,
        unitCost: Number(i.unitCost),
        total: Number(i.total),
      })),
    })),
    payments: (supplier.payments || []).map(p => ({
      ...p,
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
}

export async function recordSupplierGood(data: {
  supplierId: string;
  itemName: string;
  category?: string;
  unit?: string;
  quantity: number;
  unitCost: number;
  invoiceNumber?: string;
  deliveryDate?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  paidAmount?: number;
  dueDate?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
  const businessId = session.user.businessId;
  const userId = session.user.id;

  const qty = Number(data.quantity) || 1;
  const cost = Number(data.unitCost) || 0;
  const totalCost = qty * cost;
  const paymentStatus = data.paymentStatus || "PAID";
  const paidAmount = paymentStatus === "PAID" ? totalCost : paymentStatus === "PARTIAL" ? (Number(data.paidAmount) || 0) : 0;
  const deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : new Date();
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Supplier Goods Record (100% standalone record keeping - NOT connected to products)
    const good = await tx.supplierGood.create({
      data: {
        supplierId: data.supplierId,
        itemName: data.itemName.trim(),
        category: data.category?.trim() || null,
        unit: data.unit?.trim() || "pcs",
        quantity: qty,
        unitCost: cost,
        totalCost: totalCost,
        invoiceNumber: data.invoiceNumber?.trim() || `DN-${Date.now().toString().slice(-6)}`,
        deliveryDate: deliveryDate,
        paymentStatus: paymentStatus,
        paidAmount: paidAmount,
        dueDate: dueDate,
        notes: data.notes?.trim() || null,
        businessId: businessId,
      },
    });

    // 2. If payment was made (fully or partially), record a supplier payment to sync ledger balance
    if (paidAmount > 0) {
      await tx.supplierPayment.create({
        data: {
          supplierId: data.supplierId,
          amount: paidAmount,
          paymentMethod: "CASH",
          referenceNumber: good.invoiceNumber ? `PAY-${good.invoiceNumber}` : `PAY-${good.id.slice(-6)}`,
          paymentDate: deliveryDate,
          notes: `Settlement for goods intake: ${good.itemName} (${good.quantity} ${good.unit})`,
          businessId: businessId,
          userId: userId,
        },
      });
    }

    return good;
  });

  await logAudit({
    action: `Recorded Supplier Goods: ${data.itemName} under supplier ID ${data.supplierId}`,
    entity: "SUPPLIER",
    entityId: data.supplierId,
    newData: result,
  });

  revalidatePath("/dashboard/purchases/suppliers");
  revalidatePath(`/dashboard/purchases/suppliers/${data.supplierId}`);

  return {
    ...result,
    quantity: Number(result.quantity),
    unitCost: Number(result.unitCost),
    totalCost: Number(result.totalCost),
    paidAmount: Number(result.paidAmount),
    deliveryDate: result.deliveryDate.toISOString(),
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}

export async function deleteSupplierGood(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const good = await prisma.supplierGood.update({
    where: { id, businessId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/purchases/suppliers");
  revalidatePath(`/dashboard/purchases/suppliers/${good.supplierId}`);
  return { success: true };
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
  const businessId = session.user.businessId;

  const supplier = await prisma.supplier.create({
    data: { ...data, businessId },
  });

  await logAudit({ action: `Created Supplier: ${supplier.name}`, entity: "SUPPLIER", entityId: supplier.id, newData: supplier });
  revalidatePath("/dashboard/purchases/suppliers");
  return serializeSupplier(supplier);
}

export async function updateSupplier(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const supplier = await prisma.supplier.update({
    where: { id, businessId },
    data,
  });

  await logAudit({ action: `Updated Supplier: ${supplier.name}`, entity: "SUPPLIER", entityId: supplier.id, newData: supplier });
  revalidatePath("/dashboard/purchases/suppliers");
  return serializeSupplier(supplier);
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  await prisma.supplier.update({
    where: { id, businessId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/purchases/suppliers");
  return { success: true };
}

export async function getPurchaseAnalytics() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const businessId = session.user.businessId;

  const purchases = await prisma.purchase.findMany({
    where: { businessId, deletedAt: null },
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
