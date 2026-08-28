import { AppShell } from "@/components/layout/AppShell";
import { AutoLogoutProvider } from "@/components/providers/auto-logout-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Zap, AlertCircle, Clock, Crown } from "lucide-react";
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
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlockScreenSignout } from "@/components/shared/block-screen-signout";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";
import { UserProfileDropdown } from "@/components/shared/user-profile-dropdown";
import { OfflineSyncIndicator } from "@/components/shared/offline-sync-indicator";
import { PresenceHeartbeatProvider } from "@/components/providers/presence-heartbeat-provider";
import { TeamChatBell } from "@/components/shared/team-chat-bell";
import { HeaderThemeToggle } from "@/components/shared/header-theme-toggle";
import { TeamChatWidget } from "@/components/chat/team-chat-widget";

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
          subscriptionTier: true,
          trialEndsAt: true,
          subscriptionExpiresAt: true,
          businessType: true,
          createdAt: true,
        }
      });
    } catch (e) {
      console.error("Error fetching business for status check:", e);
    }
  }

  const isMasterAdmin = session?.user?.email === "strangesteven001@gmail.com";

  // Check if account is suspended or pending
  if (!isMasterAdmin && business && (business.status === "SUSPENDED" || business.status === "PENDING" || business.status === "REJECTED")) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full text-center space-y-6">
          {/* Status Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
            {business.status === "PENDING" ? (
              <Clock className="w-10 h-10 animate-pulse" />
            ) : (
              <AlertCircle className="w-10 h-10" />
            )}
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              {business.status === "PENDING" && "Account Under Review"}
              {business.status === "SUSPENDED" && "Organization Suspended"}
              {business.status === "REJECTED" && "Registration Declined"}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {business.status === "PENDING" &&
                "Your organization account is currently being provisioned by our team. You'll receive full access as soon as verification is complete."}
              {business.status === "SUSPENDED" &&
                "Access to this organization has been temporarily suspended by system administrators. Please contact executive support to restore access."}
              {business.status === "REJECTED" &&
                "Your registration request could not be approved at this time. Contact support for more information."}
            </p>
          </div>

          {/* Business Info Chip */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">ORGANIZATION ID</span>
              <span className="text-slate-300 font-mono font-bold truncate max-w-[200px]">{business.id}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">CURRENT STATUS</span>
              <span className={`font-mono font-black uppercase text-xs px-2 py-0.5 rounded-full ${
                business.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {business.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://wa.me/23273019699?text=Hello%20Protech%20Support,%20I%20need%20assistance%20with%20my%20account%20status."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Contact Support
            </a>
            <BlockScreenSignout />
          </div>
        </div>
      </div>
    );
  }

  // Check for expired trial / subscription
  if (!isMasterAdmin && business && business.subscriptionTier === "TRIAL") {
    const isExpired = business.trialEndsAt && new Date(business.trialEndsAt) < new Date();
    if (isExpired) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
              <Clock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Trial Period Expired</h1>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Your 14-day premium trial has ended. To continue accessing your inventory, POS, and financial records, please upgrade your subscription plan.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">ORGANIZATION ID</span>
                <span className="text-slate-300 font-mono font-bold truncate max-w-[200px]">{business.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">EXPIRED ON</span>
                <span className="text-amber-400 font-mono font-bold">
                  {new Date(business.trialEndsAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/pricing"
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro Plan
              </Link>
              <BlockScreenSignout />
            </div>
          </div>
        </div>
      );
    }
  }

  const isImpersonating = (session?.user as any)?.originalRole === "SUPERADMIN";

  return (
    <div className="flex flex-col min-h-screen w-full">
      {isImpersonating && (
        <ImpersonationBanner businessName={session?.user?.businessName || "Business"} />
      )}
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen w-full">
      <AppShell>
          <AutoLogoutProvider>
            <ToastManager />
            <OnboardingTrigger businessCreatedAt={business?.createdAt ? new Date(business.createdAt).toISOString() : undefined} />
          <div id="welcome-center" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 pointer-events-none opacity-0" />
          <TrialBanner />
          <AnnouncementBanner />
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-[hsl(222.2,47.4%,11.2%)]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 transition-all shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <SidebarTrigger className="flex-shrink-0" />
              <div className="hidden md:block flex-1 max-w-md">
                <GlobalSearch />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
               <Link href="/dashboard/intelligence/chat" className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-primary dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  AI Assistant
               </Link>
               <HeaderThemeToggle />
               <TeamChatBell />
               <NotificationBell />
               <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />
               <UserProfileDropdown user={session?.user as any} />
            </div>
          </header>
          <main className="flex-1 px-4 md:px-8 py-6 relative z-10">
            <DynamicBreadcrumb />
            <PresenceHeartbeatProvider>
              {children}
            </PresenceHeartbeatProvider>
          </main>
          <QuickActions />
          <OfflineSyncIndicator />
          <TeamChatWidget />
          </AutoLogoutProvider>
        </AppShell>
      </div>
    </div>
    </div>
  );
}
