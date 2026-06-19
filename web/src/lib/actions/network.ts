"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Fetches all products and services published to the network by other businesses.
 */
export async function getNetworkRegistry() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const items = await prisma.product.findMany({
      where: {
        isNetworkAvailable: true,
        businessId: { not: session.user.businessId }, // Exclude own items
        deletedAt: null,
      },
      include: {
        business: {
          select: {
            name: true,
            type: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description,
      barcode: item.barcode,
      unitPrice: item.unitPrice.toNumber(),
      costPrice: item.costPrice?.toNumber() ?? null,
      stockQuantity: Number(item.stockQuantity),
      minStockLevel: Number(item.minStockLevel),
      status: item.status,
      metadata: item.metadata,
      businessId: item.businessId,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl,
      baseUnit: item.baseUnit,
      isNetworkAvailable: item.isNetworkAvailable,
      originalBusinessId: item.originalBusinessId,
      type: item.type,
      deletedAt: item.deletedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      business: item.business,
      category: item.category,
    }));
  } catch (error) {
    console.error("Failed to fetch network registry:", error);
    throw error;
  }
}

/**
 * Sources (clones) an item from the network into the current business's local inventory.
 */
export async function sourceItem(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    // 1. Fetch the source item
    const sourceItem = await prisma.product.findUnique({
      where: { id: productId, isNetworkAvailable: true },
    });

    if (!sourceItem) throw new Error("Source item not found or no longer available.");

    // 2. Check if already sourced
    const existing = await prisma.product.findFirst({
      where: { 
        businessId, 
        originalProductId: sourceItem.id,
        deletedAt: null 
      },
    });

    if (existing) throw new Error("This item is already in your inventory.");

    // 3. Clone into local inventory
    const newItem = await tenantPrisma.product.create({
      data: {
        name: sourceItem.name,
        description: sourceItem.description,
        type: sourceItem.type,
        unitPrice: sourceItem.unitPrice,
        costPrice: sourceItem.costPrice,
        isNetworkAvailable: false, // Local copy is private by default
        originalProductId: sourceItem.id,
        originalBusinessId: sourceItem.businessId,
        businessId: businessId,
        status: "active",
        stockQuantity: sourceItem.type === "SERVICE" ? 0 : 0, // Services don't use stock
      },
    });

    revalidatePath("/dashboard/inventory/products");
    revalidatePath("/dashboard/inventory/network");

    return {
      id: newItem.id,
      name: newItem.name,
      sku: newItem.sku ?? null,
      description: newItem.description ?? null,
      barcode: newItem.barcode ?? null,
      unitPrice: newItem.unitPrice.toNumber(),
      costPrice: newItem.costPrice?.toNumber() ?? null,
      stockQuantity: Number(newItem.stockQuantity),
      minStockLevel: Number(newItem.minStockLevel),
      status: newItem.status,
      metadata: newItem.metadata,
      businessId: newItem.businessId,
      categoryId: newItem.categoryId ?? null,
      imageUrl: newItem.imageUrl ?? null,
      baseUnit: newItem.baseUnit ?? null,
      type: newItem.type,
      isNetworkAvailable: newItem.isNetworkAvailable,
      originalProductId: newItem.originalProductId ?? null,
      originalBusinessId: newItem.originalBusinessId ?? null,
      deletedAt: newItem.deletedAt?.toISOString() ?? null,
      createdAt: newItem.createdAt.toISOString(),
      updatedAt: newItem.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to source item:", error);
    throw new Error(error.message || "Failed to source item from network.");
  }
}

/**
 * Toggles whether a local product is available for other businesses to source.
 */
export async function toggleNetworkVisibility(productId: string, isAvailable: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await prisma.product.update({
      where: { id: productId, businessId: session.user.businessId },
      data: { isNetworkAvailable: isAvailable },
    });

    revalidatePath("/dashboard/inventory/products");
  } catch (error) {
    console.error("Failed to toggle network visibility:", error);
    throw error;
  }
}
