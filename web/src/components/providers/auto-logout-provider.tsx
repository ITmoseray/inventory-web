"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes before timeout

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Only run on dashboard paths and when authenticated
    if (status !== "authenticated" || !pathname?.startsWith("/dashboard")) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      setShowWarning(false);

      warningId = setTimeout(() => {
        setShowWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: "/login?reason=inactivity" });
      }, INACTIVITY_TIMEOUT);
    };

    // Initialize timers
    resetTimer();

    // Set up activity listeners
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [status, pathname]);

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-rose-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex-1">
            <h4 className="font-bold">Inactivity Warning</h4>
            <p className="text-sm opacity-90">You will be logged out automatically in a few minutes due to inactivity.</p>
          </div>
          <button 
            onClick={() => setShowWarning(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      )}
    </>
  );
}
