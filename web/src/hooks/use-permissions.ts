import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function usePermissions() {
  const { data: session, status } = useSession();
  
  const canAccess = useCallback((permission: string | undefined): boolean => {
    // 1. If no permission required, allow
    if (!permission) return true;

    // 2. If no session, deny
    if (!session?.user) {
      console.log(`PERM DEBUG: Denied [${permission}] - No Session`);
      return false;
    }

    // 3. Super Admin bypasses all checks
    if (session.user.role === "SUPERADMIN") return true;

    // 4. Check user permissions
    const userPermissions = session.user.permissions || [];
    const hasPermission = userPermissions.includes(permission);
    
    if (!hasPermission) {
      console.log(`PERM DEBUG: Denied [${permission}] - Missing key in [${userPermissions.length}] permissions`);
    }

    return hasPermission;
  }, [session]);

  return { canAccess, status };
}
