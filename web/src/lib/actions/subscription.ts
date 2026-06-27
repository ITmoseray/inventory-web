"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendPendingApprovalNotification } from "@/lib/mail";

export async function getSubscription() {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const subscription = await prisma.subscription.findFirst({
    where: { businessId: session.user.businessId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return null;

  return {
    ...subscription,
    amount: subscription.amount.toNumber(),
    startDate: subscription.startDate.toISOString(),
    endDate: subscription.endDate.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

export async function createSubscription(data: any) {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const subscription = await prisma.subscription.create({
    data: {
      ...data,
      businessId: session.user.businessId,
    },
  });

  // Update business plan
  await prisma.business.update({
    where: { id: session.user.businessId },
    data: { plan: data.plan },
  });

  revalidatePath("/dashboard/settings");
  return subscription;
}

export async function requestSubscription(planName: string, billingPeriod: 'monthly' | 'annual' = 'monthly') {
  const session = await auth();
  if (!session?.user?.businessId) throw new Error("Unauthorized");

  const business = await prisma.business.update({
    where: { id: session.user.businessId },
    data: { 
      status: "PENDING",
      plan: planName.toUpperCase() as any,
      requestedBillingPeriod: billingPeriod,
    },
    select: { name: true, type: true, email: true, phone: true },
  });

  // Notify Super Admin by email — fire-and-forget
  sendPendingApprovalNotification({
    businessName: business.name,
    businessType: business.type,
    email: business.email,
    phone: business.phone,
    plan: planName.toUpperCase(),
    billingPeriod,
    reason: 'SUBSCRIPTION_REQUEST',
  }).catch(console.error);

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}
