"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isNetworkAvailable: true,
        deletedAt: null
      },
      include: {
        business: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      barcode: p.barcode,
      unitPrice: p.unitPrice.toNumber(),
      costPrice: p.costPrice?.toNumber() ?? null,
      stockQuantity: Number(p.stockQuantity),
      minStockLevel: Number(p.minStockLevel),
      status: p.status,
      metadata: p.metadata,
      businessId: p.businessId,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      baseUnit: p.baseUnit,
      isNetworkAvailable: p.isNetworkAvailable,
      deletedAt: p.deletedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      business: p.business,
      businessName: p.business?.name || "Unknown Business"
    }));
  } catch (error) {
    console.error("Failed to fetch public products:", error);
    throw error;
  }
}
