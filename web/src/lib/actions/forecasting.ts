"use server";

import { prisma as db } from "@/lib/prisma";
import { endOfDay, startOfDay, subDays } from "date-fns";

export async function getInventoryForecast(businessId: string) {
  try {
    // 1. Get all products with current stock
    const products = await db.product.findMany({
      where: { 
        businessId, 
        status: { in: ["active", "ACTIVE"] } 
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        imageUrl: true,
      }
    });

    // 2. Calculate daily sales velocity over the last 30 days
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
    
    // We aggregate SaleItems for the last 30 days
    // Wait, prisma doesn't easily support group by with sum inside nested relations efficiently if there are millions.
    // But for this scale, it's fine.
    const saleItems = await db.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          businessId,
          createdAt: {
            gte: thirtyDaysAgo
          },
          status: "COMPLETED" // assuming we have status, or just successful sales
        }
      },
      _sum: {
        quantity: true
      }
    });

    const velocityMap = new Map();
    saleItems.forEach(item => {
      // average daily sales over 30 days
      const totalSold = Number(item._sum.quantity || 0);
      const dailyVelocity = totalSold / 30;
      velocityMap.set(item.productId, dailyVelocity);
    });

    // 3. Generate forecast
    const forecast = products.map(product => {
      const dailyVelocity = velocityMap.get(product.id) || 0;
      
      let daysUntilDepletion = 999;
      if (dailyVelocity > 0) {
         daysUntilDepletion = Math.floor(product.stockQuantity / dailyVelocity);
      }

      // Determine status
      let status = "HEALTHY";
      if (daysUntilDepletion <= 0 || product.stockQuantity <= 0) status = "OUT_OF_STOCK";
      else if (daysUntilDepletion <= 7) status = "CRITICAL";
      else if (daysUntilDepletion <= 14) status = "LOW";

      return {
        ...product,
        dailyVelocity: dailyVelocity.toFixed(2),
        daysUntilDepletion,
        status,
        suggestedOrderQty: dailyVelocity > 0 ? Math.ceil(dailyVelocity * 30) : 0 // Suggest ordering 30 days worth
      };
    });

    // 4. Sort by most critical first
    forecast.sort((a, b) => a.daysUntilDepletion - b.daysUntilDepletion);

    // Return top 5 critical items
    return forecast.filter(f => f.status !== "HEALTHY").slice(0, 5);

  } catch (error) {
    console.error("Forecasting Error:", error);
    return [];
  }
}
