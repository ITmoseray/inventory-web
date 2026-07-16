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

    // 1. Get all non-service products
    const allProducts = await prisma.product.findMany({
      where: { businessId, type: { not: "SERVICE" }, deletedAt: null },
      select: { id: true, name: true, stockQuantity: true, minStockLevel: true },
    });

    // 2. Identify products that are NOW back above threshold
    //    → auto-delete stale LOW_STOCK_CRITICAL notifications for those products
    const healthyProducts = allProducts.filter(
      (p) => Number(p.stockQuantity) > Number(p.minStockLevel)
    );

    if (healthyProducts.length > 0) {
      const healthyTitles = healthyProducts.map((p) => `Critical Low Stock: ${p.name}`);
      await prisma.notification.deleteMany({
        where: {
          businessId,
          type: "LOW_STOCK_CRITICAL",
          title: { in: healthyTitles },
        },
      });

      // Also clean up ERROR-type low stock alerts (old format used type: "ERROR")
      await prisma.notification.deleteMany({
        where: {
          businessId,
          type: "ERROR",
          title: { in: healthyTitles },
        },
      });
    }

    // 3. Identify products that are still low / critical
    const lowStockProducts = allProducts.filter(
      (p) => Number(p.stockQuantity) <= Number(p.minStockLevel)
    );

    if (lowStockProducts.length === 0) return { success: true, count: 0 };

    // 4. Check which low-stock products were already notified recently (last 4 hours)
    //    to avoid spamming the same alert repeatedly
    const recentlyNotified = await prisma.notification.findMany({
      where: {
        businessId,
        createdAt: { gte: subHours(new Date(), 4) },
        OR: [
          { type: "LOW_STOCK_CRITICAL" },
          { type: "ERROR", title: { startsWith: "Critical Low Stock:" } },
        ],
      },
      select: { title: true },
    });

    const notifiedTitles = new Set(recentlyNotified.map((n) => n.title));

    // 5. Only notify for products not already notified in the last 4 hours
    const productsToNotify = lowStockProducts.filter(
      (p) => !notifiedTitles.has(`Critical Low Stock: ${p.name}`)
    );

    if (productsToNotify.length === 0) return { success: true, count: 0 };

    // 6. Create one grouped alert (most critical first: zero stock)
    const sorted = [...productsToNotify].sort(
      (a, b) => Number(a.stockQuantity) - Number(b.stockQuantity)
    );
    const product = sorted[0];
    const otherCount = sorted.length - 1;
    const alertTitle = `Critical Low Stock: ${product.name}`;

    let message = `Product "${product.name}" is at ${product.stockQuantity} units. Minimum required: ${product.minStockLevel}.`;
    if (otherCount > 0) {
      message += ` (${otherCount} other product${otherCount > 1 ? "s" : ""} also low on stock)`;
    }
    message += ` Please restock immediately.`;

    await createNotification({ title: alertTitle, message, type: "ERROR" });

    return { success: true, count: 1 };
  } catch (error) {
    console.error("Failed to sync stock alerts:", error);
    return { success: false };
  }
}
