"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorePlan } from "@prisma/client";

export interface StorePlanConfig {
  id: StorePlan;
  name: string;
  tagline: string;
  priceMonthlySLE: number;
  priceYearlySLE: number;
  priceUSD: number;
  badge?: string;
  isPopular?: boolean;
  limits: {
    aiGenerations: number; // monthly limit
    products: number; // max active products
    customDomain: boolean;
    enterpriseSync: boolean;
    analytics: boolean;
    removeWatermark: boolean;
  };
  features: string[];
}

export const STORE_PLANS_CONFIG: Record<StorePlan, StorePlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free Starter",
    tagline: "Ideal for testing your business idea and making your first online sales.",
    priceMonthlySLE: 0,
    priceYearlySLE: 0,
    priceUSD: 0,
    limits: {
      aiGenerations: 5,
      products: 10,
      customDomain: false,
      enterpriseSync: false,
      analytics: false,
      removeWatermark: false,
    },
    features: [
      "1 Standalone Online Store",
      "Up to 10 Store Products",
      "5 AI Store Generations / Month",
      "Subdomain (e.g. yourstore.protech.sl)",
      "Direct WhatsApp 1-Click Ordering",
      "20+ Starter Templates",
      "0% Platform Transaction Fee",
      "Standard Community Support"
    ]
  },
  PRO: {
    id: "PRO",
    name: "Pro Merchant",
    tagline: "For growing brands and creators who want unlimited products and custom domains.",
    priceMonthlySLE: 250,
    priceYearlySLE: 2500, // 2 months free
    priceUSD: 15,
    badge: "MOST POPULAR",
    isPopular: true,
    limits: {
      aiGenerations: 50,
      products: 999999, // unlimited
      customDomain: true,
      enterpriseSync: false,
      analytics: true,
      removeWatermark: true,
    },
    features: [
      "Everything in Free Starter",
      "Unlimited Products & Collections",
      "50 AI Generations & Redesigns / Month",
      "AI Product Copywriter & Auto-Tagging",
      "Connect Custom Domain (e.g. yourbrand.com)",
      "Visitor & Order Revenue Analytics",
      "Custom Theme Palettes & Fonts",
      "Remove 'Powered by ProTech' Badge",
      "Priority WhatsApp Merchant Support"
    ]
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business & Scale",
    tagline: "For established businesses that require full stock sync, live POS, and multi-store management.",
    priceMonthlySLE: 600,
    priceYearlySLE: 6000,
    priceUSD: 35,
    limits: {
      aiGenerations: 999999, // unlimited
      products: 999999,
      customDomain: true,
      enterpriseSync: true,
      analytics: true,
      removeWatermark: true,
    },
    features: [
      "Everything in Pro Merchant",
      "Unlimited Stores & Unlimited Products",
      "Unlimited AI Generations & Prompt Tuning",
      "Full Enterprise OS Sync (Live POS & Multi-Warehouse)",
      "Automated Inventory Stock Deduction on Order",
      "Multi-Currency & International Card Checkout",
      "Custom CSS & Script Embeds",
      "Dedicated Account Manager & VIP Onboarding"
    ]
  }
};

/**
 * 1. Fetch Store Billing Overview
 */
export async function getStoreBillingOverviewAction(storeId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const businessId = session.user.businessId;

  // Resolve store
  const store = await prisma.store.findFirst({
    where: storeId
      ? { id: storeId }
      : {
          OR: [
            ...(businessId ? [{ businessId }] : []),
            { ownerId: userId }
          ]
        },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      _count: {
        select: { products: true }
      }
    }
  });

  if (!store) {
    return {
      success: false,
      error: "No store found",
      plan: STORE_PLANS_CONFIG.FREE,
      allPlans: STORE_PLANS_CONFIG,
      aiGenerationsUsed: 0,
      aiGenerationsLimit: 5,
      productsCount: 0,
      productsLimit: 10,
      customDomainAllowed: false,
      planExpiresAt: null,
      activeSubscription: null,
      history: []
    };
  }

  const currentPlanConfig = STORE_PLANS_CONFIG[store.plan] || STORE_PLANS_CONFIG.FREE;
  const activeSubscription = store.subscriptions.find(s => s.status === "active" && new Date(s.endDate) > new Date()) || null;

  return {
    success: true,
    storeId: store.id,
    storeName: store.name,
    plan: currentPlanConfig,
    allPlans: STORE_PLANS_CONFIG,
    aiGenerationsUsed: store.aiGenerationsUsed,
    aiGenerationsLimit: store.aiGenerationsLimit,
    productsCount: store._count.products,
    productsLimit: store.productsLimit,
    customDomainAllowed: store.customDomainAllowed,
    planExpiresAt: store.planExpiresAt?.toISOString() || null,
    activeSubscription: activeSubscription ? {
      ...activeSubscription,
      amount: Number(activeSubscription.amount),
      startDate: activeSubscription.startDate.toISOString(),
      endDate: activeSubscription.endDate.toISOString(),
      createdAt: activeSubscription.createdAt.toISOString()
    } : null,
    history: store.subscriptions.map(s => ({
      ...s,
      amount: Number(s.amount),
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      createdAt: s.createdAt.toISOString()
    }))
  };
}

/**
 * 2. Upgrade Store Plan
 */
export async function upgradeStorePlanAction(input: {
  storeId: string;
  plan: StorePlan;
  billingCycle: "monthly" | "yearly";
  paymentMethod?: string;
  paymentRef?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { storeId, plan, billingCycle, paymentMethod = "orange_money", paymentRef } = input;
  const targetPlan = STORE_PLANS_CONFIG[plan];
  if (!targetPlan) throw new Error("Invalid plan selected");

  // Verify ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      OR: [
        { ownerId: session.user.id },
        ...(session.user.businessId ? [{ businessId: session.user.businessId }] : [])
      ]
    }
  });

  if (!store) throw new Error("Store not found or unauthorized");

  const now = new Date();
  const durationMonths = billingCycle === "yearly" ? 12 : 1;
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  const cost = billingCycle === "yearly" ? targetPlan.priceYearlySLE : targetPlan.priceMonthlySLE;

  // Transaction: update store quota and record subscription
  const result = await prisma.$transaction(async (tx) => {
    // Expire any existing active subscriptions
    await tx.storeSubscription.updateMany({
      where: { storeId, status: "active" },
      data: { status: "canceled" }
    });

    // Create subscription record if cost > 0
    let subscription = null;
    if (cost > 0) {
      subscription = await tx.storeSubscription.create({
        data: {
          storeId,
          userId: session.user.id,
          plan,
          amount: cost,
          currency: "SLE",
          billingCycle,
          status: "active",
          paymentMethod,
          paymentRef: paymentRef || `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          startDate: now,
          endDate
        }
      });
    }

    // Update store plan & limits
    const updatedStore = await tx.store.update({
      where: { id: storeId },
      data: {
        plan,
        aiGenerationsLimit: targetPlan.limits.aiGenerations,
        productsLimit: targetPlan.limits.products,
        customDomainAllowed: targetPlan.limits.customDomain,
        planExpiresAt: plan === "FREE" ? null : endDate
      }
    });

    return { store: updatedStore, subscription };
  });

  revalidatePath("/dashboard/store-builder");
  revalidatePath("/super-admin/stores");

  return {
    success: true,
    message: `Store upgraded to ${targetPlan.name} successfully!`,
    plan: targetPlan.id,
    limits: targetPlan.limits
  };
}

/**
 * 3. Check and Record AI Generation Allowance
 */
export async function checkAndRecordAIGenerationAllowance(storeId: string): Promise<{
  allowed: boolean;
  reason?: string;
  used: number;
  limit: number;
}> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      plan: true,
      aiGenerationsUsed: true,
      aiGenerationsLimit: true,
      planExpiresAt: true
    }
  });

  if (!store) {
    return { allowed: true, used: 0, limit: 5 };
  }

  // Check if paid plan expired
  if (store.plan !== "FREE" && store.planExpiresAt && new Date() > store.planExpiresAt) {
    // Revert to FREE limits
    await prisma.store.update({
      where: { id: store.id },
      data: {
        plan: "FREE",
        aiGenerationsLimit: 5,
        productsLimit: 10,
        customDomainAllowed: false
      }
    });
    return {
      allowed: store.aiGenerationsUsed < 5,
      reason: "Your Pro plan has expired. Please renew to continue using Pro features.",
      used: store.aiGenerationsUsed,
      limit: 5
    };
  }

  if (store.aiGenerationsUsed >= store.aiGenerationsLimit) {
    return {
      allowed: false,
      reason: `You have reached your limit of ${store.aiGenerationsLimit} AI generations for the current period. Upgrade to Pro Merchant for 50 generations.`,
      used: store.aiGenerationsUsed,
      limit: store.aiGenerationsLimit
    };
  }

  // Increment usage
  await prisma.store.update({
    where: { id: store.id },
    data: { aiGenerationsUsed: { increment: 1 } }
  });

  return {
    allowed: true,
    used: store.aiGenerationsUsed + 1,
    limit: store.aiGenerationsLimit
  };
}
