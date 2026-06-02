"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getBusinessProfile() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
    });

    if (!business) {
      console.warn(`ACTION WARNING: Business with ID ${session.user.businessId} not found in commercial registry.`);
      return null;
    }

    // Safely map fields to avoid runtime errors if fields are missing from the client
    return {
      name: (business as any).name || "Unknown Business",
      email: (business as any).email || null,
      phone: (business as any).phone || null,
      address: (business as any).address || null,
      type: (business as any).type || "SHOP",
      status: (business as any).status || "PENDING",
    };
  } catch (error: any) {
    console.error("BUSINESS PROFILE ERROR:", error);
    throw new Error(`Business Registry Sync Failed: ${error.message}`);
  }
}
