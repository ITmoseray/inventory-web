import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function logAuditEvent(
  userId: string | undefined,
  action: string,
  entity: string,
  success: boolean,
  entityId?: string
) {
  const session = await auth();
  if (!session?.user?.businessId || !userId) return; // Silent fail if not authenticated

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        businessId: session.user.businessId,
        // Assuming success is logged in metadata if needed, or ignored for now if not in schema
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
