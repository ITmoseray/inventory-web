"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function recordSupplierPayment(data: {
  supplierId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  // Verify supplier exists
  const supplier = await prisma.supplier.findFirst({
    where: { id: data.supplierId, businessId: session.user.businessId },
  });
  if (!supplier) throw new Error("Supplier not found");

  const payment = await prisma.supplierPayment.create({
    data: {
      supplierId: data.supplierId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber || null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      notes: data.notes || null,
      businessId: session.user.businessId,
      userId: session.user.id,
    },
  });

  // Mark the oldest unpaid/partial purchases against this supplier
  let remaining = data.amount;
  const unpaidPurchases = await prisma.purchase.findMany({
    where: {
      supplierId: data.supplierId,
      businessId: session.user.businessId,
      paymentStatus: { in: ["UNPAID", "PARTIAL"] },
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const purchase of unpaidPurchases) {
    if (remaining <= 0) break;
    const owed = Number(purchase.totalAmount) - Number(purchase.paidAmount);
    if (owed <= 0) continue;
    const toApply = Math.min(remaining, owed);
    const newPaid = Number(purchase.paidAmount) + toApply;
    const newStatus = newPaid >= Number(purchase.totalAmount) ? "PAID" : "PARTIAL";
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { paidAmount: newPaid, paymentStatus: newStatus },
    });
    remaining -= toApply;
  }

  revalidatePath("/dashboard/purchases/suppliers");
  revalidatePath(`/dashboard/purchases/suppliers/${data.supplierId}`);
  revalidatePath("/dashboard/purchases/payments");

  return {
    ...payment,
    amount: Number(payment.amount),
    paymentDate: payment.paymentDate.toISOString(),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export async function getSupplierPayments(filters?: { supplierId?: string; from?: string; to?: string }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const payments = await prisma.supplierPayment.findMany({
    where: {
      businessId: session.user.businessId,
      ...(filters?.supplierId ? { supplierId: filters.supplierId } : {}),
      ...(filters?.from || filters?.to ? {
        paymentDate: {
          ...(filters.from ? { gte: new Date(filters.from) } : {}),
          ...(filters.to ? { lte: new Date(filters.to) } : {}),
        }
      } : {}),
    },
    include: {
      supplier: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { paymentDate: "desc" },
  });

  return payments.map(p => ({
    ...p,
    amount: Number(p.amount),
    paymentDate: p.paymentDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}
