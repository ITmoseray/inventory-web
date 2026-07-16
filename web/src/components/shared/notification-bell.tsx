"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, AlertCircle, Info, CheckCircle2, Volume2, VolumeX, X, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/actions/notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isMuted, toggleMute } = useNotificationSound();
  const [muted, setMuted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    setClearingAll(true);
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    } finally {
      setClearingAll(false);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "WARNING": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "ERROR":   return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "WARNING": return "border-l-amber-400";
      case "ERROR":   return "border-l-rose-500";
      case "SUCCESS": return "border-l-emerald-500";
      default:        return "border-l-blue-400";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Bell className="h-4 w-4 text-slate-400 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-96 rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden dark:bg-slate-950"
      >
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">System Alerts</h3>
            {notifications.length > 0 && (
              <p className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">
                {unreadCount > 0 ? `${unreadCount} unread` : "All read"} · {notifications.length} total
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = toggleMute();
              setMuted(next);
              toast.success(next ? "Notification sounds muted" : "Notification sounds enabled");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-[9px] font-black uppercase tracking-widest"
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? "Muted" : "Sound On"}
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
          {notifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">
                No alerts. You&apos;re all clear!
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "relative p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3 cursor-pointer group transition-colors border-l-4",
                  getBorderColor(n.type),
                  !n.isRead
                    ? "bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
                onClick={() => handleMarkAsRead(n.id)}
              >
                <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>

                <div className="flex-1 space-y-1 pr-6">
                  <p className={cn(
                    "text-xs font-black text-slate-800 dark:text-white leading-tight",
                    !n.isRead && "text-indigo-700 dark:text-indigo-300"
                  )}>
                    {n.title}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {format(new Date(n.createdAt), "hh:mm a • MMM dd")}
                  </p>
                </div>

                {/* Individual delete button */}
                <button
                  onClick={(e) => handleDelete(e, n.id)}
                  disabled={deletingId === n.id}
                  className="absolute top-3 right-3 h-6 w-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                  title="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Click to mark read
            </span>
            <Button
              variant="ghost"
              disabled={clearingAll}
              className="h-7 px-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 tracking-widest gap-1.5"
              onClick={handleClearAll}
            >
              <Trash2 className="h-3 w-3" />
              {clearingAll ? "Clearing…" : "Clear All"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
