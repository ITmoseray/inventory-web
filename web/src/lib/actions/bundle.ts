"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface BundleItemInput {
  productId: string;
  quantity: number;
}

export interface BundleInput {
  name: string;
  description?: string;
  bundlePrice: number;
  imageUrl?: string;
  items: BundleItemInput[];
}

export async function getBundles(includeInactive = false) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const bundles = await prisma.productBundle.findMany({
    where: {
      businessId: session.user.businessId,
      ...(includeInactive ? {} : { status: "ACTIVE" }),
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, unitPrice: true, imageUrl: true, stockQuantity: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bundles.map((b) => ({
    ...b,
    bundlePrice: Number(b.bundlePrice),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    items: b.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        unitPrice: Number(item.product.unitPrice),
        stockQuantity: Number(item.product.stockQuantity),
      },
    })),
    // Calculated field: total retail value vs bundle price
    retailTotal: b.items.reduce((sum, i) => sum + Number(i.product.unitPrice) * i.quantity, 0),
  }));
}

export async function createBundle(data: BundleInput) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const bundle = await prisma.productBundle.create({
    data: {
      name: data.name,
      description: data.description,
      bundlePrice: data.bundlePrice,
      imageUrl: data.imageUrl,
      status: "ACTIVE",
      businessId: session.user.businessId,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: { include: { product: { select: { id: true, name: true, unitPrice: true } } } },
    },
  });

  revalidatePath("/dashboard/inventory/bundles");
  return { ...bundle, bundlePrice: Number(bundle.bundlePrice) };
}

export async function updateBundle(
  id: string,
  data: Partial<Omit<BundleInput, "items">> & { status?: string; items?: BundleItemInput[] }
) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  // If items are being updated, delete old ones and recreate
  if (data.items) {
    await prisma.bundleItem.deleteMany({ where: { bundleId: id } });
  }

  const bundle = await prisma.productBundle.update({
    where: { id, businessId: session.user.businessId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.bundlePrice !== undefined ? { bundlePrice: data.bundlePrice } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.items
        ? { items: { create: data.items.map((item) => ({ productId: item.productId, quantity: item.quantity })) } }
        : {}),
    },
    include: {
      items: { include: { product: { select: { id: true, name: true, unitPrice: true } } } },
    },
  });

  revalidatePath("/dashboard/inventory/bundles");
  return { ...bundle, bundlePrice: Number(bundle.bundlePrice) };
}

export async function deleteBundle(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  await prisma.productBundle.delete({
    where: { id, businessId: session.user.businessId },
  });

  revalidatePath("/dashboard/inventory/bundles");
  return { success: true };
}

export async function toggleBundleStatus(id: string) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");
  const prisma = getTenantPrisma(session.user.businessId);

  const bundle = await prisma.productBundle.findUnique({ where: { id } });
  if (!bundle) throw new Error("Bundle not found");

  const updated = await prisma.productBundle.update({
    where: { id, businessId: session.user.businessId },
    data: { status: bundle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/dashboard/inventory/bundles");
  return { ...updated, bundlePrice: Number(updated.bundlePrice) };
}
