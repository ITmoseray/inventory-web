"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

export async function getSuppliers() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const suppliers = await prisma.supplier.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { createdAt: "desc" },
    });

    return suppliers.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    throw error;
  }
}

export async function createSupplier(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        businessId: session.user.businessId,
      },
    });

    await logAudit({
      action: `Created Supplier: ${supplier.name}`,
      entity: "SUPPLIER",
      entityId: supplier.id,
      newData: supplier
    });

    revalidatePath("/dashboard/inventory/suppliers");
    return {
      ...supplier,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to create supplier:", error);
    throw error;
  }
}

export async function updateSupplier(id: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const supplier = await prisma.supplier.update({
      where: { id, businessId: session.user.businessId },
      data,
    });

    await logAudit({
      action: `Updated Supplier: ${supplier.name}`,
      entity: "SUPPLIER",
      entityId: supplier.id,
      newData: supplier
    });

    revalidatePath("/dashboard/inventory/suppliers");
    return {
      ...supplier,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to update supplier:", error);
    throw error;
  }
}

export async function deleteSupplier(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const deletedSupplier = await prisma.supplier.delete({
      where: { id, businessId: session.user.businessId },
    });

    await logAudit({
      action: `Deleted Supplier: ${deletedSupplier.name}`,
      entity: "SUPPLIER",
      entityId: id
    });

    revalidatePath("/dashboard/inventory/suppliers");
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    throw error;
  }
}
