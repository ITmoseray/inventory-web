"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStockTransfers() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    return await prisma.stockTransfer.findMany({
      where: {
        fromLocation: { businessId }
      },
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch stock transfers:", error);
    throw error;
  }
}

export async function createStockTransfer(data: {
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  quantity: number;
  note?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    // Verify source stock levels first
    const sourceStock = await tenantPrisma.locationStock.findUnique({
      where: {
        locationId_productId: {
          locationId: data.fromLocationId,
          productId: data.productId,
        }
      }
    });

    const availableQty = sourceStock ? Number(sourceStock.quantity?.toString() || 0) : 0;
    if (availableQty < data.quantity) {
      throw new Error(`Insufficient stock in source location. Available: ${availableQty}`);
    }

    const transfer = await tenantPrisma.stockTransfer.create({
      data: {
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        productId: data.productId,
        quantity: data.quantity,
        status: "PENDING",
        note: data.note || null,
      },
    });

    revalidatePath("/dashboard/inventory/transfers");
    return { success: true, transfer };
  } catch (error: any) {
    console.error("Failed to create stock transfer:", error);
    throw new Error(error.message || "Failed to initiate internal transfer.");
  }
}

export async function completeStockTransfer(transferId: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = getTenantPrisma(businessId);

    const result = await tenantPrisma.$transaction(async (tx) => {
      // 1. Fetch transfer details
      const transfer = await tx.stockTransfer.findUnique({
        where: { id: transferId },
        include: { product: true }
      });

      if (!transfer) throw new Error("Transfer request not found.");
      if (transfer.status !== "PENDING") throw new Error("Transfer is already processed.");

      // 2. Verify and deduct from source location
      const sourceStock = await tx.locationStock.findUnique({
        where: {
          locationId_productId: {
            locationId: transfer.fromLocationId,
            productId: transfer.productId,
          }
        }
      });

      if (!sourceStock || Number(sourceStock.quantity?.toString() || 0) < Number(transfer.quantity?.toString() || 0)) {
        throw new Error("Insufficient stock in source location to complete this transfer.");
      }

      await tx.locationStock.update({
        where: { id: sourceStock.id },
        data: { quantity: { decrement: transfer.quantity } }
      });

      // 3. Add to target location
      const targetStock = await tx.locationStock.findUnique({
        where: {
          locationId_productId: {
            locationId: transfer.toLocationId,
            productId: transfer.productId,
          }
        }
      });

      if (targetStock) {
        await tx.locationStock.update({
          where: { id: targetStock.id },
          data: { quantity: { increment: transfer.quantity } }
        });
      } else {
        await tx.locationStock.create({
          data: {
            locationId: transfer.toLocationId,
            productId: transfer.productId,
            quantity: transfer.quantity,
          }
        });
      }

      // 4. Update global product stock allocation
      // (Optionally, global stock remains the same, but branch allocation moves. 
      // If global Product.stockQuantity represents total across all locations, no global update is needed. 
      // However, to keep it clean, we'll log a stock movement auditor record)
      
      await tx.stockMovement.create({
        data: {
          productId: transfer.productId,
          quantity: -Number(transfer.quantity?.toString() || 0),
          type: "OUT",
          reason: `Transfer to Location ID: ${transfer.toLocationId}`,
          businessId,
          userId: session.user.id!,
        }
      });

      await tx.stockMovement.create({
        data: {
          productId: transfer.productId,
          quantity: Number(transfer.quantity?.toString() || 0),
          type: "IN",
          reason: `Transfer from Location ID: ${transfer.fromLocationId}`,
          businessId,
          userId: session.user.id!,
        }
      });

      // 5. Update transfer status
      return await tx.stockTransfer.update({
        where: { id: transferId },
        data: { status: "COMPLETED" }
      });
    });

    revalidatePath("/dashboard/inventory/transfers");
    return { success: true, transfer: result };
  } catch (error: any) {
    console.error("Failed to complete stock transfer:", error);
    throw new Error(error.message || "Failed to finalize internal transfer.");
  }
}
