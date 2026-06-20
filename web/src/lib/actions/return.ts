"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function processReturn(data: {
  saleId: string;
  items: { productId: string; quantity: number }[];
  reason?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      let totalAmountReturned = 0;

      for (const item of data.items) {
        // 0. Fetch Sale Item to get price information
        const saleItem = await tx.saleItem.findFirst({
          where: { saleId: data.saleId, productId: item.productId }
        });
        if (!saleItem) throw new Error("Sale item not found");

        if (item.quantity > saleItem.quantity) {
          throw new Error(
            `Cannot return ${item.quantity} units of "${saleItem.productName || "Product"}". Only ${saleItem.quantity} units remain in this sale.`
          );
        }

        // Calculate total amount to deduct
        const totalToDeduct = Number(saleItem.unitPrice) * item.quantity;
        totalAmountReturned += totalToDeduct;

        // 1. Update Stock (Increment back)
        await tx.product.update({
          where: { id: item.productId, businessId: businessId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });

        // 2. Decrement SaleItem quantity and total to maintain integrity and prevent duplicate returns
        await tx.saleItem.update({
          where: { id: saleItem.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            total: {
              decrement: totalToDeduct,
            },
          },
        });

        // 3. Record Stock Movement (Type RETURN)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: "RETURN",
            reason: data.reason || `Returned from Sale ${data.saleId}`,
            businessId: businessId,
            userId: userId,
          },
        });
      }

      // 4. Update Sale status and totalAmount based on remaining items (done once outside the loop to optimize DB roundtrips)
      const remainingItems = await tx.saleItem.findMany({
        where: { saleId: data.saleId }
      });
      const hasRemainingProducts = remainingItems.some(si => si.quantity > 0);

      await tx.sale.update({
        where: { id: data.saleId, businessId: businessId },
        data: {
          totalAmount: {
            decrement: totalAmountReturned,
          },
          status: hasRemainingProducts ? "PARTIAL_RETURN" : "RETURNED",
        },
      });

      // 5. Adjust Customer Debt if a debt record is linked to this sale
      const debt = await tx.debt.findUnique({
        where: { saleId: data.saleId }
      });
      if (debt) {
        const updatedTotalAmount = Math.max(0, Number(debt.totalAmount) - totalAmountReturned);
        const isFullyPaid = updatedTotalAmount <= Number(debt.paidAmount);
        await tx.debt.update({
          where: { id: debt.id },
          data: {
            totalAmount: updatedTotalAmount,
            status: isFullyPaid ? "PAID" : debt.status,
          },
        });
      }
    }, {
      maxWait: 15000, // Wait up to 15 seconds to acquire a connection
      timeout: 30000, // Allow up to 30 seconds for the transaction to complete
    });

    revalidatePath("/dashboard/inventory/products");
    revalidatePath("/dashboard/inventory/history");
    
    return { success: true, timestamp: new Date().toISOString() };
  } catch (error: any) {
    console.error("Failed to process return:", error);
    throw new Error(error.message || "Failed to process return.");
  }
}

export async function getReturns() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const returns = await prisma.stockMovement.findMany({
      where: { 
        businessId: session.user.businessId,
        type: "RETURN"
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        user: true
      }
    });

    return returns.map(r => ({
      id: r.id,
      productName: r.product?.name || "Unknown Product",
      quantity: r.quantity,
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
      userName: r.user?.name || "System"
    }));
  } catch (error) {
    console.error("Failed to fetch returns:", error);
    throw error;
  }
}
