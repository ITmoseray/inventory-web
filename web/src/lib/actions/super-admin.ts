"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

async function checkSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }
}

export async function getAllBusinesses() {
  await checkSuperAdmin();
  const businesses = await prisma.business.findMany({
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          sales: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return businesses.map(b => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    trialStartDate: b.trialStartDate?.toISOString() || null,
    trialEndDate: b.trialEndDate?.toISOString() || null,
  }));
}

export async function updateBusinessPlan(businessId: string, plan: any) {
  await checkSuperAdmin();
  await prisma.business.update({
    where: { id: businessId },
    data: { plan },
  });
  revalidatePath("/super-admin/businesses");
}

export async function approveBusiness(businessId: string) {
  await checkSuperAdmin();
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { trialEndDate: true }
  });

  const now = new Date();
  const data: any = { status: "ACTIVE" };

  // If trial is expired, give them a fresh 7 days upon approval
  if (business?.trialEndDate && business.trialEndDate < now) {
    data.trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  await prisma.business.update({
    where: { id: businessId },
    data,
  });
  revalidatePath("/super-admin/businesses");
  revalidatePath("/super-admin/approvals");
}

export async function extendTrial(businessId: string, days: number = 7) {
  await checkSuperAdmin();
  const now = new Date();
  
  await prisma.business.update({
    where: { id: businessId },
    data: {
      trialEndDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      subscriptionStatus: "INACTIVE" // Ensuring they are still in trial mode
    }
  });
  
  revalidatePath("/super-admin/businesses");
  revalidatePath("/super-admin/approvals");
}

export async function deleteBusiness(businessId: string) {
  await checkSuperAdmin();
  try {
    // Prisma onDelete: Cascade should handle related models if configured correctly in schema
    await prisma.business.delete({
      where: { id: businessId },
    });
    revalidatePath("/super-admin/businesses");
    revalidatePath("/super-admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete business:", error);
    throw new Error("Failed to delete business. Ensure all dependencies are handled.");
  }
}

export async function startImpersonation(businessId: string) {
  await checkSuperAdmin();
  
  const admin = await prisma.user.findFirst({
    where: { 
      businessId, 
      role: { name: 'ADMIN' } 
    },
  });

  if (!admin) {
    throw new Error("No admin user found for this business.");
  }

  // Set a secure cookie for impersonation
  (await cookies()).set("impersonation_target", admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { email: admin.email };
}

export async function stopImpersonation() {
  await checkSuperAdmin();
  (await cookies()).delete("impersonation_target");
  revalidatePath("/super-admin/businesses");
}

export async function resetTenantAdminPassword(businessId: string) {
  await checkSuperAdmin();
  
  const admin = await prisma.user.findFirst({
    where: { 
      businessId, 
      role: { name: 'ADMIN' } 
    },
  });

  if (!admin) {
    throw new Error("No admin user found for this business.");
  }

  // Generate a secure temporary password
  const newPassword = Math.random().toString(36).slice(-8) + '!' + Math.floor(Math.random() * 1000);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: hashedPassword },
  });

  return { email: admin.email, newPassword };
}

export async function getAuditLogs() {
  await checkSuperAdmin();
  
  const logs = await prisma.auditLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));
}

export async function getSystemStats() {
  await checkSuperAdmin();
  const [businessCount, userCount, totalSales, activeSubscriptions, pendingApprovals] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.sale.aggregate({
      _sum: { totalAmount: true }
    }),
    prisma.subscription.count({
        where: { status: 'active' }
    }),
    prisma.business.count({
      where: {
        OR: [
          { status: "PENDING" },
          { 
            trialEndDate: { lt: new Date() },
            subscriptionStatus: "INACTIVE"
          }
        ]
      }
    })
  ]);

  return {
    businessCount,
    userCount,
    revenue: Number(totalSales._sum.totalAmount) || 0,
    activeSubscriptions,
    pendingApprovals
  };
}

export async function getPendingTrialApprovals() {
  await checkSuperAdmin();
  const now = new Date();
  
  const pending = await prisma.business.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { 
          trialEndDate: { lt: now },
          subscriptionStatus: "INACTIVE"
        }
      ]
    },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          sales: true,
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return pending.map(b => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    trialEndDate: b.trialEndDate?.toISOString() || null,
    isExpired: b.trialEndDate ? new Date(b.trialEndDate) < now : false
  }));
}

export async function getEcosystemHealth() {
  await checkSuperAdmin();
  
  // Mock data for trends
  return {
    growth: [
      { name: "Jan", tenants: 10 },
      { name: "Feb", tenants: 25 },
      { name: "Mar", tenants: 45 },
      { name: "Apr", tenants: 80 },
      { name: "May", tenants: 120 },
      { name: "Jun", tenants: 180 },
    ],
    revenue: [
      { name: "Mon", value: 4000 },
      { name: "Tue", value: 3000 },
      { name: "Wed", value: 2000 },
      { name: "Thu", value: 2780 },
      { name: "Fri", value: 1890 },
      { name: "Sat", value: 2390 },
      { name: "Sun", value: 3490 },
    ]
  };
}

export async function globalBroadcast(message: string) {
  await checkSuperAdmin();
  console.log(`[GLOBAL BROADCAST]: ${message}`);
  // In a real app, this would create a notification for all businesses
  return { success: true };
}

export async function toggleMaintenanceMode(enabled: boolean) {
  await checkSuperAdmin();
  console.log(`[MAINTENANCE MODE]: ${enabled}`);
  // This would update a global setting in DB
  return { success: true, enabled };
}
