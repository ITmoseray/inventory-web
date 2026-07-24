"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

function generateGiftCardCode(): string {
  // Format: GC-XXXX-XXXX-XXXX (alphanumeric, uppercase)
  const segment = () => nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, "X").padEnd(4, "X");
  return `GC-${segment()}-${segment()}-${segment()}`;
}

export async function issueGiftCard(data: {
  amount: number;
  issuedTo?: string;
  expiryDate?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const code = generateGiftCardCode();

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      originalAmount: data.amount,
      balance: data.amount,
      issuedTo: data.issuedTo,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      status: "ACTIVE",
      businessId: session.user.businessId,
    },
  });

  // Record issue transaction
  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: giftCard.id,
      amount: data.amount,
      type: "ISSUE",
      notes: data.notes || `Issued to ${data.issuedTo || "customer"}`,
    },
  });

  revalidatePath("/dashboard/sales/gift-cards");
  return {
    ...giftCard,
    originalAmount: Number(giftCard.originalAmount),
    balance: Number(giftCard.balance),
    expiryDate: giftCard.expiryDate?.toISOString() || null,
    createdAt: giftCard.createdAt.toISOString(),
  };
}

export async function checkGiftCardBalance(code: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const giftCard = await prisma.giftCard.findFirst({
    where: { code: code.trim().toUpperCase(), businessId: session.user.businessId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  if (!giftCard) return { found: false, message: "Gift card not found" };

  // Auto-expire if past expiry date
  if (giftCard.expiryDate && new Date() > giftCard.expiryDate && giftCard.status === "ACTIVE") {
    await prisma.giftCard.update({ where: { id: giftCard.id }, data: { status: "EXPIRED" } });
    return { found: true, status: "EXPIRED", balance: 0, code: giftCard.code, message: "Gift card has expired" };
  }

  return {
    found: true,
    id: giftCard.id,
    code: giftCard.code,
    balance: Number(giftCard.balance),
    originalAmount: Number(giftCard.originalAmount),
    status: giftCard.status,
    issuedTo: giftCard.issuedTo,
    expiryDate: giftCard.expiryDate?.toISOString() || null,
    recentTransactions: giftCard.transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export async function redeemGiftCard(data: { code: string; amount: number; saleRef?: string }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const giftCard = await prisma.giftCard.findFirst({
    where: { code: data.code.trim().toUpperCase(), businessId: session.user.businessId, status: "ACTIVE" },
  });

  if (!giftCard) throw new Error("Gift card not found or not active");
  if (giftCard.expiryDate && new Date() > giftCard.expiryDate) throw new Error("Gift card has expired");

  const balance = Number(giftCard.balance);
  if (balance <= 0) throw new Error("Gift card has no remaining balance");

  const redeemAmount = Math.min(data.amount, balance);
  const newBalance = balance - redeemAmount;

  const updated = await prisma.giftCard.update({
    where: { id: giftCard.id },
    data: {
      balance: newBalance,
      status: newBalance <= 0 ? "USED" : "ACTIVE",
    },
  });

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: giftCard.id,
      amount: redeemAmount,
      type: "REDEEM",
      saleRef: data.saleRef,
      notes: `Redeemed at POS. Remaining: ${newBalance.toFixed(2)}`,
    },
  });

  revalidatePath("/dashboard/sales/gift-cards");
  return {
    redeemedAmount: redeemAmount,
    remainingBalance: newBalance,
    status: updated.status,
  };
}

export async function voidGiftCard(id: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const updated = await prisma.giftCard.update({
    where: { id, businessId: session.user.businessId },
    data: { status: "VOIDED", balance: 0 },
  });

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: id,
      amount: Number(updated.originalAmount),
      type: "VOID",
      notes: reason || "Voided by admin",
    },
  });

  revalidatePath("/dashboard/sales/gift-cards");
  return { success: true };
}

export async function getGiftCards(filters?: { status?: string }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const giftCards = await prisma.giftCard.findMany({
    where: {
      businessId: session.user.businessId,
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return giftCards.map((gc) => ({
    ...gc,
    originalAmount: Number(gc.originalAmount),
    balance: Number(gc.balance),
    expiryDate: gc.expiryDate?.toISOString() || null,
    createdAt: gc.createdAt.toISOString(),
    updatedAt: gc.updatedAt.toISOString(),
    transactions: gc.transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      createdAt: t.createdAt.toISOString(),
    })),
  }));
}

export async function getGiftCardStats() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const [total, active, used, voided, totalBalance, totalRedeemed] = await Promise.all([
    prisma.giftCard.count({ where: { businessId: session.user.businessId } }),
    prisma.giftCard.count({ where: { businessId: session.user.businessId, status: "ACTIVE" } }),
    prisma.giftCard.count({ where: { businessId: session.user.businessId, status: "USED" } }),
    prisma.giftCard.count({ where: { businessId: session.user.businessId, status: "VOIDED" } }),
    prisma.giftCard.aggregate({ where: { businessId: session.user.businessId, status: "ACTIVE" }, _sum: { balance: true } }),
    prisma.giftCardTransaction.aggregate({ where: { giftCard: { businessId: session.user.businessId }, type: "REDEEM" }, _sum: { amount: true } }),
  ]);

  return {
    total,
    active,
    used,
    voided,
    totalActiveBalance: Number(totalBalance._sum.balance || 0),
    totalRedeemed: Number(totalRedeemed._sum.amount || 0),
  };
}
