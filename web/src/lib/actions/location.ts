"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getLocations() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    return await prisma.location.findMany({
      where: { businessId },
      include: { stocks: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    throw error;
  }
}

export async function createLocation(data: {
  name: string;
  type: string; // STORE, WAREHOUSE, OUTLET
  address?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    const newLocation = await tenantPrisma.location.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address || null,
        businessId,
      },
    });

    revalidatePath("/dashboard/inventory/transfers");
    return { success: true, location: newLocation };
  } catch (error: any) {
    console.error("Failed to create location:", error);
    throw new Error(error.message || "Failed to create inventory branch/location.");
  }
}
