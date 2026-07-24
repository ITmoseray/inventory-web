"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface WastageInput {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
  reason: "EXPIRED" | "DAMAGED" | "THEFT" | "SPOILED" | "OTHER";
  costValue: number;
  notes?: string;
}

export async function recordWastage(data: WastageInput) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  // Deduct stock quantity from product
  await prisma.product.update({
    where: { id: data.productId },
    data: { stockQuantity: { decrement: data.quantity } },
  });

  // Log stock movement
  await prisma.stockMovement.create({
    data: {
      productId: data.productId,
      quantity: -Math.abs(data.quantity),
      type: "ADJUSTMENT",
      reason: `WASTAGE: ${data.reason}${data.notes ? ` — ${data.notes}` : ""}`,
      businessId: session.user.businessId,
      userId: session.user.id,
    },
  });

  // Record wastage entry
  const wastage = await prisma.wastage.create({
    data: {
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unit: data.unit || "Unit",
      reason: data.reason,
      costValue: data.costValue,
      notes: data.notes,
      businessId: session.user.businessId,
      recordedBy: session.user.id,
    },
  });

  revalidatePath("/dashboard/inventory/wastage");
  return { ...wastage, quantity: Number(wastage.quantity), costValue: Number(wastage.costValue) };
}

export async function getWastageHistory(filters?: {
  reason?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const wastages = await prisma.wastage.findMany({
    where: {
      businessId: session.user.businessId,
      ...(filters?.reason ? { reason: filters.reason } : {}),
      ...(filters?.productId ? { productId: filters.productId } : {}),
      ...(filters?.startDate || filters?.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    },
    include: { product: { select: { name: true, sku: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return wastages.map((w) => ({
    ...w,
    quantity: Number(w.quantity),
    costValue: Number(w.costValue),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));
}

export async function getWastageSummary() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAll, totalThisMonth, byReason, topWastedProducts] = await Promise.all([
    prisma.wastage.aggregate({
      where: { businessId: session.user.businessId },
      _sum: { costValue: true },
      _count: true,
    }),
    prisma.wastage.aggregate({
      where: { businessId: session.user.businessId, createdAt: { gte: startOfMonth } },
      _sum: { costValue: true },
      _count: true,
    }),
    prisma.wastage.groupBy({
      by: ["reason"],
      where: { businessId: session.user.businessId },
      _sum: { costValue: true, quantity: true },
      _count: true,
    }),
    prisma.wastage.groupBy({
      by: ["productId", "productName"],
      where: { businessId: session.user.businessId },
      _sum: { costValue: true, quantity: true },
      orderBy: { _sum: { costValue: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalCostAll: Number(totalAll._sum.costValue || 0),
    totalCountAll: totalAll._count,
    totalCostThisMonth: Number(totalThisMonth._sum.costValue || 0),
    totalCountThisMonth: totalThisMonth._count,
    byReason: byReason.map((r) => ({
      reason: r.reason,
      totalCost: Number(r._sum.costValue || 0),
      totalQty: Number(r._sum.quantity || 0),
      count: r._count,
    })),
    topWastedProducts: topWastedProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalCost: Number(p._sum.costValue || 0),
      totalQty: Number(p._sum.quantity || 0),
    })),
  };
}
