"use client";

import * as React from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, 
  ChevronRight, LogOut, Bell, ShieldCheck, Activity as ActivityIcon, 
  CreditCard, Wallet, UserCheck, Book, DollarSign, UserCircle, Calculator,
  Crown, Zap, ArrowRight
} from "lucide-react";

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
  const { setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
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
      <SidebarHeader className="pt-8 px-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="hover:bg-transparent px-0"
              render={<Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpenMobile(false)} />}
            >
                <div className="relative flex aspect-square size-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-primary/20 ring-4 ring-primary/5">
                  <Image 
                    src="/images/PA.png" 
                    alt="Protech Logo" 
                    fill 
                    className="object-cover"
                    unoptimized 
                  />
                </div>
                <div className="relative flex flex-col gap-0.5 leading-none transition-all duration-300">
                  <span className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">Protech <span className="text-primary italic">Assist</span></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-[0.25em]">Enterprise OS</span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className={cn("mt-8 mb-6 px-2 transition-all duration-300", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
           <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context</div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
           </div>
           <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-inner group cursor-pointer transition-all hover:border-primary/30 flex items-center gap-3">
              {businessContext.logoUrl && (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0">
                  <Image 
                    src={businessContext.logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-cover"
                    unoptimized 
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block group-hover:text-primary transition-colors">{businessContext.name}</span>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 block">{businessType} UNIT</span>
              </div>
           </div>
        </div>
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
                <p className="text-[9px] text-slate-500 mt-2 italic">
                  {session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN"
                    ? "Establishing connection to Africa trade vault..."
                    : "Check permissions or business type configuration."}
                </p>
             </div>
          )}
          {filteredNavGroups.map((group: NavGroup) => (
            <div key={group.label} className="space-y-2">
              <div className={cn("px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 transition-all", isCollapsed && "opacity-0 h-0 overflow-hidden")}>{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item: NavItem) => {
                  const hasChildren = item.items && item.items.length > 0;
                  const isExpanded = expandedItems.includes(item.title);
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.url) && (item.url !== "/dashboard" || pathname === "/dashboard");

                  return (
                    <div key={item.title} className="space-y-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          tooltip={item.title} 
                          isActive={isActive && !hasChildren}
                          onClick={() => hasChildren ? toggleExpand(item.title) : setOpenMobile(false)}
                          className={cn(
                            "h-11 rounded-xl transition-all duration-300 font-bold px-4 group/btn",
                            isActive && !hasChildren
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]",
                            hasChildren && isExpanded && "bg-slate-50 dark:bg-white/5"
                          )}
                          render={!hasChildren ? <Link href={item.url} /> : undefined}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {Icon && <Icon className={cn("size-5 transition-transform duration-300 group-hover/btn:scale-110", (isActive && !hasChildren) ? "text-primary-foreground" : "text-slate-400 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white")} />}
                            <span className="truncate">{item.title}</span>
                          </div>
                          {hasChildren && (
                            <ChevronRight className={cn(
                              "size-4 text-slate-500 transition-transform duration-300",
                              isExpanded && "rotate-90 text-slate-900 dark:text-white"
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
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pl-9 pr-2 py-1 space-y-1 border-l border-white/10 ml-6">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                  return (
                                    <Link 
                                      key={subItem.title} 
                                      href={subItem.url}
                                      onClick={() => setOpenMobile(false)}
                                      className={cn(
                                        "block px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
                                        isSubActive 
                                          ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10" 
                                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
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

      <SidebarFooter className="p-3 border-t border-white/10 space-y-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <SidebarMenuButton 
                tooltip="Calculator"
                className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-xl"
                render={<DialogTrigger />}
              >
                <Calculator className="h-5 w-5 mr-2" />
                <span className="font-semibold">Calculator</span>
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
                    size="lg"
                    className="data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-white/10 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                  />
                }
              >
                  <Avatar className="h-9 w-9 rounded-xl border-2 border-transparent shadow-md">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-xl bg-primary text-white font-black text-xs">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-black text-slate-900 dark:text-white tracking-tight">{session?.user?.name}</span>
                    <span className="truncate text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-0.5">{session?.user?.role}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-slate-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800"
                side="top"
                align="end"
                sideOffset={12}
              >
                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate mt-0.5">{session?.user?.email}</p>
                </div>
                <DropdownMenuItem render={<Link href="/dashboard/system/profile" className="flex items-center w-full" />}>
                    <UserCircle className="mr-3 size-4 text-slate-400" />
                    Security &amp; Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/system/settings" className="flex items-center w-full" />}>
                    <Settings className="mr-3 size-4 text-slate-400" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem render={<ThemeToggle />}>
                </DropdownMenuItem>
                {session?.user?.role === "SUPERADMIN" && (
                   <DropdownMenuItem render={<Link href="/super-admin" className="flex items-center w-full" />}>
                       <ShieldCheck className="mr-3 size-4 text-indigo-600" />
                       Super Admin Panel
                   </DropdownMenuItem>
                )}
                <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
                <DropdownMenuItem onClick={async () => {
                  const { logoutUserCompletely } = await import("@/lib/utils/logout");
                  await logoutUserCompletely(signOut);
                }} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30">
                  <LogOut className="mr-3 size-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Plan Card — always visible at very bottom */}
        {!isCollapsed && (() => {
          const hasTrial = !!session?.user?.trialEndDate;
          const end = hasTrial ? new Date(session!.user!.trialEndDate as string) : null;
          const now = new Date();
          const totalDays = 7;
          const daysLeft = end ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
          const progress = hasTrial ? Math.max(4, Math.round(((totalDays - daysLeft) / totalDays) * 100)) : 100;
          const isExpired = hasTrial && daysLeft <= 0;
          const isCritical = hasTrial && daysLeft <= 2 && !isExpired;

          const gradientClass = isExpired
            ? "bg-gradient-to-r from-rose-500 to-red-600"
            : isCritical
            ? "bg-gradient-to-r from-amber-500 to-orange-500"
            : hasTrial
            ? "bg-gradient-to-r from-indigo-500 to-purple-600"
            : "bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900";

          const label = isExpired
            ? "Trial expired"
            : hasTrial
            ? `Trial ends in ${daysLeft}d`
            : `${session?.user?.role === "SUPERADMIN" ? "Super Admin" : "Premium Plan"}`;

          const ctaLabel = isExpired || hasTrial ? "Subscribe" : "Upgrade";

          return (
            <Link
              href="/pricing"
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-300 hover:opacity-90 hover:shadow-lg border border-white/10",
                gradientClass
              )}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.10),_transparent_70%)] pointer-events-none" />

              {/* Crown icon */}
              <div className="h-7 w-7 shrink-0 rounded-lg bg-white/20 flex items-center justify-center border border-white/20">
                <Crown className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Text + progress */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white leading-none truncate">{label}</p>
                <div className="mt-1.5 h-1 w-full bg-white/25 rounded-full overflow-hidden">
                  <div className="h-full bg-white/75 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg px-2 py-1 transition-colors">
                <Zap className="h-3 w-3 text-white fill-current" />
                <span className="text-[9px] font-black text-white uppercase tracking-wider whitespace-nowrap">{ctaLabel}</span>
              </div>
            </Link>
          );
        })()}
      </SidebarFooter>

    </>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status, update } = useSession();
  const { canAccess, openMobile, setOpenMobile } = useSidebar();
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

  const navGroups = React.useMemo(() => {
    const configs = businessTypes.map(type => getSidebarConfig(type, session?.user?.institutionType)).filter(Boolean);
    if (configs.length === 0) {
      console.warn("DEBUG Sidebar: No configurations found for types:", businessTypes);
      return [];
    }
    const merged: NavGroup[] = [];
    configs.forEach(config => {
        config?.forEach(group => {
            const existingGroup = merged.find(g => g.label === group.label);
            if (existingGroup) {
                group.items.forEach(item => {
                    if (!existingGroup.items.find((i: any) => i.title === item.title)) {
                        existingGroup.items.push(item);
                    }
                });
            } else {
                merged.push({...group, items: [...group.items]});
            }
        });
    });
    return merged;
  }, [businessTypesString, session?.user?.institutionType]);
  
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
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 bg-sidebar text-sidebar-foreground border-r-0 shadow-2xl">
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
      <Sidebar collapsible="icon" className="border-r border-white/10 shadow-sm hidden md:flex bg-sidebar" {...props}>
          <SidebarContentRenderer {...{ filteredNavGroups, businessContext, businessType, session, pathname }} />
          <SidebarRail />
      </Sidebar>
    </>
  );
}
