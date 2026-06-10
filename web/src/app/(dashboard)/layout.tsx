import { AppShell } from "@/components/layout/AppShell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bell, Search } from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ToastManager } from "@/components/shared/toast-manager";
import { LogoutButton } from "@/components/shared/logout-button";
import { TrialBanner } from "@/components/shared/trial-banner";
import { RealTimeClock } from "@/components/shared/real-time-clock";
import { QuickActions } from "@/components/shared/quick-actions";
import { OnboardingTrigger } from "@/components/shared/onboarding-trigger";
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
               <h2 className="text-xl font-black text-slate-900">Session Expired</h2>
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
          <header className="flex h-20 shrink-0 items-center justify-between gap-6 border-b border-slate-100 bg-white sticky top-0 z-40 px-4 md:px-8 transition-all">
            <div className="flex items-center gap-6 flex-1">
              <SidebarTrigger className="-ml-1" />
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                   {session?.user?.business?.name || "Tech Enterprise"}
                 </span>
              </div>
              <div className="relative w-full max-w-md group hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search in Customers ( / )" 
                   className="w-full h-11 bg-slate-50 rounded-xl border-none pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 transition-all"
                 />
              </div>
            </div>

            <div className="flex items-center gap-6">
               <NotificationBell />
               <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                  <div className="text-right hidden sm:block">
                     <p className="text-xs font-[1000] text-slate-900 leading-none">
                        {session?.user?.name || "strangesteven001"}
                     </p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Admin Account</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-sm">
                     {(session?.user?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <LogoutButton />
               </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <QuickActions />
      </AppShell>
  );
}
