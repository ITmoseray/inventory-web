import { SubscriptionPlan } from "@prisma/client";

export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxProducts: 100,
    maxStaff: 2,
    analyticsEnabled: false,
    posEnabled: true,
  },
  [SubscriptionPlan.BASIC]: {
    maxProducts: 500,
    maxStaff: 5,
    analyticsEnabled: true,
    posEnabled: true,
  },
  [SubscriptionPlan.STANDARD]: {
    maxProducts: 5000,
    maxStaff: 10,
    analyticsEnabled: true,
    posEnabled: true,
  },
  [SubscriptionPlan.BUSINESS]: {
    maxProducts: Infinity,
    maxStaff: 15,
    analyticsEnabled: true,
    posEnabled: true,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxProducts: Infinity,
    maxStaff: Infinity,
    analyticsEnabled: true,
    posEnabled: true,
  },
};

export function canPerformAction(
  plan: SubscriptionPlan,
  action: keyof typeof PLAN_LIMITS[SubscriptionPlan],
  currentUsage: number = 0
): { allowed: boolean; message?: string } {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[action as keyof typeof limits];

  if (limit === false) {
    return { allowed: false, message: `This feature is not available on the ${plan} plan.` };
  }

  if (typeof limit === 'number' && currentUsage >= limit) {
    return { allowed: false, message: `You have reached the limit of ${limit} for ${action}. Please upgrade your plan.` };
  }

  return { allowed: true };
}
