"use server";

import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/prisma"; // Need to use tenant prisma for businessId filtering
import { createNotification } from "./notification";
import { auth } from "@/lib/auth";
import { StockMovementType } from "@prisma/client";

/**
 * Core Inventory Manager
 * Logic for updating stock and logging movements.
 * This is decoupled from the POS UI store.
 */

export async function logStockMovement(
  productId: string,
  quantity: number,
  type: StockMovementType,
  reason?: string
) {
  return await prisma.stockMovement.create({
    data: {
      productId,
      quantity,
      type,
      reason,
      businessId: "", // Need to handle businessId, but for now just fix the field
      userId: "",     // Need to handle userId
    },
  });
}

export async function updateStockLevel(
  productId: string,
  quantityChange: number, // negative for sales
  type: StockMovementType,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Product Level
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        stockQuantity: {
          increment: quantityChange,
        },
      },
    });

    // 2. Log Movement
    await tx.stockMovement.create({
      data: {
        productId,
        quantity: quantityChange,
        type,
        reason,
        businessId: session.user.businessId,
        userId: session.user.id
      },
    });

    return product;
  });

  // Check for overstock after transaction completes
  if (result.maxStockLevel && Number(result.stockQuantity) > result.maxStockLevel) {
    try {
      await createNotification({
        title: "Overstock Alert",
        message: `${result.name} stock (${result.stockQuantity}) has exceeded the maximum stock level (${result.maxStockLevel}).`,
        type: "SYSTEM",
        link: `/dashboard/inventory/products?search=${result.sku || result.name}`
      });
    } catch (e) {
      console.error("Failed to send overstock notification", e);
    }
  }

  return result;
}

export async function getStockMovements(productId?: string, startDate?: Date, endDate?: Date) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const tenantPrisma = getTenantPrisma(session.user.businessId);

  const movements = await tenantPrisma.stockMovement.findMany({
    where: {
      businessId: session.user.businessId,
      ...(productId && { productId }),
      ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } })
    },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return movements.map(m => ({
    id: m.id,
    productName: m.product?.name || "Unknown Product",
    quantity: m.quantity,
    type: m.type,
    timestamp: m.createdAt.toISOString(),
  }));
}

export async function getInventoryOverview() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const tenantPrisma = getTenantPrisma(session.user.businessId);

  const products = await tenantPrisma.product.findMany({
    where: { businessId: session.user.businessId, type: "PRODUCT" },
    select: { stockQuantity: true, costPrice: true, minStockLevel: true, type: true }
  });

  const totalValue = products.reduce((acc, p) => acc + (p.costPrice?.toNumber() || 0) * p.stockQuantity, 0);
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length;
  const criticalStock = products.filter(p => p.stockQuantity === 0).length;

  return { totalValue, lowStock, criticalStock };
}

export async function getFastMovingProducts() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const tenantPrisma = getTenantPrisma(session.user.businessId);

  // Simplified logic: Products with high sales frequency (most recent movement)
  const topProducts = await tenantPrisma.stockMovement.groupBy({
    by: ['productId'],
    where: { businessId: session.user.businessId, type: "OUT" },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 5
  });

  const productDetails = await tenantPrisma.product.findMany({
    where: { id: { in: topProducts.map(tp => tp.productId as string) } },
    select: { name: true }
  });

  return productDetails.map(p => ({ name: p.name }));
}

export async function prepareLowStockEvent(product: any) {
  // Data preparation layer for future notifications
  return {
    productId: product.id,
    productName: product.name,
    stockQuantity: Number(product.stockQuantity?.toString() || 0),
    severity: Number(product.stockQuantity?.toString() || 0) === 0 ? "CRITICAL" : "LOW",
    timestamp: new Date().toISOString(),
  };
}

export async function getLowStockProducts() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  
  // Use tenant-specific prisma for business filtering
  const tenantPrisma = getTenantPrisma(session.user.businessId);

  // Raw query for complex filtering: stockQuantity <= minStockLevel
  const products = await tenantPrisma.$queryRaw`
    SELECT id, name, "stockQuantity", "minStockLevel" 
    FROM "Product" 
    WHERE "businessId" = ${session.user.businessId} AND "deletedAt" IS NULL
    AND "stockQuantity" <= "minStockLevel" 
    AND "type" != 'SERVICE'
    AND "stockQuantity" > 0
  ` as any[];

  return products.map(p => ({
    id: p.id,
    name: p.name,
    stockQuantity: Number(p.stockQuantity?.toString() || 0),
    minStockLevel: Number(p.minStockLevel?.toString() || 0),
    status: Number(p.stockQuantity?.toString() || 0) === 0 ? "CRITICAL" : "LOW"
  }));
}
