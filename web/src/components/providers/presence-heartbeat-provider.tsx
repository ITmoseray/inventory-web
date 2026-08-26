"use client";

import { useEffect, useRef } from "react";
import { recordUserHeartbeat, recordUserOffline } from "@/lib/actions/presence";
import { useSession } from "next-auth/react";

export function PresenceHeartbeatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    // 1. Initial Heartbeat
    recordUserHeartbeat().catch(() => {});
    lastPingRef.current = Date.now();

    // 2. Periodic Interval Heartbeat every 45 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        recordUserHeartbeat().catch(() => {});
        lastPingRef.current = Date.now();
      }
    }, 45000);

    // 3. User interaction activity throttle (at most once every 30s)
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastPingRef.current > 30000 && navigator.onLine) {
        lastPingRef.current = now;
        recordUserHeartbeat().catch(() => {});
      }
    };

    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });

    // 4. Tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        recordUserHeartbeat().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Cleanup on unmount / unload
    const handleBeforeUnload = () => {
      // Fire-and-forget offline flag
      recordUserOffline().catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [status, session]);

  return <>{children}</>;
}
