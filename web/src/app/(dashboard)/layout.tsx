import { AppShell } from "@/components/layout/AppShell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Zap, AlertCircle, Clock } from "lucide-react";
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
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlockScreenSignout } from "@/components/shared/block-screen-signout";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";

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

  let business: any = null;

  if (session?.user?.businessId && session?.user?.role !== "SUPERADMIN") {
    try {
      business = await prisma.business.findUnique({
        where: { id: session.user.businessId },
        select: { 
          id: true, 
          status: true, 
          plan: true, 
          trialEndDate: true,
          subscriptionStatus: true,
          name: true,
          createdAt: true
        }
      });

      if (!business) {
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

      const now = new Date();
      const isTrialExpired = business.trialEndDate && new Date(business.trialEndDate) < now;

      // Check Business Status (Awaiting Activation)
      // A trial business (FREE plan) is automatically active and should only be blocked if the trial has expired.
      if (business.status === "PENDING" && (business.plan !== "FREE" || isTrialExpired)) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans p-6 py-12 text-slate-200 relative overflow-y-auto">
             {/* Background Grid Pattern */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
             
             <div className="max-w-md w-full p-6 sm:p-8 md:p-10 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden group my-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                <div className="h-20 w-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5 group-hover:scale-105 transition-transform duration-500">
                   <Clock className="h-10 w-10 animate-pulse text-amber-500" />
                </div>
                
                <div className="space-y-3">
                   <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter">Activation <span className="text-amber-500">Pending</span></h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Awaiting Admin Approval</p>
                </div>
                
                <p className="text-slate-400 font-normal text-sm leading-relaxed">
                   Your subscription for the <strong>{business.plan} Plan</strong> has been registered. An administrator is currently verifying the payment details. Once verified, your store will be activated immediately.
                </p>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2 text-left">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Store Name</p>
                  <p className="text-xs font-black text-white">{business.name}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                   <a 
                     href="https://wa.me/23234955581"
                     target="_blank"
                     className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center font-bold"
                   >
                     Verify Faster on WhatsApp
                   </a>
                   <BlockScreenSignout />
                </div>
             </div>
          </div>
        );
      }

      // Check Trial Expiration
      if (isTrialExpired && business.subscriptionStatus === "INACTIVE") {
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans p-6 py-12 text-slate-200 relative overflow-y-auto">
             {/* Background Grid Pattern */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
             
             <div className="max-w-md w-full p-6 sm:p-8 md:p-10 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden group my-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                <div className="h-20 w-20 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/5 group-hover:scale-105 transition-transform duration-500">
                   <AlertCircle className="h-10 w-10 text-rose-500" />
                </div>
                
                <div className="space-y-3">
                   <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter">Trial <span className="text-rose-500">Expired</span></h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Free Trial Period Finished</p>
                </div>
                
                <p className="text-slate-400 font-normal text-sm leading-relaxed">
                   Your 7-day free trial for <strong>{business.name}</strong> has ended. Please choose and subscribe to a plan to keep using your inventory system.
                </p>
                
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                   <a 
                     href="/pricing"
                     className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center font-bold"
                   >
                     See Plans & Subscribe
                   </a>
                   <BlockScreenSignout />
                </div>
             </div>
          </div>
        );
      }
    } catch (dbError) {
      console.error("Layout Database Error:", dbError);
    }
  }



  const isImpersonating = (session?.user as any)?.originalRole === "SUPERADMIN";

  return (
    <div className="flex flex-col min-h-screen w-full">
      {isImpersonating && (
        <ImpersonationBanner businessName={session?.user?.businessName || "Business"} />
      )}
      {/* Banner sits OUTSIDE AppShell — full viewport width, no sidebar padding */}
      <AnnouncementBanner />
      <AppShell>
          <ToastManager />
          <OnboardingTrigger businessCreatedAt={business?.createdAt ? new Date(business.createdAt).toISOString() : undefined} />
          <div id="welcome-center" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 pointer-events-none opacity-0" />
          <TrialBanner />
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 md:gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-background sticky top-0 z-40 px-4 md:px-6 transition-all">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
              <SidebarTrigger className="-ml-1 flex-shrink-0" />
              <div className="flex-shrink-0">
                <RealTimeClock />
              </div>
              {/* Search is hidden below lg to avoid collision */}
              <div className="hidden lg:block flex-1 min-w-0 max-w-xs xl:max-w-sm">
                <GlobalSearch />
              </div>
            </div>

            {/* RIGHT: badges + user — flex-shrink-0 keeps it from wrapping */}
            <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
               {/* Context Active: only xl+ */}
               <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                  <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Context Active</span>
               </div>
               <NotificationBell />
               <div className="flex items-center gap-2 xl:gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
                  {/* User name: only xl+ */}
                  <div className="text-right hidden xl:block">
                     <p className="text-xs font-[1000] text-slate-900 dark:text-white leading-none">
                        {session?.user?.name || "User Account"}
                     </p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{session?.user?.role || "Member"} Account</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-inner flex-shrink-0">
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
    </div>
  );
}
