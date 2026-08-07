"use server";

import { prisma as globalPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function subscribeUser(subscription: {
  endpoint: string;
  keys: { auth: string; p256dh: string };
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;
    const userId = session.user.id || null;

    // Find if subscription endpoint already exists
    const existing: any[] = await globalPrisma.$queryRaw`
      SELECT id FROM "PushSubscription" WHERE "endpoint" = ${subscription.endpoint} LIMIT 1
    `;

    if (existing.length > 0) {
      await globalPrisma.$executeRaw`
        UPDATE "PushSubscription" 
        SET "keysAuth" = ${subscription.keys.auth}, "keysP256dh" = ${subscription.keys.p256dh}, "businessId" = ${businessId}, "userId" = ${userId}
        WHERE id = ${existing[0].id}
      `;
    } else {
      const id = `sub_${crypto.randomUUID()}`;
      await globalPrisma.$executeRaw`
        INSERT INTO "PushSubscription" (id, endpoint, "keysAuth", "keysP256dh", "businessId", "userId", "createdAt")
        VALUES (${id}, ${subscription.endpoint}, ${subscription.keys.auth}, ${subscription.keys.p256dh}, ${businessId}, ${userId}, NOW())
      `;
    }
    return { success: true };
  } catch (err: any) {
    console.error("PUSH SUBSCRIBE ERROR:", err);
    return { success: false, error: err.message };
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await globalPrisma.$executeRaw`
      DELETE FROM "PushSubscription" WHERE "endpoint" = ${endpoint}
    `;
    return { success: true };
  } catch (err: any) {
    console.error("PUSH UNSUBSCRIBE ERROR:", err);
    return { success: false, error: err.message };
  }
}
