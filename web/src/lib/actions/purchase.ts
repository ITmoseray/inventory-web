"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

export async function createPurchase(data: {
  supplierId?: string;
  items: { productId: string; unitId?: string; quantity: number; unitCost: number; total: number }[];
  totalAmount: number;
  invoiceNumber?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const userId = session.user.id;

    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Create the Purchase record
      const newPurchase = await tx.purchase.create({
        data: {
          invoiceNumber: data.invoiceNumber || `PUR-${Date.now()}`,
          totalAmount: data.totalAmount,
          supplierId: data.supplierId,
          businessId: businessId,
          userId: userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              unitId: item.unitId, // Save unitId
              quantity: item.quantity,
              unitCost: item.unitCost,
              total: item.total,
              businessId: businessId,
            })),
          },
        },
      });

      // 2. Update Stock Levels and record Stock Movements
      for (const item of data.items) {
        let actualQuantity = item.quantity;
        let baseUnitCost = item.unitCost;
        
        // Convert to base units if unitId is provided
        if (item.unitId) {
          const unit = await tx.productUnit.findUnique({
             where: { id: item.unitId }
          });
          if (unit) {
            const ratioVal = unit.ratio.toNumber();
            actualQuantity = item.quantity * ratioVal;
            baseUnitCost = item.unitCost / ratioVal;

            // Update the specific ProductUnit's costPrice to the new base unit cost
            await tx.productUnit.update({
              where: { id: item.unitId },
              data: { costPrice: baseUnitCost }
            });
          }
        }

        const product = await tx.product.update({
          where: { id: item.productId, businessId: businessId },
          data: {
            stockQuantity: {
              increment: actualQuantity,
            },
            costPrice: baseUnitCost, // Update cost price to the latest purchase price per base unit
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: actualQuantity,
            type: "IN",
            reason: `Purchase ${newPurchase.invoiceNumber}`,
            businessId: businessId,
            userId: userId,
          },
        });

        // Resolve any low stock notifications for this product (CRITICAL or LOW)
        console.log(`DEBUG: Checking stock for ${product.name}: ${product.stockQuantity} > ${product.minStockLevel}`);
        if (product.stockQuantity > product.minStockLevel) {
          const result = await tx.$executeRawUnsafe(`
            UPDATE "Notification" 
            SET "isRead" = true, "updatedAt" = NOW()
            WHERE "businessId" = $1 
            AND ("title" = $2 OR "title" = $3)
            AND "isRead" = false
          `, businessId, `Critical Low Stock: ${product.name}`, `Low Stock: ${product.name}`);
          console.log(`DEBUG: Notification update result:`, result);
        }
      }

      return newPurchase;
    });

    revalidatePath("/dashboard/inventory/products");
    revalidatePath("/dashboard/inventory/purchases");
    revalidatePath("/dashboard/inventory/low-stock");
    revalidatePath("/dashboard/inventory/overview");

    await logAudit({
      action: `Created Purchase: ${purchase.invoiceNumber} (Le ${Math.round(purchase.totalAmount.toNumber()).toLocaleString()})`,
      entity: "PURCHASE",
      entityId: purchase.id,
      newData: { invoiceNumber: purchase.invoiceNumber, totalAmount: purchase.totalAmount.toNumber() }
    });
    
    return { 
      success: true, 
      purchaseId: purchase.id,
      totalAmount: purchase.totalAmount.toNumber(),
      createdAt: purchase.createdAt.toISOString()
    };
  } catch (error) {
    console.error("Failed to process purchase:", error);
    throw error;
  }
}

export async function getPurchases() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const purchases = await prisma.purchase.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return purchases.map(p => ({
      id: p.id,
      invoiceNumber: p.invoiceNumber,
      totalAmount: p.totalAmount.toNumber(),
      supplierId: p.supplierId ?? null,
      businessId: p.businessId,
      userId: p.userId ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      supplier: p.supplier ? {
        id: p.supplier.id,
        name: p.supplier.name,
        email: p.supplier.email ?? null,
        phone: p.supplier.phone ?? null,
        address: p.supplier.address ?? null,
        businessId: p.supplier.businessId,
        createdAt: p.supplier.createdAt.toISOString(),
        updatedAt: p.supplier.updatedAt.toISOString(),
      } : null,
      items: p.items.map(item => ({
        id: item.id,
        purchaseId: item.purchaseId,
        productId: item.productId,
        unitId: item.unitId ?? null,
        quantity: item.quantity,
        unitCost: item.unitCost.toNumber(),
        total: item.total.toNumber(),
        businessId: item.businessId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku ?? null,
          unitPrice: item.product.unitPrice.toNumber(),
          costPrice: item.product.costPrice?.toNumber() ?? null,
          stockQuantity: Number(item.product.stockQuantity),
          minStockLevel: Number(item.product.minStockLevel),
          status: item.product.status,
          imageUrl: item.product.imageUrl ?? null,
          baseUnit: item.product.baseUnit ?? null,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
          deletedAt: item.product.deletedAt?.toISOString() ?? null,
        } : null
      }))
    }));
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    throw error;
  }
}

export async function createDraftPurchase(productId: string, quantity: number, unitCost: number) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const purchase = await prisma.purchase.create({
      data: {
        invoiceNumber: `DRAFT-${Date.now()}`,
        totalAmount: quantity * unitCost,
        status: "DRAFT",
        businessId: session.user.businessId,
        userId: session.user.id,
        items: {
          create: [{
            productId: productId,
            quantity: quantity,
            unitCost: unitCost,
            total: quantity * unitCost,
            businessId: session.user.businessId,
          }]
        }
      }
    });
    return { success: true, id: purchase.id };
  } catch (error) {
    console.error("Draft PO Error:", error);
    throw new Error("Failed to create Draft PO");
  }
}
