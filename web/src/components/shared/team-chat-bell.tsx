"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUnreadChatCount } from "@/lib/actions/team-chat";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function TeamChatBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreads = async () => {
    try {
      const res = await getUnreadChatCount();
      setUnreadCount(res.count || 0);
    } catch (e) {}
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreads();
      const interval = setInterval(fetchUnreads, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <Link href="/dashboard/chat">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Team & Staff Messages"
      >
        <MessageSquare className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-950 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
