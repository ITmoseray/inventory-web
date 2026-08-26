"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";

const MASTER_SUPER_ADMIN_EMAIL = "strangesteven001@gmail.com";

/**
 * Validates that the active session is a SUPERADMIN and determines if they are the Supreme Master
 */
export async function checkMasterSuperAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() || "";
  const isMaster = email === MASTER_SUPER_ADMIN_EMAIL.toLowerCase();
  const roleName = (session?.user as any)?.role?.name || (session?.user as any)?.originalRole || session?.user?.role;
  const isSuper = isMaster || roleName === "SUPERADMIN";

  return { session, isMaster, isSuper };
}

/**
 * Verifies the Master Super Admin credentials / password to unlock the secure surveillance observatory
 */
export async function verifyMasterSuperAdminLogin(password: string) {
  try {
    const { session, isMaster } = await checkMasterSuperAdmin();

    if (!isMaster) {
      return { 
        success: false, 
        error: `Access Denied: Supreme Master Super Admin authority required (${MASTER_SUPER_ADMIN_EMAIL}).` 
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: MASTER_SUPER_ADMIN_EMAIL, mode: "insensitive" } },
          { id: session?.user?.id || "" }
        ]
      },
      select: { id: true, passwordHash: true, email: true, name: true }
    });

    if (!user || !user.passwordHash) {
      return { 
        success: false, 
        error: "Master Super Admin account credentials not found." 
      };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { 
        success: false, 
        error: "Invalid Master Super Admin Security Passcode." 
      };
    }

    try {
      await logAudit({
        action: `MASTER SUPER ADMIN OBSERVATORY UNLOCKED: ${user.email}`,
        entity: "SYSTEM"
      });
    } catch (e) {
      console.warn("Audit logging failed on observatory unlock:", e);
    }

    return { 
      success: true, 
      verifiedEmail: user.email, 
      masterName: user.name || "Dr. Strange" 
    };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || "Failed to verify master passcode." 
    };
  }
}

/**
 * Returns comprehensive telemetry of all Super Admins, their live online presence,
 * and complete chronological audit log stream of everything they do and who did it.
 */
export async function getMasterSuperAdminTelemetry() {
  try {
    const { session, isMaster, isSuper } = await checkMasterSuperAdmin();

    if (!session || !isSuper) {
      return {
        error: "Unauthorized: Super Admin access required.",
        currentUserEmail: session?.user?.email || null,
        isMasterSuperAdmin: false,
        masterAdminEmail: MASTER_SUPER_ADMIN_EMAIL,
        metrics: {
          totalSuperAdmins: 0,
          otherSuperAdminsCount: 0,
          onlineSuperAdmins: 0,
          actionsToday: 0,
          actionsThisWeek: 0,
          totalActionsLogged: 0,
          mostActiveAdminName: "None",
          mostActiveAdminEmail: "None",
          mostActiveAdminActions: 0
        },
        superAdmins: [],
        activities: []
      };
    }

    const threshold = new Date(Date.now() - 3 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // 1. Fetch all Super Admins safely
    let allSuperAdmins: any[] = [];
    try {
      allSuperAdmins = await prisma.user.findMany({
        where: {
          OR: [
            { role: { name: "SUPERADMIN" } },
            { email: { equals: MASTER_SUPER_ADMIN_EMAIL, mode: "insensitive" } }
          ]
        },
        include: {
          role: { select: { name: true } },
          business: { select: { name: true, type: true } },
          _count: {
            select: { auditLogs: true }
          },
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
              id: true,
              action: true,
              entity: true,
              createdAt: true
            }
          }
        },
        orderBy: [
          { createdAt: "desc" }
        ]
      });
    } catch (e) {
      console.error("Failed to query super admins:", e);
    }

    // 2. Fetch comprehensive Super Admin audit logs stream safely
    let superAdminLogs: any[] = [];
    try {
      superAdminLogs = await prisma.auditLog.findMany({
        where: {
          OR: [
            { user: { role: { name: "SUPERADMIN" } } },
            { user: { email: { equals: MASTER_SUPER_ADMIN_EMAIL, mode: "insensitive" } } }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              imageUrl: true,
              role: { select: { name: true } }
            }
          },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 200
      });
    } catch (e) {
      console.error("Failed to query super admin audit logs:", e);
    }

    // 3. Format super admin operators
    const formattedOperators = allSuperAdmins.map((admin) => {
      const isActuallyOnline = admin.lastActiveAt ? new Date(admin.lastActiveAt) >= threshold : false;
      const isThisMaster = admin.email ? admin.email.toLowerCase() === MASTER_SUPER_ADMIN_EMAIL.toLowerCase() : false;

      return {
        id: admin.id,
        name: admin.name || "Super Admin",
        email: admin.email || "N/A",
        username: admin.username || "admin",
        status: admin.status || "ACTIVE",
        isMaster: isThisMaster,
        isOnline: isActuallyOnline,
        lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString() : null,
        lastActiveAt: admin.lastActiveAt ? new Date(admin.lastActiveAt).toISOString() : null,
        createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : new Date().toISOString(),
        totalActionsCount: admin._count?.auditLogs || 0,
        recentActions: (admin.auditLogs || []).map((l: any) => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString()
        }))
      };
    });

    // 4. Format activity stream
    const formattedLogs = superAdminLogs.map((log) => ({
      id: log.id,
      action: log.action || "SYSTEM_ACTION",
      entity: log.entity || "SYSTEM",
      entityId: log.entityId || null,
      oldData: log.oldData || null,
      newData: log.newData || null,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
      operator: {
        id: log.user?.id || "N/A",
        name: log.user?.name || "Super Admin",
        email: log.user?.email || "N/A",
        username: log.user?.username || "admin",
        image: log.user?.imageUrl || null,
        isMaster: log.user?.email ? log.user.email.toLowerCase() === MASTER_SUPER_ADMIN_EMAIL.toLowerCase() : false
      },
      business: log.business ? {
        id: log.business.id,
        name: log.business.name,
        type: log.business.type
      } : null
    }));

    // 5. Aggregate metrics
    const actionsToday = formattedLogs.filter((l) => new Date(l.createdAt) >= todayStart).length;
    const actionsThisWeek = formattedLogs.filter((l) => new Date(l.createdAt) >= weekStart).length;
    const onlineCount = formattedOperators.filter((o) => o.isOnline).length;

    // Find most active other super admin
    const otherOperators = formattedOperators.filter((o) => !o.isMaster);
    const mostActive = otherOperators.sort((a, b) => b.totalActionsCount - a.totalActionsCount)[0] || null;

    return {
      currentUserEmail: session?.user?.email,
      isMasterSuperAdmin: isMaster,
      masterAdminEmail: MASTER_SUPER_ADMIN_EMAIL,
      metrics: {
        totalSuperAdmins: formattedOperators.length,
        otherSuperAdminsCount: otherOperators.length,
        onlineSuperAdmins: onlineCount,
        actionsToday,
        actionsThisWeek,
        totalActionsLogged: formattedLogs.length,
        mostActiveAdminName: mostActive ? mostActive.name : "None",
        mostActiveAdminEmail: mostActive ? mostActive.email : "None",
        mostActiveAdminActions: mostActive ? mostActive.totalActionsCount : 0
      },
      superAdmins: formattedOperators,
      activities: formattedLogs
    };
  } catch (err: any) {
    console.error("Master telemetry fatal catch:", err);
    return {
      error: err.message || "Failed to load master telemetry.",
      currentUserEmail: null,
      isMasterSuperAdmin: false,
      masterAdminEmail: MASTER_SUPER_ADMIN_EMAIL,
      metrics: {
        totalSuperAdmins: 0,
        otherSuperAdminsCount: 0,
        onlineSuperAdmins: 0,
        actionsToday: 0,
        actionsThisWeek: 0,
        totalActionsLogged: 0,
        mostActiveAdminName: "None",
        mostActiveAdminEmail: "None",
        mostActiveAdminActions: 0
      },
      superAdmins: [],
      activities: []
    };
  }
}

/**
 * Toggle active/suspended status of another Super Admin
 */
export async function toggleOtherSuperAdminStatus(targetUserId: string, newStatus: "ACTIVE" | "INACTIVE") {
  try {
    const { isMaster } = await checkMasterSuperAdmin();

    if (!isMaster) {
      return { 
        success: false, 
        error: `Restricted: Only Supreme Master Super Admin (${MASTER_SUPER_ADMIN_EMAIL}) can modify Super Admin accounts.` 
      };
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true, name: true }
    });

    if (!target) {
      return { success: false, error: "Target Super Admin user not found." };
    }

    if (target.email.toLowerCase() === MASTER_SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "Cannot deactivate the Supreme Master Super Admin account." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus }
    });

    await logAudit({
      action: `MASTER OVERRIDE: Changed Super Admin status for ${target.email} to ${newStatus}`,
      entity: "USER",
      entityId: targetUserId
    });

    revalidatePath("/super-admin/master-monitor");
    revalidatePath("/super-admin");
    return { success: true, email: target.email, status: newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update Super Admin status." };
  }
}

/**
 * Override password of another Super Admin
 */
export async function overrideOtherSuperAdminPassword(targetUserId: string, newPasswordStr: string) {
  try {
    const { isMaster } = await checkMasterSuperAdmin();

    if (!isMaster) {
      return { 
        success: false, 
        error: `Restricted: Only Supreme Master Super Admin (${MASTER_SUPER_ADMIN_EMAIL}) can override Super Admin credentials.` 
      };
    }

    if (newPasswordStr.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true }
    });

    if (!target) {
      return { success: false, error: "Target Super Admin user not found." };
    }

    const hashedPassword = await bcrypt.hash(newPasswordStr, 10);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash: hashedPassword }
    });

    await logAudit({
      action: `MASTER OVERRIDE: Reset password credentials for Super Admin: ${target.email}`,
      entity: "USER",
      entityId: targetUserId
    });

    revalidatePath("/super-admin/master-monitor");
    return { success: true, email: target.email };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to override password." };
  }
}
