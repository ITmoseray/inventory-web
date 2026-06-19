"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBatches() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const batches = await prisma.batch.findMany({
      where: {
        businessId: session.user.businessId,
        deletedAt: null,
      },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      businessId: b.businessId,
      productId: b.productId,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      expiryDate: b.expiryDate?.toISOString() ?? null,
      manufacturingDate: b.manufacturingDate?.toISOString() ?? null,
      // Only pick plain scalar fields from product — no Decimal objects
      product: b.product
        ? {
            id: b.product.id,
            name: b.product.name,
            sku: b.product.sku ?? null,
          }
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    throw error;
  }
}

export async function getProductsForBatch() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const products = await prisma.product.findMany({
      where: {
        businessId: session.user.businessId,
        deletedAt: null,
        status: "active",
      },
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
    });

    return products;
  } catch (error) {
    console.error("Failed to fetch products for batch:", error);
    throw error;
  }
}

export async function createBatch(data: {
  batchNumber: string;
  productId: string;
  quantity: number;
  expiryDate?: string;
  manufacturingDate?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;

    // Check for duplicate batch number for same product
    const existing = await prisma.batch.findUnique({
      where: {
        productId_batchNumber: {
          productId: data.productId,
          batchNumber: data.batchNumber,
        },
      },
    });

    if (existing && !existing.deletedAt) {
      throw new Error(
        `Batch number "${data.batchNumber}" already exists for this product.`
      );
    }

    await prisma.batch.create({
      data: {
        batchNumber: data.batchNumber,
        productId: data.productId,
        quantity: data.quantity,
        businessId,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        manufacturingDate: data.manufacturingDate
          ? new Date(data.manufacturingDate)
          : null,
      },
    });

    revalidatePath("/dashboard/inventory/batches");
    revalidatePath("/dashboard/inventory/expiry");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to create batch:", error);
    throw new Error(error?.message || "Failed to create batch");
  }
}

export async function deleteBatch(batchId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await prisma.batch.update({
      where: { id: batchId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard/inventory/batches");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete batch:", error);
    throw error;
  }
}
