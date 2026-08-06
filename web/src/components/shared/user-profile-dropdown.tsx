"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserProfileDropdownProps {
  user: {
    name?: string | null;
    role?: string | null;
    image?: string | null;
  } | undefined;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const handleLogout = async () => {
    const { logoutUserCompletely } = await import("@/lib/utils/logout");
    await logoutUserCompletely(signOut);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight group-hover:text-primary transition-colors">
              {user?.name || "User Account"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
              {user?.role || "Member"}
            </p>
          </div>
          <Avatar className="h-9 w-9 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
            <AvatarFallback className="rounded-xl bg-primary text-white font-black text-xs">
              {(user?.name || "S").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 font-sans">
        <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer font-medium">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-bold" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
