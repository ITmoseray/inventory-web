"use client";

import * as React from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Pin, PinOff, Building2, Store, 
  ChevronRight, ChevronDown, LogOut, Bell, ShieldCheck, Activity as ActivityIcon, 
  CreditCard, Wallet, UserCheck, Book, DollarSign, UserCircle, Calculator,
  Crown, ArrowRight, Trophy, Download, ClipboardCheck, Megaphone, MessageSquare, Star,
  Brain, Boxes, TrendingUp, UserCog, Shield, PieChart, Receipt, Warehouse, ClipboardList, HelpCircle, AlertCircle, Tag
} from "lucide-react";
import { useLogoutFeedback } from "@/components/providers/logout-feedback-provider";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { ProfessionalCalculator } from "@/components/shared/professional-calculator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarColorPicker } from "@/components/shared/sidebar-color-picker";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { getBusinessContext } from "@/lib/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { barSidebarConfig } from "@/lib/sidebar-configs/bar";
import { restaurantSidebarConfig } from "@/lib/sidebar-configs/restaurant";
import { pharmacySidebarConfig } from "@/lib/sidebar-configs/pharmacy";
import { supermarketSidebarConfig } from "@/lib/sidebar-configs/supermarket";
import { shopSidebarConfig } from "@/lib/sidebar-configs/shop";
import { boutiqueSidebarConfig } from "@/lib/sidebar-configs/boutique";
import { electronicsSidebarConfig } from "@/lib/sidebar-configs/electronics";
import { warehouseSidebarConfig } from "@/lib/sidebar-configs/warehouse";
import { clinicSidebarConfig } from "@/lib/sidebar-configs/clinic";
import { hospitalSidebarConfig } from "@/lib/sidebar-configs/hospital";
import { officeSidebarConfig } from "@/lib/sidebar-configs/office";
import { getSchoolSidebarConfig } from "@/lib/sidebar-configs/school";
import { simpleSalesProfitSidebarConfig } from "@/lib/sidebar-configs/simple-sales-profit";

const getSidebarConfig = (type: string, institutionType?: string | null) => {
  switch (type) {
    case "BAR": return barSidebarConfig;
    case "RESTAURANT": return restaurantSidebarConfig;
    case "PHARMACY": return pharmacySidebarConfig;
    case "SUPERMARKET": return supermarketSidebarConfig;
    case "SHOP": return shopSidebarConfig;
    case "BOUTIQUE": return boutiqueSidebarConfig;
    case "ELECTRONICS": return electronicsSidebarConfig;
    case "WAREHOUSE": return warehouseSidebarConfig;
    case "CLINIC": return clinicSidebarConfig;
    case "HOSPITAL": return hospitalSidebarConfig;
    case "OFFICE": return officeSidebarConfig;
    case "SCHOOL": return getSchoolSidebarConfig(institutionType);
    default: return null; 
  }
};

interface NavItem {
    title: string;
    url: string;
    icon?: any;
    permission?: string;
    items?: NavItem[];
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const SidebarContentRenderer = ({ 
  filteredNavGroups, 
  businessContext, 
  businessType, 
  session, 
  pathname 
}: any) => {
  const { setOpenMobile, state, isMobile, isPinned = true, togglePin = () => {}, isHovered = false } = useSidebar();
  const { openLogoutFeedback } = useLogoutFeedback();
  const isCollapsed = !isPinned && !isHovered && !isMobile;
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Auto-expand the active section on mount or pathname change
  React.useEffect(() => {
    filteredNavGroups.forEach((group: NavGroup) => {
      group.items.forEach((item: NavItem) => {
        if (item.items?.some(sub => pathname.startsWith(sub.url))) {
          if (!expandedItems.includes(item.title)) {
            setExpandedItems(prev => [...prev, item.title]);
          }
        }
      });
    });
  }, [pathname, filteredNavGroups]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };
  
  return (
    <>
      <SidebarHeader className={cn("transition-all duration-300", isCollapsed ? "pt-4 px-2 pb-3 space-y-3" : "pt-5 px-3.5 pb-2")}>
        {/* COLLAPSED HEADER */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 py-1">
            {/* 1. Brand Logo Badge */}
            <Link 
              href="/dashboard" 
              title="Inventory OS — ProTech Assist"
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform shrink-0"
            >
              <Store className="w-4 h-4 text-white" />
            </Link>

            {/* 2. Business Logo Badge */}
            <div 
              title={`${businessContext?.name && businessContext.name !== "Loading..." ? businessContext.name : (session?.user?.businessName || "Business Node")} (${businessType || "ENTERPRISE"} UNIT)`}
              className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10 border border-white/20 shadow-md group cursor-pointer hover:border-primary/50 transition-all hover:scale-105 shrink-0"
            >
              {businessContext?.logoUrl ? (
                <Image 
                  src={businessContext.logoUrl} 
                  alt="Business Logo" 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-indigo-600 to-primary text-white font-bold text-[10px] uppercase">
                  {(businessContext?.name && businessContext.name !== "Loading...")
                    ? businessContext.name.charAt(0).toUpperCase() 
                    : (session?.user?.businessName ? session.user.businessName.charAt(0).toUpperCase() : <Building2 className="h-3.5 w-3.5 text-white/80" />)}
                </div>
              )}
              {/* Online Pulse Dot */}
              <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-[#0B1629] animate-pulse" />
            </div>

            {/* 3. Pin Action Button */}
            <button
              onClick={togglePin}
              title="Pin Sidebar Open"
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-110 shrink-0"
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* EXPANDED HEADER */
          <>
            <div className="flex items-center justify-between gap-2">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2.5 min-w-0" 
                onClick={() => setOpenMobile(false)}
              >
                <div className="relative flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] shadow-md shadow-blue-500/20">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div className="relative flex flex-col leading-none transition-all duration-300 min-w-0">
                  <span className="font-display font-bold text-[13.5px] text-white tracking-tight truncate">
                    Inventory OS
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                    ProTech Assist
                  </span>
                </div>
              </Link>

              {/* Pin / Unpin Button */}
              <button
                onClick={togglePin}
                title={isPinned ? "Unpin Sidebar (Hover to Expand)" : "Pin Sidebar (Keep Open)"}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center transition-all shrink-0 border",
                  isPinned 
                    ? "bg-[#1B3357] border-[#2563EB]/40 text-blue-400 hover:bg-[#234070]" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                )}
              >
                {isPinned ? <Pin className="h-3.5 w-3.5 fill-current" /> : <PinOff className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            {/* Business Context Card */}
            <div className="mt-3.5 mb-2">
               <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner group transition-all hover:border-[#2563EB]/40 flex items-center gap-2.5">
                  <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-white/20 bg-slate-800 shrink-0 flex items-center justify-center shadow-sm">
                    {businessContext?.logoUrl ? (
                      <Image 
                        src={businessContext.logoUrl} 
                        alt="Logo" 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase">
                        {(businessContext?.name && businessContext.name !== "Loading...")
                          ? businessContext.name.charAt(0).toUpperCase()
                          : (session?.user?.businessName ? session.user.businessName.charAt(0).toUpperCase() : <Building2 className="h-3.5 w-3.5 text-white" />)}
                      </div>
                    )}
                    <div className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-[#0B1629] animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate block group-hover:text-blue-400 transition-colors">
                      {(businessContext?.name && businessContext.name !== "Loading...") 
                        ? businessContext.name 
                        : (session?.user?.businessName || "Protech Store Node")}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider truncate">
                        {businessType || "ENTERPRISE"} UNIT
                      </span>
                    </div>
                  </div>
               </div>
            </div>
          </>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-3 overflow-y-auto custom-scrollbar">
        <SidebarMenu className="gap-6 pb-8">
          {filteredNavGroups.length === 0 && (
             <div className="px-4 py-8 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN" 
                    ? "Neural Interface Initializing..." 
                    : "No Intelligence Nodes Found"}
                </p>
                <p className="text-[9px] text-slate-400 mt-2 italic">
                  {session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN"
                    ? "Establishing connection to Africa trade vault..."
                    : "Check permissions or business type configuration."}
                </p>
             </div>
          )}
          {filteredNavGroups.map((group: NavGroup) => (
            <div key={group.label} className="space-y-1">
              <div className={cn(
                "px-3 text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-3.5 mb-1.5 transition-all font-sans",
                isCollapsed && "opacity-0 h-0 overflow-hidden m-0"
              )}>
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item: NavItem) => {
                  const hasChildren = item.items && item.items.length > 0;
                  const isExpanded = expandedItems.includes(item.title);
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.url) && (item.url !== "/dashboard" || pathname === "/dashboard");

                  return (
                    <div key={item.title} className="space-y-0.5">
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          tooltip={item.title} 
                          isActive={isActive && !hasChildren}
                          onClick={() => hasChildren ? toggleExpand(item.title) : setOpenMobile(false)}
                          className={cn(
                            "h-9 rounded-lg transition-all duration-150 text-[13.5px] font-medium px-3 group/btn flex items-center gap-2.5 w-full",
                            isActive && !hasChildren
                              ? "bg-[#1B3357] text-white shadow-none font-semibold" 
                              : "text-slate-400 hover:text-[#CBD5E1] hover:bg-[#152847]",
                            hasChildren && isExpanded && "bg-[#152847]/60 text-white"
                          )}
                          render={!hasChildren ? <Link href={item.url} /> : undefined}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {Icon && <Icon className={cn("size-4 shrink-0 transition-transform duration-150", (isActive && !hasChildren) ? "text-white" : "text-slate-400 group-hover/btn:text-[#CBD5E1]")} />}
                            <span className="truncate">{item.title}</span>
                          </div>
                          {hasChildren && (
                            <ChevronRight className={cn(
                              "size-3.5 text-slate-400 transition-transform duration-200 shrink-0",
                              isExpanded && "rotate-90 text-white"
                            )} />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {hasChildren && (
                        <AnimatePresence initial={false}>
                          {isExpanded && !isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-white/10 ml-4">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                  return (
                                    <Link 
                                      key={subItem.title} 
                                      href={subItem.url}
                                      onClick={() => setOpenMobile(false)}
                                      className={cn(
                                        "block px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all truncate",
                                        isSubActive 
                                          ? "text-white bg-[#1B3357]" 
                                          : "text-slate-400 hover:text-[#CBD5E1] hover:bg-[#152847]"
                                      )}
                                    >
                                      {subItem.title}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <SidebarMenuButton 
                tooltip="Calculator"
                className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg h-8"
                render={<DialogTrigger />}
              >
                <Calculator className="h-4 w-4 mr-2 text-sidebar-foreground/70" />
                <span className="font-semibold text-xs text-sidebar-foreground">Calculator</span>
              </SidebarMenuButton>
              <DialogContent className="sm:max-w-[400px] p-0 border-none bg-transparent shadow-none">
                <DialogTitle className="sr-only">Professional Calculator</DialogTitle>
                <DialogDescription className="sr-only">A professional calculator for quick calculations</DialogDescription>
                <div className="w-full">
                  <ProfessionalCalculator />
                </div>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>

          <SidebarMenuItem id="user-profile">
            <DropdownMenu>
              <DropdownMenuTrigger 
                render={
                  <SidebarMenuButton
                    className="data-[state=open]:bg-sidebar-accent rounded-lg transition-all hover:bg-sidebar-accent h-9"
                  />
                }
              >
                  <Avatar className="h-6 w-6 rounded-md border border-sidebar-border shadow-sm">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground font-black text-[10px]">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight ml-2">
                    <span className="truncate font-bold text-sidebar-foreground tracking-tight">{session?.user?.name}</span>
                    <span className="truncate text-[9px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider leading-none">{session?.user?.role}</span>
                  </div>
                  <ChevronRight className="ml-auto size-3.5 text-sidebar-foreground/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5 shadow-xl border-sidebar-border"
                side="top"
                align="end"
                sideOffset={8}
              >
                <div className="px-2 py-1.5 border-b border-sidebar-border mb-1.5">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Account</p>
                   <p className="text-xs font-bold text-foreground truncate mt-0.5">{session?.user?.email}</p>
                </div>
                <DropdownMenuItem render={<Link href="/dashboard/system/profile" className="flex items-center w-full text-xs" />}>
                    <UserCircle className="mr-2 size-3.5 text-muted-foreground" />
                    Security &amp; Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/system/settings" className="flex items-center w-full text-xs" />}>
                    <Settings className="mr-2 size-3.5 text-muted-foreground" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem render={<ThemeToggle />}>
                </DropdownMenuItem>
                {session?.user?.role === "SUPERADMIN" && (
                   <>
                     <DropdownMenuItem render={<Link href="/super-admin" className="flex items-center w-full text-xs" />}>
                         <ShieldCheck className="mr-2 size-3.5 text-indigo-600" />
                         Super Admin Panel
                     </DropdownMenuItem>
                     <DropdownMenuItem render={<Link href="/super-admin/master-monitor" className="flex items-center w-full text-xs text-amber-500 font-bold" />}>
                         <Crown className="mr-2 size-3.5 text-amber-500" />
                         Master Super Admin Monitor
                     </DropdownMenuItem>
                     <DropdownMenuItem render={<Link href="/admin/referrals" className="flex items-center w-full text-xs" />}>
                         <Trophy className="mr-2 size-3.5 text-indigo-600" />
                         Referral Management
                     </DropdownMenuItem>
                     <DropdownMenuItem render={<Link href="/super-admin/testimonials" className="flex items-center w-full text-xs text-amber-500 font-bold" />}>
                         <Star className="mr-2 size-3.5 text-amber-500 fill-amber-500" />
                         Testimonials Moderation
                     </DropdownMenuItem>
                   </>
                )}
                <div className="h-px bg-sidebar-border my-1.5" />
                <DropdownMenuItem onClick={async () => {
                  await openLogoutFeedback();
                }} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 text-xs cursor-pointer">
                  <LogOut className="mr-2 size-3.5" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Color Picker */}
        {!isCollapsed && (
          <div className="px-1 py-0.5">
            <SidebarColorPicker />
          </div>
        )}

        {/* Plan / Trial Card — Compact */}
        {!isCollapsed && (() => {
          const plan = (session?.user as any)?.plan as string | null;
          const subEnd = (session?.user as any)?.subscriptionEndDate ? new Date((session.user as any).subscriptionEndDate) : null;
          const trialEnd = session?.user?.trialEndDate ? new Date(session.user.trialEndDate as string) : null;
          const now = new Date();

          // Determine if user has an active paid subscription
          const hasActivePaidSub = plan && plan !== 'FREE' && subEnd && subEnd > now;

          // Trial is only "active" if they are on FREE plan with no active paid subscription
          const hasTrial = !hasActivePaidSub && !!trialEnd;
          const isTrialExpired = hasTrial && trialEnd! <= now;
          const isActiveTrialUser = hasTrial && trialEnd! > now;

          // Determine end date and days left
          const relevantEnd = hasActivePaidSub ? subEnd : (isActiveTrialUser ? trialEnd : null);
          const daysLeft = relevantEnd
            ? Math.max(0, Math.ceil((relevantEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : null;

          const isExpired = isTrialExpired;
          const isCritical = daysLeft !== null && daysLeft <= 2 && !isExpired;

          // Plan label display
          const planLabel =
            isExpired ? "Expired" :
            isActiveTrialUser ? "Trial" :
            plan === "FREE" ? "Free" :
            plan === "BASIC" ? "Basic" :
            plan === "STANDARD" ? "Standard" :
            plan === "PREMIUM" ? "Premium" :
            plan === "ENTERPRISE" ? "Enterprise" :
            hasActivePaidSub ? plan :
            "Active";

          const daysLabel =
            isExpired ? "Action needed" :
            daysLeft !== null ? `${daysLeft}d left` :
            "Unlimited";

          const gradientClass =
            isExpired ? "from-rose-500 to-red-700" :
            isCritical ? "from-amber-500 to-orange-600" :
            isActiveTrialUser ? "from-indigo-500 to-purple-700" :
            plan === "PREMIUM" || plan === "ENTERPRISE" ? "from-violet-600 to-indigo-700" :
            plan === "STANDARD" ? "from-emerald-600 to-teal-700" :
            plan === "BASIC" ? "from-sky-600 to-blue-700" :
            "from-slate-600 to-slate-800";

          return (
            <div className="space-y-1 mx-1 mb-1">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("open-pwa-install"));
                  }
                }}
                className="w-full flex items-center justify-between rounded-lg p-2 transition-all duration-300 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 group"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Install App</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-500/20">
                  PWA
                </span>
              </button>

              <Link
                href="/pricing"
                className={cn(
                  "group relative flex items-center justify-between overflow-hidden rounded-lg p-2 transition-all duration-300 hover:brightness-110 border border-white/10 bg-gradient-to-br",
                  gradientClass
                )}
              >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)] pointer-events-none" />

              <div className="flex items-center gap-2 relative z-10">
                <Crown className="h-3.5 w-3.5 text-white/90" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white leading-none">{planLabel}</span>
                  {daysLeft !== null && <span className="text-[8px] text-white/70 leading-none mt-0.5">{daysLabel}</span>}
                </div>
              </div>

              <div className="relative z-10">
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white bg-white/20 border border-white/20",
                  isCritical && "animate-pulse"
                )}>
                  Upgrade
                </span>
              </div>
            </Link>
          </div>
        );
        })()}
      </SidebarFooter>

    </>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status, update } = useSession();
  const { canAccess, openMobile, setOpenMobile } = useSidebar();
  const { colorHsl, colorHex } = useSidebarStore();
  const sidebarStyle = {
    '--sidebar': `hsl(${colorHsl})`,
    backgroundColor: colorHex,
  } as React.CSSProperties;
  const [businessContext, setBusinessContext] = React.useState({ name: "Loading...", logoUrl: null as string | null });
  const [mounted, setMounted] = React.useState(false);
  const hasRefreshedRef = React.useRef(false);
  const pathname = usePathname();

  // 1. Auto-refresh session if permissions are empty but user is authenticated
  React.useEffect(() => {
    if (status === "authenticated" && (!session?.user?.permissions || session.user.permissions.length === 0) && !hasRefreshedRef.current) {
       console.log("DEBUG Sidebar: Zero permissions detected. Triggering session refresh...");
       hasRefreshedRef.current = true;
       update(); // NextAuth session update
    }
  }, [session, status, update]);

  const businessTypesString = session?.user?.businessType || "SHOP";
  const businessTypes = businessTypesString.split(',').filter(t => t !== "");
  const businessType = businessTypes[0] || "SHOP"; 
  
  console.log("DEBUG Sidebar Session:", {
     status,
     role: session?.user?.role,
     businessType: session?.user?.businessType,
     permissionsCount: session?.user?.permissions?.length || 0,
     permissionsJson: JSON.stringify(session?.user?.permissions || [])
  });

  const isSimpleMode = (session?.user as any)?.businessManagementMode === "SIMPLE_SALES_PROFIT";

  const navGroups = React.useMemo(() => {
    if (isSimpleMode) {
      return simpleSalesProfitSidebarConfig as NavGroup[];
    }

    const configs = businessTypes.map(type => getSidebarConfig(type, session?.user?.institutionType)).filter(Boolean);
    if (configs.length === 0) {
      console.warn("DEBUG Sidebar: No configurations found for types:", businessTypes);
      return [];
    }
    const figmaDomainGroups: { [key: string]: NavGroup } = {
      "MAIN": {
        label: "MAIN",
        items: [
          { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: "menu:overview" },
          { title: "Business Hub", url: "/dashboard/registry", icon: Building2, permission: "menu:intelligence:hub" },
          { title: "Point of Sale", url: "/dashboard/pos", icon: ShoppingCart, permission: "menu:sales" },
        ]
      },
      "INVENTORY": { label: "INVENTORY", items: [] },
      "SALES & CRM": { label: "SALES & CRM", items: [] },
      "FINANCE": { label: "FINANCE", items: [] },
      "ANALYTICS": { label: "ANALYTICS", items: [] },
      "ADMIN": { label: "ADMIN", items: [] },
    };

    const customGroups: NavGroup[] = [];

    configs.forEach(config => {
      config?.forEach(group => {
        const gLabel = group.label.toUpperCase();
        group.items.forEach(item => {
          const title = item.title.toLowerCase();
          const url = item.url.toLowerCase();

          // Skip items already represented in MAIN
          if (url === "/dashboard" && item.title === "Overview") return;
          if (url === "/dashboard/registry" && item.title === "Intelligence Hub") return;
          if (url === "/dashboard/pos" && item.title === "Launch POS") return;

          // Categorize into Figma Make domain groups
          if (url.includes("/inventory") || url.includes("/purchases") || title.includes("inventory") || title.includes("purchase") || title.includes("stock") || title.includes("warehouse")) {
            if (!figmaDomainGroups["INVENTORY"].items.some(i => i.url === item.url && i.title === item.title)) {
              figmaDomainGroups["INVENTORY"].items.push(item);
            }
          } else if (url.includes("/sales") || url.includes("/customers") || url.includes("/store-builder") || url.includes("/services") || title.includes("sales") || title.includes("customer") || title.includes("supplier") || title.includes("order")) {
            if (!figmaDomainGroups["SALES & CRM"].items.some(i => i.url === item.url && i.title === item.title)) {
              figmaDomainGroups["SALES & CRM"].items.push(item);
            }
          } else if (url.includes("/accounting") || url.includes("/invoices") || url.includes("/payments") || url.includes("/credit") || url.includes("/debts") || title.includes("finance") || title.includes("invoice") || title.includes("payment")) {
            if (!figmaDomainGroups["FINANCE"].items.some(i => i.url === item.url && i.title === item.title)) {
              figmaDomainGroups["FINANCE"].items.push(item);
            }
          } else if (url.includes("/intelligence") || url.includes("/analytics") || url.includes("/reports") || title.includes("report") || title.includes("ai") || title.includes("forecast") || title.includes("profit & loss") || title.includes("p&l")) {
            if (!figmaDomainGroups["ANALYTICS"].items.some(i => i.url === item.url && i.title === item.title)) {
              figmaDomainGroups["ANALYTICS"].items.push(item);
            }
          } else if (url.includes("/staff") || url.includes("/system") || title.includes("employee") || title.includes("role") || title.includes("log") || title.includes("setting") || title.includes("manual")) {
            if (!figmaDomainGroups["ADMIN"].items.some(i => i.url === item.url && i.title === item.title)) {
              figmaDomainGroups["ADMIN"].items.push(item);
            }
          } else {
            // Specialized industry group (e.g. CLINIC, SCHOOL, RESTAURANT, BAR)
            let existing = customGroups.find(g => g.label === group.label.toUpperCase());
            if (!existing) {
              existing = { label: group.label.toUpperCase(), items: [] };
              customGroups.push(existing);
            }
            if (!existing.items.some(i => i.title === item.title)) {
              existing.items.push(item);
            }
          }
        });
      });
    });

    // Add Chat and Referrals to ADMIN
    figmaDomainGroups["ADMIN"].items.push({
      title: "Team & Staff Chat",
      url: "/dashboard/chat",
      icon: MessageSquare,
      permission: "view_dashboard"
    });
    figmaDomainGroups["ADMIN"].items.push({
      title: "Referral Program",
      url: "/dashboard/referrals",
      icon: Crown,
      permission: "view_dashboard"
    });

    const orderedFigmaGroups = [
      figmaDomainGroups["MAIN"],
      figmaDomainGroups["INVENTORY"],
      ...customGroups,
      figmaDomainGroups["SALES & CRM"],
      figmaDomainGroups["FINANCE"],
      figmaDomainGroups["ANALYTICS"],
      figmaDomainGroups["ADMIN"],
    ].filter(g => g.items.length > 0);

    return orderedFigmaGroups;
  }, [businessTypesString, session?.user?.institutionType, isSimpleMode]);
  
  const filteredNavGroups = React.useMemo(() => {
    if (status === "loading") return [];
    
    return navGroups.map(group => {
      const filteredItems = group.items.filter((item: NavItem) => {
          const allowed = canAccess(item.permission);
          return allowed;
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [navGroups, canAccess, status]);

  console.log("DEBUG Sidebar: Filtered Groups count:", filteredNavGroups.length);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (session?.user?.businessId) {
      getBusinessContext(session.user.businessId)
        .then(data => {
          if (data) {
            setBusinessContext(data);
            localStorage.setItem(`offline_business_context_${session.user.businessId}`, JSON.stringify(data));
          }
        })
        .catch(err => {
          console.error("Failed to load business context:", err);
          const cached = localStorage.getItem(`offline_business_context_${session.user.businessId}`);
          if (cached) {
            try {
              setBusinessContext(JSON.parse(cached));
            } catch (e) {}
          } else if (session?.user?.businessName) {
            setBusinessContext({ name: session.user.businessName, logoUrl: null });
          } else {
            setBusinessContext({ name: "Protech Assist SL Limited", logoUrl: null });
          }
        });
    } else if (mounted && status === "authenticated") {
      setBusinessContext({ name: "Global Admin", logoUrl: null });
    }
  }, [session?.user?.businessId, mounted, status]);

  if (!mounted || status === "loading") {
    return <Sidebar collapsible="icon" className="border-r border-white/10 shadow-sm" {...props}>
      <div className="p-8 flex items-center justify-center h-full">
         <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </Sidebar>;
  }

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 text-sidebar-foreground border-r-0 shadow-2xl dark" style={sidebarStyle}>
          <SheetHeader className="sr-only">
             <SheetTitle>Mobile Navigation</SheetTitle>
             <SheetDescription>Main navigation menu for mobile devices.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
             <SidebarContentRenderer {...{ filteredNavGroups, businessContext, businessType, session, pathname }} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop/Tablet Sidebar */}
      <Sidebar collapsible="icon" className="border-r border-white/10 shadow-sm hidden md:flex dark" style={sidebarStyle} {...props}>
          <SidebarContentRenderer {...{ filteredNavGroups, businessContext, businessType, session, pathname }} />
          <SidebarRail />
      </Sidebar>
    </>
  );
}
