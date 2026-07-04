"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, AlertCircle, Info, CheckCircle2, Volume2, VolumeX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isMuted, toggleMute } = useNotificationSound();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
    fetchNotifications();
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

  async function handleClearAll() {
    try {
      await markAllAsRead();
      fetchNotifications();
      toast.success("All alerts cleared");
    } catch (error) {
      console.error(error);
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "WARNING": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "ERROR": return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
           <Bell className="h-4 w-4 text-slate-400 dark:text-slate-300" />
           {unreadCount > 0 && (
             <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border-2 border-white dark:border-slate-900">
                {unreadCount}
             </span>
           )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80 rounded-[1.5rem] border-none shadow-2xl p-0 overflow-hidden dark:bg-slate-950">
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
           <h3 className="font-black text-sm uppercase tracking-widest">System Alerts</h3>
           <button
             onClick={(e) => { e.stopPropagation(); const next = toggleMute(); setMuted(next); toast.success(next ? "Notification sounds muted" : "Notification sounds enabled"); }}
             className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-[9px] font-black uppercase tracking-widest"
             title={muted ? "Unmute sounds" : "Mute sounds"}
           >
             {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
             {muted ? "Muted" : "Sound On"}
           </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
           {notifications.length === 0 ? (
             <div className="p-8 text-center">
               <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
               <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">No recent alerts.</p>
             </div>
           ) : (
             notifications.map((n) => (
               <div 
                 key={n.id} 
                 className={cn(
                   "p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors",
                   !n.isRead && "bg-blue-50/30 dark:bg-blue-900/10"
                 )}
                 onClick={() => handleMarkAsRead(n.id)}
               >
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                     <p className={cn("text-xs font-black text-slate-800 dark:text-white", !n.isRead && "text-primary")}>{n.title}</p>
                     <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{n.message}</p>
                     <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">{format(new Date(n.createdAt), "hh:mm a • MMM dd")}</p>
                  </div>
               </div>
             ))
           )}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
           <Button 
             variant="ghost" 
             className="h-7 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 tracking-widest"
             onClick={handleClearAll}
           >
             Clear All History
           </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
