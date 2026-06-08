"use client";

import { useSession } from "next-auth/react";

export function usePermissions() {
  const { data: session } = useSession();
  
  const canAccess = (permission: string | undefined): boolean => {
    // 1. If no permission required, allow
    if (!permission) return true;

    // 2. If no session, deny
    if (!session?.user) return false;

    // 3. Super Admin bypasses all checks
    if (session.user.role === "SUPERADMIN") return true;

    // 4. Check user permissions
    const userPermissions = session.user.permissions || [];
    
    // Default to deny
    return userPermissions.includes(permission);
  };

  return { canAccess };
}
