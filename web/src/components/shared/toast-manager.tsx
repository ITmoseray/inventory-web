"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getNotifications, markAsRead } from "@/lib/actions/notification";
import { syncLowStockNotifications } from "@/lib/actions/stock-check";
import { useSession } from "next-auth/react";
import { registerPush } from "@/lib/push-register";
import { AlertCircle, Package, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export function ToastManager() {
  const { data: session } = useSession();
  const router = useRouter();
  const lastCheckRef = useRef<number>(0);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const { play: playSound } = useNotificationSound();

  useEffect(() => {
    if (!session?.user?.businessId) return;

    // Request native device notification permissions and sync push tokens
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            registerPush().catch(console.error);
          }
        });
      } else if (Notification.permission === "granted") {
        registerPush().catch(console.error);
      }
    }

    // Initial check
    runSyncAndFetch();

    // Check every 5 minutes for new alerts
    const interval = setInterval(() => {
      runSyncAndFetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  async function runSyncAndFetch() {
    try {
      // 1. Trigger server-side stock scan
      const now = Date.now();
      if (now - lastCheckRef.current > 60 * 60 * 1000) {
        await syncLowStockNotifications();
        lastCheckRef.current = now;
      }

      // 2. Fetch unread notifications
      const notifications = await getNotifications();
      const unread = notifications.filter((n: any) => !n.isRead);

      // 3. Only show toast for the most recent unread notification if not already shown
      if (unread.length > 0) {
        // Sort by createdAt descending to get the newest
        unread.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = unread[0];

        if (!notifiedIdsRef.current.has(latest.id)) {
          // Derive sound type from notification type
          const soundType =
            latest.type === "ERROR" ? "error" :
            latest.type === "WARNING" ? "warning" :
            latest.type === "SUCCESS" ? "success" : "info";
          playSound(soundType);
          showNotificationToast(latest);
          showNativeNotification(latest.title, latest.message, latest.id);
          notifiedIdsRef.current.add(latest.id);
        }
      }
    } catch (error) {
      console.error("Toast Sync Error:", error);
    }
  }

  function showNativeNotification(title: string, body: string, id: string) {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          body: body,
          icon: "/images/PA.png",
          tag: id
        });
        
        notif.onclick = (e) => {
          e.preventDefault();
          window.focus();
          router.push("/dashboard/system/notifications");
        };
      } catch (err) {
        console.error("Failed to trigger native notification object:", err);
      }
    }
  }

  function showNotificationToast(n: any) {
    const isCritical = n.title.toLowerCase().includes("critical") || n.type === "ERROR";
    
    toast.custom((t) => (
      <div 
        className="w-[350px] bg-white dark:bg-slate-900 border-l-4 border-rose-500 shadow-2xl rounded-2xl p-4 flex gap-4 items-start animate-in slide-in-from-right duration-500 cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={() => {
           toast.dismiss(t);
           router.push("/dashboard/inventory/products");
        }}
      >
        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
          {n.title.includes("Stock") ? <Package className="h-5 w-5 text-rose-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{n.title}</h4>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
          <div className="flex items-center gap-2 pt-1">
             <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Urgent Action</span>
             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Click to View</span>
          </div>
        </div>
      </div>
    ), {
      duration: 10000, // Show for 10 seconds
      position: "top-right"
    });
  }

  return null;
}
