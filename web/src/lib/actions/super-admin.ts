"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { logAudit } from "./audit";
import { updateSystemSettings } from "./system-settings";

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
  const business = await prisma.business.update({
    where: { id: businessId },
    data: { plan },
  });

  await logAudit({
    action: `UPDATED BUSINESS PLAN: ${business.name} to ${plan}`,
    entity: "BUSINESS",
    entityId: businessId,
  });

  revalidatePath("/super-admin/businesses");
}

export async function approveBusiness(businessId: string) {
  await checkSuperAdmin();
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, trialEndDate: true }
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

  await logAudit({
    action: `APPROVED BUSINESS NODE: ${business?.name || businessId}`,
    entity: "BUSINESS",
    entityId: businessId,
  });

  revalidatePath("/super-admin/businesses");
  revalidatePath("/super-admin/approvals");
}

export async function extendTrial(businessId: string, days: number = 7) {
  await checkSuperAdmin();
  const now = new Date();
  
  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      trialEndDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      subscriptionStatus: "INACTIVE" // Ensuring they are still in trial mode
    }
  });

  await logAudit({
    action: `EXTENDED TRIAL: ${business.name} by ${days} days`,
    entity: "BUSINESS",
    entityId: businessId,
  });
  
  revalidatePath("/super-admin/businesses");
  revalidatePath("/super-admin/approvals");
}

export async function deleteBusiness(businessId: string) {
  await checkSuperAdmin();
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true }
    });

    // Prisma onDelete: Cascade should handle related models if configured correctly in schema
    await prisma.business.delete({
      where: { id: businessId },
    });

    await logAudit({
      action: `DELETED BUSINESS NODE: ${business?.name || businessId}`,
      entity: "BUSINESS",
      entityId: businessId,
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

  // Persist the banner so all tenant dashboards display it
  await updateSystemSettings({ announcementBanner: message });

  const trimmed = message.trim();
  await logAudit({
    action: trimmed
      ? `ISSUED GLOBAL BROADCAST: "${trimmed.slice(0, 40)}${trimmed.length > 40 ? "..." : ""}"`
      : `CLEARED GLOBAL BROADCAST`,
    entity: "SYSTEM",
  });

  // Revalidate dashboard routes so the banner appears on next page load
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function toggleMaintenanceMode(enabled: boolean) {
  await checkSuperAdmin();
  console.log(`[MAINTENANCE MODE]: ${enabled}`);
  
  await logAudit({
    action: `TOGGLED MAINTENANCE MODE: ${enabled ? "ENABLED" : "DISABLED"}`,
    entity: "SYSTEM",
  });

  return { success: true, enabled };
}

const BACKUPS_DIR = path.join(process.cwd(), "../backups");

export async function generateBackup() {
  await checkSuperAdmin();

  try {
    const businesses = await prisma.business.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            status: true,
            roleId: true,
            createdAt: true,
          }
        }
      }
    });

    const auditLogs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        business: { select: { name: true } }
      }
    });

    const backupPayload = {
      timestamp: new Date().toISOString(),
      version: "Nexus-v4.2.0",
      exporter: "Super Admin Control",
      businesses,
      auditLogs
    };

    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `nexus-backup-${timestampStr}.json`;
    const filePath = path.join(BACKUPS_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2));

    console.log(`[DATABASE SNAPSHOT]: Generated ${filename}`);
    return { success: true, filename };
  } catch (error: any) {
    console.error("Database backup generation failed:", error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

export async function getBackupsList() {
  await checkSuperAdmin();

  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BACKUPS_DIR);
    const backupFiles = files
      .filter(f => f.startsWith("nexus-backup-") && f.endsWith(".json"))
      .map(filename => {
        const filePath = path.join(BACKUPS_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          sizeBytes: stats.size,
          createdAt: stats.birthtime.toISOString(),
        };
      });

    return backupFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to read backups directory:", error);
    return [];
  }
}

export async function deleteBackupFile(filename: string) {
  await checkSuperAdmin();

  try {
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUPS_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      throw new Error("File not found");
    }
  } catch (error: any) {
    console.error("Backup deletion failed:", error);
    throw new Error(`Deletion failed: ${error.message}`);
  }
}

export async function getAllSystemUsers() {
  await checkSuperAdmin();
  
  const users = await prisma.user.findMany({
    include: {
      business: { select: { name: true } },
      role: { select: { name: true } },
      auditLogs: {
        select: { createdAt: true, action: true },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return users.map(user => {
    const lastLog = user.auditLogs[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      role: user.role.name,
      business: user.business.name,
      lastActiveAt: lastLog?.createdAt.toISOString() || null,
      lastAction: lastLog?.action || null
    };
  });
}

export async function changeUserPassword(userId: string, newPasswordStr: string) {
  await checkSuperAdmin();
  if (newPasswordStr.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const hashedPassword = await bcrypt.hash(newPasswordStr, 10);
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword }
  });

  await logAudit({
    action: `RESET PASSWORD FOR USER: ${updatedUser.email}`,
    entity: "USER",
    entityId: userId,
  });

  return { success: true };
}

export async function changeOwnPassword(currentPasswordStr: string, newPasswordStr: string) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized access. SuperAdmin only.");
  }
  if (newPasswordStr.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!user) {
    throw new Error("User not found.");
  }

  const passwordMatch = await bcrypt.compare(currentPasswordStr, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Incorrect current password.");
  }

  const hashedPassword = await bcrypt.hash(newPasswordStr, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword }
  });

  await logAudit({
    action: `CHANGED OWN PASSWORD (SUPER ADMIN)`,
    entity: "USER",
    entityId: user.id,
  });

  return { success: true };
}

export async function toggleUserStatus(userId: string, status: "active" | "inactive") {
  await checkSuperAdmin();
  const session = await auth();
  if (session?.user?.id === userId) {
    throw new Error("Deactivating your own super admin account is blocked.");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status }
  });

  await logAudit({
    action: `TOGGLED STATUS FOR USER: ${updatedUser.email} TO ${status.toUpperCase()}`,
    entity: "USER",
    entityId: userId,
  });

  return { success: true };
}

