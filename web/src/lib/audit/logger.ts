import { prisma } from "@/lib/prisma";

export async function logAuditEvent(
  userId: string | undefined,
  action: string,
  module: string,
  success: boolean,
  entityId?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module,
        success,
        entityId,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
