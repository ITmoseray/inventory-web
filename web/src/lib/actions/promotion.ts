"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PromotionType = "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y";
export type PromotionScope = "ALL" | "CATEGORY" | "PRODUCT";

export interface PromotionInput {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minQty?: number;
  freeQty?: number;
  minAmount?: number;
  startDate: string;
  endDate: string;
  appliesTo?: PromotionScope;
  categoryId?: string;
  productId?: string;
}

export async function getPromotions(includeInactive = false) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const promotions = await prisma.promotion.findMany({
    where: {
      businessId: session.user.businessId,
      ...(includeInactive ? {} : { status: { in: ["ACTIVE", "INACTIVE"] } }),
    },
    orderBy: { createdAt: "desc" },
  });

  return promotions.map((p) => ({
    ...p,
    value: Number(p.value),
    minAmount: p.minAmount ? Number(p.minAmount) : null,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getActivePromotions() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: {
      businessId: session.user.businessId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  return promotions.map((p) => ({
    ...p,
    value: Number(p.value),
    minAmount: p.minAmount ? Number(p.minAmount) : null,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function createPromotion(data: PromotionInput) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const promotion = await prisma.promotion.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      minQty: data.minQty,
      freeQty: data.freeQty,
      minAmount: data.minAmount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      appliesTo: data.appliesTo || "ALL",
      categoryId: data.categoryId,
      productId: data.productId,
      businessId: session.user.businessId,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard/inventory/promotions");
  return { ...promotion, value: Number(promotion.value) };
}

export async function updatePromotion(id: string, data: Partial<PromotionInput> & { status?: string }) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const promotion = await prisma.promotion.update({
    where: { id, businessId: session.user.businessId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  revalidatePath("/dashboard/inventory/promotions");
  return { ...promotion, value: Number(promotion.value) };
}

export async function deletePromotion(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  await prisma.promotion.delete({
    where: { id, businessId: session.user.businessId },
  });

  revalidatePath("/dashboard/inventory/promotions");
  return { success: true };
}

/**
 * Given a cart total and list of items, compute total discount from active promotions.
 * Returns an array of applied promotions with their discount amounts.
 */
export async function applyPromotionsToCart(
  cartTotal: number,
  items: Array<{ productId: string; categoryId?: string; quantity: number; unitPrice: number }>
) {
  const session = await auth();
  if (!session?.user?.businessId) return { totalDiscount: 0, applied: [] };

  const prisma = getTenantPrisma(session.user.businessId);
  const now = new Date();

  const activePromos = await prisma.promotion.findMany({
    where: {
      businessId: session.user.businessId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  let totalDiscount = 0;
  const applied: Array<{ name: string; type: string; discount: number }> = [];

  for (const promo of activePromos) {
    const promoValue = Number(promo.value);
    const minAmount = promo.minAmount ? Number(promo.minAmount) : null;

    if (minAmount && cartTotal < minAmount) continue;

    if (promo.appliesTo === "ALL") {
      if (promo.type === "PERCENTAGE") {
        const disc = (cartTotal * promoValue) / 100;
        totalDiscount += disc;
        applied.push({ name: promo.name, type: promo.type, discount: disc });
      } else if (promo.type === "FIXED") {
        totalDiscount += promoValue;
        applied.push({ name: promo.name, type: promo.type, discount: promoValue });
      }
    } else if (promo.appliesTo === "PRODUCT" && promo.productId) {
      const matchedItem = items.find((i) => i.productId === promo.productId);
      if (!matchedItem) continue;

      if (promo.type === "BUY_X_GET_Y" && promo.minQty && promo.freeQty) {
        if (matchedItem.quantity >= promo.minQty) {
          const freeDisc = promo.freeQty * matchedItem.unitPrice;
          totalDiscount += freeDisc;
          applied.push({ name: promo.name, type: promo.type, discount: freeDisc });
        }
      } else if (promo.type === "PERCENTAGE") {
        const itemTotal = matchedItem.quantity * matchedItem.unitPrice;
        const disc = (itemTotal * promoValue) / 100;
        totalDiscount += disc;
        applied.push({ name: promo.name, type: promo.type, discount: disc });
      } else if (promo.type === "FIXED") {
        totalDiscount += promoValue;
        applied.push({ name: promo.name, type: promo.type, discount: promoValue });
      }
    } else if (promo.appliesTo === "CATEGORY" && promo.categoryId) {
      const matchedItems = items.filter((i) => i.categoryId === promo.categoryId);
      if (matchedItems.length === 0) continue;
      const categoryTotal = matchedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      if (promo.type === "PERCENTAGE") {
        const disc = (categoryTotal * promoValue) / 100;
        totalDiscount += disc;
        applied.push({ name: promo.name, type: promo.type, discount: disc });
      } else if (promo.type === "FIXED") {
        totalDiscount += promoValue;
        applied.push({ name: promo.name, type: promo.type, discount: promoValue });
      }
    }
  }

  return { totalDiscount: Math.min(totalDiscount, cartTotal), applied };
}
