"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "./notification";
import { subHours } from "date-fns";

export async function syncLowStockNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) return { success: false, message: "Unauthorized" };
    const businessId = session.user.businessId;

    // 1. Find products with low stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        businessId,
        stockQuantity: {
          lte: prisma.product.fields.minStockLevel
        }
      }
    });

    if (lowStockProducts.length === 0) return { success: true, count: 0 };

    // 2. Check which products were already notified recently (last 4 hours)
    // This satisfies the "5 alerts in 24 hours" requirement (24/4.8 = 5)
    const recentlyNotified = await prisma.notification.findMany({
      where: {
        businessId,
        type: "LOW_STOCK_CRITICAL",
        createdAt: {
          gte: subHours(new Date(), 4)
        }
      },
      select: { title: true }
    });

    const notifiedTitles = new Set(recentlyNotified.map(n => n.title));
    let createdCount = 0;

    // Filter to products not yet notified recently
    const productsToNotify = lowStockProducts.filter(p => !notifiedTitles.has(`Critical Low Stock: ${p.name}`));

    if (productsToNotify.length > 0) {
      const product = productsToNotify[0];
      const otherCount = productsToNotify.length - 1;
      const alertTitle = `Critical Low Stock: ${product.name}`;
      
      let message = `Product "${product.name}" is at ${product.stockQuantity} units. Minimum required: ${product.minStockLevel}.`;
      if (otherCount > 0) {
        message += ` (Note: ${otherCount} other product(s) are also low on stock)`;
      }
      message += ` Please restock immediately.`;

      await createNotification({
        title: alertTitle,
        message: message,
        type: "ERROR"
      });
      
      createdCount = 1;
    }

    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Failed to sync stock alerts:", error);
    return { success: false };
  }
}
