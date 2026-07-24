"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SupplierPriceInput {
  supplierId: string;
  productId: string;
  unitCost: number;
  minOrderQty?: number;
  leadTimeDays?: number;
  notes?: string;
}

export async function getSupplierPriceList(supplierId: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const prices = await prisma.supplierPriceList.findMany({
    where: { supplierId, businessId: session.user.businessId },
    include: {
      product: { select: { id: true, name: true, sku: true, costPrice: true, unitPrice: true, imageUrl: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return prices.map((p) => ({
    ...p,
    unitCost: Number(p.unitCost),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    product: {
      ...p.product,
      costPrice: p.product.costPrice ? Number(p.product.costPrice) : null,
      unitPrice: Number(p.product.unitPrice),
    },
  }));
}

export async function addSupplierPrice(data: SupplierPriceInput) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const existing = await prisma.supplierPriceList.findUnique({
    where: { supplierId_productId: { supplierId: data.supplierId, productId: data.productId } },
  });

  if (existing) {
    // Update existing
    const updated = await prisma.supplierPriceList.update({
      where: { id: existing.id },
      data: {
        unitCost: data.unitCost,
        minOrderQty: data.minOrderQty ?? existing.minOrderQty,
        leadTimeDays: data.leadTimeDays ?? existing.leadTimeDays,
        notes: data.notes ?? existing.notes,
      },
    });
    revalidatePath("/dashboard/purchases/suppliers");
    return { ...updated, unitCost: Number(updated.unitCost), updatedExisting: true };
  }

  const price = await prisma.supplierPriceList.create({
    data: {
      supplierId: data.supplierId,
      productId: data.productId,
      unitCost: data.unitCost,
      minOrderQty: data.minOrderQty || 1,
      leadTimeDays: data.leadTimeDays || 1,
      notes: data.notes,
      businessId: session.user.businessId,
    },
  });

  revalidatePath("/dashboard/purchases/suppliers");
  return { ...price, unitCost: Number(price.unitCost), updatedExisting: false };
}

export async function deleteSupplierPrice(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  await prisma.supplierPriceList.delete({
    where: { id, businessId: session.user.businessId },
  });

  revalidatePath("/dashboard/purchases/suppliers");
  return { success: true };
}

/**
 * Bulk apply supplier prices to product cost prices.
 * Updates the costPrice on each Product to match the supplier's listed unit cost.
 */
export async function bulkApplySupplierPrices(supplierId: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const prices = await prisma.supplierPriceList.findMany({
    where: { supplierId, businessId: session.user.businessId },
  });

  let updatedCount = 0;
  for (const price of prices) {
    await prisma.product.update({
      where: { id: price.productId },
      data: { costPrice: price.unitCost },
    });
    updatedCount++;
  }

  revalidatePath("/dashboard/inventory/products");
  revalidatePath("/dashboard/purchases/suppliers");
  return { updatedCount };
}

export async function getSupplierPriceListForAllSuppliers() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const prices = await prisma.supplierPriceList.findMany({
    where: { businessId: session.user.businessId },
    include: {
      supplier: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { supplier: { name: "asc" } },
  });

  return prices.map((p) => ({
    ...p,
    unitCost: Number(p.unitCost),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}
