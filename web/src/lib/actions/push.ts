"use server";

import { prisma as globalPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function subscribeUser(subscription: { endpoint: string; keys: { auth: string; p256dh: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    const businessId = session.user.businessId;
    const userId = session.user.id || null;

    // Find if subscription endpoint already exists
    const existing: any[] = await globalPrisma.$queryRawUnsafe(`
      SELECT id FROM "PushSubscription" WHERE "endpoint" = $1 LIMIT 1
    `, subscription.endpoint);

    if (existing.length > 0) {
      // Update keys and business/user associations
      await globalPrisma.$executeRawUnsafe(`
        UPDATE "PushSubscription" 
        SET "keysAuth" = $1, "keysP256dh" = $2, "businessId" = $3, "userId" = $4
        WHERE id = $5
      `, subscription.keys.auth, subscription.keys.p256dh, businessId, userId, existing[0].id);
    } else {
      // Insert new subscription
      const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await globalPrisma.$executeRawUnsafe(`
        INSERT INTO "PushSubscription" (id, endpoint, "keysAuth", "keysP256dh", "businessId", "userId", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, id, subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh, businessId, userId);
    }
    return { success: true };
  } catch (err: any) {
    console.error("PUSH SUBSCRIBE ERROR:", err);
    return { success: false, error: err.message };
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await globalPrisma.$executeRawUnsafe(`
      DELETE FROM "PushSubscription" WHERE "endpoint" = $1
    `, endpoint);
    return { success: true };
  } catch (err: any) {
    console.error("PUSH UNSUBSCRIBE ERROR:", err);
    return { success: false, error: err.message };
  }
}
