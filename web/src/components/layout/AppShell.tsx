"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { canAccess } = usePermissions();
  return (
    <SidebarProvider canAccess={canAccess}>
      <AppSidebar />
      <SidebarInset className={cn(
          "flex flex-1 flex-col w-full h-full min-h-[100dvh] overflow-x-hidden",
          "px-3 sm:px-4 md:px-6 lg:px-8",
          "pb-[env(safe-area-inset-bottom)]"
      )}>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
