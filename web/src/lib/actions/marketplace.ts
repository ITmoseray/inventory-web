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
      ...p,
      unitPrice: p.unitPrice.toNumber(),
      createdAt: p.createdAt.toISOString(),
      businessName: p.business?.name || "Unknown Business"
    }));
  } catch (error) {
    console.error("Failed to fetch public products:", error);
    throw error;
  }
}
