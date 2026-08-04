"use server";

import { getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getTenantContext() {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized: Tenant context not found");
  }
  return session.user.businessId;
}

export async function getCurrentSubscription() {
  const businessId = await getTenantContext();
  const prisma = getTenantPrisma(businessId);
  const subscription = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return null;

  return {
    ...subscription,
    amount: subscription.amount.toNumber(),
    startDate: subscription.startDate.toISOString(),
    endDate: subscription.endDate.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

export async function getInvoices() {
  const businessId = await getTenantContext();
  const prisma = getTenantPrisma(businessId);
  const invoices = await prisma.invoice.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { payments: true },
  });

  return invoices.map(invoice => ({
    ...invoice,
    subTotal: invoice.subTotal.toNumber(),
    taxRate: invoice.taxRate.toNumber(),
    taxAmount: invoice.taxAmount.toNumber(),
    discountAmount: invoice.discountAmount.toNumber(),
    totalAmount: invoice.totalAmount.toNumber(),
    balanceDue: invoice.balanceDue.toNumber(),
    amount: invoice.totalAmount.toNumber(), // Keep amount for frontend compatibility
    dueDate: invoice.dueDate.toISOString(),
    issueDate: invoice.issueDate.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    deletedAt: invoice.deletedAt?.toISOString() || null,
    payments: invoice.payments.map(payment => ({
      ...payment,
      amount: payment.amount.toNumber(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      deletedAt: payment.deletedAt?.toISOString() || null,
    }))
  }));
}

export async function createInvoice(data: { amount: number; dueDate: Date }) {
  const businessId = await getTenantContext();
  const prisma = getTenantPrisma(businessId);
  
  const invoice = await prisma.invoice.create({
    data: {
      businessId,
      invoiceNumber: `INV-${Date.now()}`,
      totalAmount: data.amount,
      balanceDue: data.amount,
      dueDate: data.dueDate,
      status: "UNPAID",
    },
  });
  
  revalidatePath("/dashboard/billing");
  
  return {
    ...invoice,
    subTotal: invoice.subTotal.toNumber(),
    taxRate: invoice.taxRate.toNumber(),
    taxAmount: invoice.taxAmount.toNumber(),
    discountAmount: invoice.discountAmount.toNumber(),
    totalAmount: invoice.totalAmount.toNumber(),
    balanceDue: invoice.balanceDue.toNumber(),
    amount: invoice.totalAmount.toNumber(),
    dueDate: invoice.dueDate.toISOString(),
    issueDate: invoice.issueDate.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    deletedAt: invoice.deletedAt?.toISOString() || null,
  };
}

export async function recordPayment(invoiceId: string, data: { amount: number; paymentMethod: string; paymentRef?: string }) {
  const businessId = await getTenantContext();
  const prisma = getTenantPrisma(businessId);
  
  const payment = await prisma.payment.create({
    data: {
      businessId,
      invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentRef: data.paymentRef,
    },
  });

  // Check if invoice is fully paid
  const payments = await prisma.payment.findMany({ where: { invoiceId } });
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount?.toString() || 0), 0);
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

  if (invoice && totalPaid >= Number(invoice.totalAmount?.toString() || 0)) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", balanceDue: 0 },
    });
  } else if (invoice) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PARTIAL", balanceDue: Number(invoice.totalAmount?.toString() || 0) - totalPaid },
    });
  }

  revalidatePath("/dashboard/billing");
  
  return {
    ...payment,
    amount: payment.amount.toNumber(),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    deletedAt: payment.deletedAt?.toISOString() || null,
  };
}
