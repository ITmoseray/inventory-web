"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 1. Record periodic heartbeat from client
export async function recordUserHeartbeat() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { success: false, reason: "No active session" };
    }

    const now = new Date();

    // Update User
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastActiveAt: now,
        isOnline: true,
      }
    });

    // Update Business lastActiveAt if not SuperAdmin
    if (session.user.role !== "SUPERADMIN") {
      await prisma.business.update({
        where: { id: session.user.businessId },
        data: {
          lastActiveAt: now,
        }
      });
    }

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// 2. Mark user offline upon explicit logout or tab close
export async function recordUserOffline() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isOnline: false,
        lastActiveAt: new Date(),
      }
    });

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// 3. Super Admin Real-time Ecosystem Online Presence
export async function getEcosystemOnlinePresence() {
  const session = await auth();
  const role = (session?.user as any)?.originalRole || session?.user?.role;
  if (!session || role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }

  const threshold = new Date(Date.now() - 3 * 60 * 1000); // Active in last 3 minutes

  const [activeUsers, recentLoginAudits, allBusinesses] = await Promise.all([
    // Active users
    prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "active",
        lastActiveAt: { gte: threshold },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            plan: true,
            logoUrl: true,
          }
        },
        role: { select: { name: true } }
      },
      orderBy: { lastActiveAt: "desc" }
    }),

    // Recent logins in last 24h
    prisma.auditLog.findMany({
      where: {
        action: { contains: "LOGGED IN", mode: "insensitive" },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      include: {
        user: { select: { name: true, email: true } },
        business: { select: { name: true, slug: true, type: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),

    // Total businesses with their user counts
    prisma.business.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        plan: true,
        lastActiveAt: true,
        _count: { select: { users: true } }
      }
    })
  ]);

  // Aggregate active businesses from active users
  const onlineBusinessesMap = new Map<string, any>();

  for (const u of activeUsers) {
    if (!u.business) continue;
    const bId = u.business.id;
    if (!onlineBusinessesMap.has(bId)) {
      onlineBusinessesMap.set(bId, {
        id: u.business.id,
        name: u.business.name,
        slug: u.business.slug,
        type: u.business.type,
        plan: u.business.plan,
        logoUrl: u.business.logoUrl,
        activeUsersCount: 0,
        activeUsers: []
      });
    }

    const b = onlineBusinessesMap.get(bId);
    b.activeUsersCount += 1;
    b.activeUsers.push({
      id: u.id,
      name: u.name || "Unnamed Staff",
      email: u.email,
      role: u.role.name,
      lastActiveAt: u.lastActiveAt?.toISOString() || null
    });
  }

  const onlineBusinesses = Array.from(onlineBusinessesMap.values());

  const formattedUsers = activeUsers.map(u => ({
    id: u.id,
    name: u.name || "Unnamed Operator",
    email: u.email,
    username: u.username,
    role: u.role.name,
    businessId: u.business?.id,
    businessName: u.business?.name || "Global / Nexus",
    businessType: u.business?.type || "SYSTEM",
    lastActiveAt: u.lastActiveAt?.toISOString() || null,
    isOnline: true
  }));

  const formattedLogins = recentLoginAudits.map(log => ({
    id: log.id,
    action: log.action,
    userName: log.user?.name || log.user?.email || "Unknown User",
    userEmail: log.user?.email || "",
    businessName: log.business?.name || "Independent",
    businessType: log.business?.type || "SHOP",
    timestamp: log.createdAt.toISOString()
  }));

  return {
    onlineUsersCount: activeUsers.length,
    onlineBusinessesCount: onlineBusinesses.length,
    onlineBusinesses,
    onlineUsers: formattedUsers,
    recentLogins: formattedLogins,
    totalBusinessesCount: allBusinesses.length,
    serverTime: new Date().toISOString()
  };
}
