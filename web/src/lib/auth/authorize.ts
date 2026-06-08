import { auth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit/logger";

export async function canPerform(action: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const permissions = session?.user?.permissions || [];

  // SuperAdmin bypass
  if (role === "SUPERADMIN") {
    await logAuditEvent(userId, action, "SYSTEM", true);
    return true;
  }

  // Permission Check
  const hasPermission = permissions.includes(action);
  
  await logAuditEvent(userId, action, "AUTHORIZATION", hasPermission);

  if (!hasPermission) {
    throw new Error(`Access Denied: You do not have permission to perform ${action}`);
  }

  return true;
}
