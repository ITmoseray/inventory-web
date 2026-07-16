"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canPerformAction } from "@/lib/subscriptions";

export async function getLocations() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const locations = await prisma.location.findMany({
      where: { businessId },
      include: { stocks: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(locations));
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

    // 1. Check Plan Limits for Branches
    // We use the global prisma because business data is on the global database
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true }
    });
    
    const tenantPrisma = getTenantPrisma(businessId);

    const locationCount = await tenantPrisma.location.count();
    
    const check = canPerformAction(business?.plan || "FREE", "maxBranches", locationCount);
    if (!check.allowed) {
      throw new Error(check.message);
    }

    const newLocation = await tenantPrisma.location.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address || null,
        businessId,
      },
    });

    revalidatePath("/dashboard/inventory/transfers");
    return { success: true, location: JSON.parse(JSON.stringify(newLocation)) };
  } catch (error: any) {
    console.error("Failed to create location:", error);
    throw new Error(error.message || "Failed to create inventory branch/location.");
  }
}
