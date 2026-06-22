import { AppShell } from "@/components/layout/AppShell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Search, Zap } from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ToastManager } from "@/components/shared/toast-manager";
import { LogoutButton } from "@/components/shared/logout-button";
import { TrialBanner } from "@/components/shared/trial-banner";
import { RealTimeClock } from "@/components/shared/real-time-clock";
import { QuickActions } from "@/components/shared/quick-actions";
import { OnboardingTrigger } from "@/components/shared/onboarding-trigger";
import { BusinessSwitcher } from "@/components/shared/business-switcher";
import { DynamicBreadcrumb } from "@/components/shared/dynamic-breadcrumb";
import { GlobalSearch } from "@/components/shared/global-search";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("DEBUG: DashboardLayout auth() error:", error);
    session = null;
  }

  if (!session) {
      return <>{children}</>;
  }

  // Force Super Admin redirect
  if (session?.user?.role === "SUPERADMIN") {
      redirect("/super-admin");
  }

  if (session?.user?.businessId && session?.user?.role !== "SUPERADMIN") {
    try {
      const businessExists = await prisma.business.findUnique({
        where: { id: session.user.businessId },
        select: { id: true }
      });

      if (!businessExists) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center space-y-4 p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100">
               <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6" />
               </div>
               <h2 className="text-xl font-black text-slate-900 dark:text-white">Session Expired</h2>
               <p className="text-slate-500 font-medium max-w-xs">Your business profile was not found. This usually happens after a system reset.</p>
               <a href="/register" className="block w-full h-12 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center">
                 Register New Business
               </a>
            </div>
          </div>
        );
      }
    } catch (dbError) {
      console.error("Layout Database Error:", dbError);
    }
  }

  return (
      <AppShell>
          <ToastManager />
          <OnboardingTrigger />
          <div id="welcome-center" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 pointer-events-none opacity-0" />
          <TrialBanner />
          <header className="flex h-20 shrink-0 items-center justify-between gap-3 md:gap-6 border-b border-slate-100 bg-white sticky top-0 z-40 px-4 md:px-8 transition-all">
            <div className="flex items-center gap-2 md:gap-6 flex-1">
              <SidebarTrigger className="-ml-1" />
              <BusinessSwitcher 
                currentBusinessId={session?.user?.businessId} 
                currentBusinessName={session?.user?.businessName} 
              />
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-3 md:gap-6">
               <RealTimeClock />
               <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                  <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Context Active</span>
               </div>
               <NotificationBell />
               <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                  <div className="text-right hidden sm:block">
                     <p className="text-xs font-[1000] text-slate-900 dark:text-white leading-none">
                        {session?.user?.name || "User Account"}
                     </p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{session?.user?.role || "Member"} Account</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-sm shadow-inner">
                     {(session?.user?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <LogoutButton />
               </div>
            </div>
          </header>
          <main className="flex-1 px-4 md:px-8 py-6">
            <DynamicBreadcrumb />
            {children}
          </main>
          <QuickActions />
      </AppShell>
  );
}
