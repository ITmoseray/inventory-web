"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function adjustLocationStock(data: {
  locationId: string;
  productId: string;
  quantity: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    // 1. Get current stock
    const currentStock = await tenantPrisma.locationStock.findUnique({
      where: {
        locationId_productId: {
          locationId: data.locationId,
          productId: data.productId,
        },
      },
    });

    const oldQty = currentStock ? Number(currentStock.quantity || 0) : 0;
    const difference = data.quantity - oldQty;

    if (difference === 0) {
      return { success: true, message: "No change in quantity." };
    }

    // 2. Update or create LocationStock record
    const result = await tenantPrisma.$transaction(async (tx) => {
      let updatedStock;
      if (currentStock) {
        updatedStock = await tx.locationStock.update({
          where: { id: currentStock.id },
          data: { quantity: data.quantity },
        });
      } else {
        updatedStock = await tx.locationStock.create({
          data: {
            locationId: data.locationId,
            productId: data.productId,
            quantity: data.quantity,
          },
        });
      }

      // 3. Log Stock Movement
      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          quantity: difference,
          type: difference > 0 ? "IN" : "OUT",
          reason: `Manual location adjustment (Set to ${data.quantity})`,
          businessId,
          userId: session.user.id!,
        },
      });

      return updatedStock;
    });

    revalidatePath("/dashboard/inventory/transfers");
    return { success: true, stock: result };
  } catch (error: any) {
    console.error("Failed to adjust location stock:", error);
    throw new Error(error.message || "Failed to adjust location stock.");
  }
}
