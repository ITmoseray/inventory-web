"use server";

import { prisma as globalPrisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

// Configure Web Push VAPID credentials
try {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:protechassist36@gmail.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (error) {
  console.warn("Failed to initialize Web Push VAPID keys. Push notifications disabled.");
}

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    const notifications: any = await globalPrisma.$queryRaw`
      SELECT * FROM "Notification"
      WHERE "businessId" = ${businessId} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
      LIMIT 100
    `;

    return notifications.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt).toISOString(),
    }));
  } catch (error: any) {
    console.error("NOTIFICATION ERROR (getNotifications):", error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}

export async function markAsRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await globalPrisma.$executeRaw`
      UPDATE "Notification" SET "isRead" = true, "updatedAt" = NOW()
      WHERE id = ${id} AND "businessId" = ${session.user.businessId}
    `;

    revalidatePath("/dashboard/system/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await globalPrisma.$executeRaw`
      UPDATE "Notification" SET "isRead" = true, "updatedAt" = NOW()
      WHERE "businessId" = ${session.user.businessId} AND "isRead" = false
    `;

    revalidatePath("/dashboard/system/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}

async function createNotificationInternal(
  businessId: string,
  data: { title: string; message: string; type?: string }
) {
  // Smart Alert: Check if an unread notification with this exact title already exists
  const existing: any[] = await globalPrisma.$queryRaw`
    SELECT id FROM "Notification"
    WHERE "businessId" = ${businessId} AND "title" = ${data.title} AND "isRead" = false AND "deletedAt" IS NULL
    LIMIT 1
  `;

  if (existing.length > 0) {
    await globalPrisma.$executeRaw`
      UPDATE "Notification" SET "updatedAt" = NOW(), "message" = ${data.message}
      WHERE id = ${existing[0].id}
    `;
  } else {
    const id = `notif_${crypto.randomUUID()}`;
    const type = data.type || "INFO";

    await globalPrisma.$executeRaw`
      INSERT INTO "Notification" (id, title, message, type, "isRead", "businessId", "updatedAt", "createdAt")
      VALUES (${id}, ${data.title}, ${data.message}, ${type}, false, ${businessId}, NOW(), NOW())
    `;
  }

  revalidatePath("/dashboard/system/notifications");

  // Trigger Web Push notifications
  try {
    const payload = JSON.stringify({
      title: data.title,
      body: data.message,
      url: "/dashboard/system/notifications",
    });

    const subscriptions: any[] = await globalPrisma.$queryRaw`
      SELECT id, endpoint, "keysAuth", "keysP256dh" FROM "PushSubscription" WHERE "businessId" = ${businessId}
    `;

    for (const sub of subscriptions) {
      try {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keysAuth,
            p256dh: sub.keysP256dh,
          },
        };
        await webpush.sendNotification(pushConfig, payload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await globalPrisma.$executeRaw`
            DELETE FROM "PushSubscription" WHERE id = ${sub.id}
          `;
        } else {
          console.error("Failed to send web push to subscription:", sub.id, err);
        }
      }
    }
  } catch (pushErr) {
    console.error("Web Push trigger failed:", pushErr);
  }
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) return;
    const businessId = session.user.businessId;
    await createNotificationInternal(businessId, data);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createSystemNotification(
  businessId: string,
  data: { title: string; message: string; type?: string }
) {
  try {
    await createNotificationInternal(businessId, data);
  } catch (error) {
    console.error("Failed to create system notification:", error);
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await globalPrisma.$executeRaw`
      UPDATE "Notification" SET "deletedAt" = NOW()
      WHERE id = ${id} AND "businessId" = ${session.user.businessId}
    `;

    revalidatePath("/dashboard/system/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
}

export async function deleteAllNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;

    await globalPrisma.$executeRaw`
      UPDATE "Notification" SET "deletedAt" = NOW()
      WHERE "businessId" = ${businessId} AND "deletedAt" IS NULL
    `;

    revalidatePath("/dashboard/system/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear all notifications:", error);
    throw error;
  }
}
