"use server";

import { prisma } from "@/lib/prisma";
import { createSystemNotification } from "./notification";
import { addDays } from "date-fns";

export async function runAutomatedSystemChecks() {
  try {
    console.log("[CRON] Initiating automated ecosystem health and alert scans...");
    let lowStockAlertsCount = 0;
    let expiryAlertsCount = 0;
    let trialAlertsCount = 0;

    // 1. Scan for Low Stock Products (Across all businesses)
    const allProducts = await prisma.product.findMany({
      where: { 
        deletedAt: null,
        type: { not: "SERVICE" }
      },
      select: { id: true, name: true, stockQuantity: true, minStockLevel: true, businessId: true }
    });
    
    // Group low stock by business
    const lowStockByBusiness: Record<string, typeof allProducts> = {};
    for (const p of allProducts) {
      const stock = Number(p.stockQuantity?.toString() || 0);
      const minLevel = Number(p.minStockLevel?.toString() || 0);
      if (stock <= minLevel) {
        if (!lowStockByBusiness[p.businessId]) {
          lowStockByBusiness[p.businessId] = [];
        }
        lowStockByBusiness[p.businessId].push(p);
      }
    }

    for (const [businessId, products] of Object.entries(lowStockByBusiness)) {
      const first = products[0];
      const otherCount = products.length - 1;
      const title = `Automated Stock Alert: Low Inventory`;
      let message = `Product "${first.name}" is low on stock (${first.stockQuantity} remaining).`;
      if (otherCount > 0) {
        message += ` Plus ${otherCount} other item(s) are low.`;
      }
      message += ` Please review inventory levels soon.`;

      await createSystemNotification(businessId, {
        title,
        message,
        type: "WARNING"
      });
      lowStockAlertsCount++;
    }

    // 2. Scan for Expiring Product Batches (Within 7 Days)
    const sevenDaysFromNow = addDays(new Date(), 7);
    const expiringBatches = await prisma.batch.findMany({
      where: {
        deletedAt: null,
        expiryDate: {
          gt: new Date(),
          lte: sevenDaysFromNow
        }
      },
      include: {
        product: { select: { name: true } }
      }
    });

    for (const batch of expiringBatches) {
      const expiryStr = batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "";
      await createSystemNotification(batch.businessId, {
        title: `Batch Expiration Warning`,
        message: `Batch #${batch.batchNumber} for "${batch.product.name}" expires soon on ${expiryStr}!`,
        type: "WARNING"
      });
      expiryAlertsCount++;
    }

    // 3. Scan for Trial Subscription Expirations (Expiring in 2 Days)
    const twoDaysFromNowStart = addDays(new Date(), 2);
    twoDaysFromNowStart.setHours(0, 0, 0, 0);
    const twoDaysFromNowEnd = new Date(twoDaysFromNowStart);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);

    const expiringTrials = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        subscriptionStatus: "INACTIVE", // still in trial
        trialEndDate: {
          gte: twoDaysFromNowStart,
          lte: twoDaysFromNowEnd
        }
      }
    });

    for (const biz of expiringTrials) {
      await createSystemNotification(biz.id, {
        title: `Trial Subscription Expiring`,
        message: `Your store trial for "${biz.name}" expires in 2 days. Upgrade to a paid plan now to avoid lockouts!`,
        type: "ERROR"
      });
      trialAlertsCount++;
    }

    console.log(`[CRON] Scan completed successfully. Dispatched: Low stock alerts: ${lowStockAlertsCount}, Expiring batches: ${expiryAlertsCount}, Expiring trials: ${trialAlertsCount}`);
    return { 
      success: true, 
      lowStockCount: lowStockAlertsCount,
      expiryCount: expiryAlertsCount,
      trialCount: trialAlertsCount
    };
  } catch (error: any) {
    console.error("[CRON] Automated system checks failed:", error);
    return { success: false, error: error.message };
  }
}
