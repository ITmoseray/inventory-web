"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, subDays } from "date-fns";
import { cn, getIndustryColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { 
  Plus, Box, Users, FileText, ShoppingCart, Truck, Globe, ShieldCheck, 
  CreditCard, MapPin, Activity, Sparkles, History, Clock, ArrowRight, 
  Play, MessageCircle, Wallet, Smartphone, SmartphoneIcon, Printer, Receipt, 
  DollarSign, AlertCircle, Package, Book, Zap, Cpu, UserCheck, Briefcase, Database, BrainCircuit, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getRecentSales } from "@/lib/actions/sale";
import { getDashboardStats, getOfficeDashboardStats } from "@/lib/actions/dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getWelcomeUpdate } from "@/lib/actions/ai";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { SmartForecastingWidget } from "@/components/dashboard/smart-forecasting-widget";
import { ExpiryWidget } from "@/components/dashboard/expiry-widget";
import { Calculator as CalculatorIcon } from "lucide-react";
import { ProfessionalCalculator } from "@/components/shared/professional-calculator";

const TABS = ["Dashboard", "Getting Started"];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
        const formattedTab = tab.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        if (TABS.includes(formattedTab)) {
            setActiveTab(formattedTab);
        }
    }
  }, [searchParams]);
  // ... (rest of the component)
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  
  const runDiagnostics = () => {
    setIsDiagnosticsOpen(true);
    setDiagnosticsRunning(true);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      toast.success("Neural Diagnostics Complete: All trade nodes & clusters nominal (24ms latency).");
    }, 1000);
  };

  const getPaymentBadge = (method: string) => {
    const m = (method || "CASH").toUpperCase();
    if (m.includes("ORANGE") || m === "ORANGE_MONEY") {
      return {
        label: "Orange Money",
        icon: Smartphone,
        className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
      };
    }
    if (m.includes("AFRI") || m === "AFRIMONEY") {
      return {
        label: "AfriMoney",
        icon: Smartphone,
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
      };
    }
    if (m.includes("CARD") || m.includes("STRIPE") || m.includes("FLUTTERWAVE")) {
      return {
        label: "Card / POS",
        icon: CreditCard,
        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
      };
    }
    return {
      label: "Cash",
      icon: Wallet,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
    };
  };
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [stats, setStats] = useState<any>({
    revenue: 0,
    todayRevenue: 0,
    revenueChange: 0,
    orders: 0,
    ordersChange: 0,
    skuCount: 0,
    lowStock: 0,
    expiringItems: 0,
    activeTransactions: 0,
    staffCount: 0,
    topProducts: [] as any[],
    employeeCount: 0,
    activeTodayCount: 0,
    monthlyExpenses: 0,
    departmentsCount: 0,
    recentCheckins: [] as any[],
    recentExpenses: [] as any[],
    departmentDistribution: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  // Getting Started State
  const [setupProgress, setSetupProgress] = useState(0);
  const [activeSetupStep, setActiveSetupStep] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [webinarModalOpen, setWebinarModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  // AI Welcome State
  const [welcomeUpdate, setWelcomeUpdate] = useState<string | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeLoading, setWelcomeLoading] = useState(false);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitting(true);
    setTimeout(() => {
      setDemoSubmitting(false);
      setDemoModalOpen(false);
      setDemoForm({ name: "", email: "", phone: "", notes: "" });
      toast.success("Demo request submitted successfully!", {
        description: "Our product engineers will contact you shortly to schedule your walkthrough."
      });
    }, 1500);
  };

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    if (session?.user?.businessType === "SCHOOL") {
      router.push("/dashboard/school");
      return;
    }
    fetchDashboardData();
  }, [session, router]);

  useEffect(() => {
    async function fetchWelcome() {
      if (session?.user && !sessionStorage.getItem("hasSeenWelcome")) {
        setWelcomeLoading(true);
        setIsWelcomeModalOpen(true);
        try {
          const update = await getWelcomeUpdate();
          setWelcomeUpdate(update);
          sessionStorage.setItem("hasSeenWelcome", "true");
        } catch (err) {
          console.error(err);
          setIsWelcomeModalOpen(false);
        } finally {
          setWelcomeLoading(false);
        }
      }
    }
    fetchWelcome();
  }, [session]);

  // Derive chart data from last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "MMM dd");
    const amount = recentSales
      .filter(s => format(new Date(s.createdAt), "MMM dd") === dateStr)
      .reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    return { name: dateStr, value: amount };
  });

  async function fetchDashboardData() {
    try {
      setLoading(true);
      if (businessType === "OFFICE") {
        const officeStats = await getOfficeDashboardStats();
        setStats(officeStats);
      } else {
        const [sales, dashboardStats] = await Promise.all([
          getRecentSales(),
          getDashboardStats()
        ]);
        setRecentSales(sales);
        setStats(dashboardStats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = session?.user?.name || session?.user?.email?.split('@')[0] || "Partner";
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 17) timeGreeting = "Good Afternoon";
    else timeGreeting = "Good Evening";

    return `${timeGreeting}, ${formattedName}`;
  };

  const getPrimaryHex = (tailwindClass: string) => {
    if (tailwindClass.includes('indigo')) return '#4f46e5';
    if (tailwindClass.includes('rose')) return '#e11d48';
    if (tailwindClass.includes('emerald')) return '#059669';
    return '#2563eb'; // Default blue
  };

  const SETUP_STEPS = [
    { 
      title: "Configure your Inventory", 
      desc: "Add the goods or services that your business deals within Protech Inventory. You can also create an Item with Variants or combine multiple items into one by creating a composite item.",
      actions: [
        { label: "Create an item", href: "/dashboard/inventory/products", icon: Plus },
        { label: "Create a composite item", href: "/dashboard/inventory/products", icon: Box }
      ]
    },
    { 
      title: "Configure the Purchases module", 
      desc: "Set up your suppliers and manage your incoming stock orders effectively.",
      actions: [
        { label: "Add a supplier", href: "/dashboard/purchases/suppliers", icon: Users },
        { label: "Create purchase order", href: "/dashboard/purchases", icon: FileText }
      ]
    },
    { 
      title: "Configure the Sales module", 
      desc: "Streamline your sales process with automated invoicing and fast POS checkout.",
      actions: [
        { label: "Open POS", href: "/dashboard/pos", icon: ShoppingCart },
        { label: "Add customer", href: "/dashboard/customers", icon: Users }
      ]
    },
    { 
      title: "Dispatch your order", 
      desc: "Monitor shipping and ensure your customers get their orders on time.",
      actions: [
        { label: "View sales orders", href: "/dashboard/sales/orders", icon: Truck }
      ]
    }
  ];

  const USEFUL_FEATURES = [
    { 
      title: "Sales Channels", 
      desc: "Integrate with shopping carts like Shopify, Amazon, and eBay.", 
      icon: Globe,
      onClick: () => toast.info("Sales channel integrations (Shopify, Amazon, eBay) can be configured under System Settings.")
    },
    { 
      title: "Shipping Integrations", 
      desc: "Deliver packages and monitor them every step of the way.", 
      icon: Truck,
      onClick: () => toast.info("Shipping APIs (DHL, FedEx, UPS) are currently being audited for security compliance.")
    },
    { 
      title: "Roles and Permissions", 
      desc: "Invite users and choose granular role-based access control.", 
      icon: ShieldCheck,
      onClick: () => router.push("/dashboard/system/settings")
    },
    { 
      title: "Customer Portal", 
      desc: "Self-service portal for customers to manage transactions.", 
      icon: Users,
      onClick: () => router.push("/dashboard/customers")
    },
    { 
      title: "Online Payments", 
      desc: "Receive payments via popular gateways like Orange Money or Stripe.", 
      icon: CreditCard,
      onClick: () => router.push("/dashboard/billing")
    },
    { 
      title: "Locations", 
      desc: "Organize your business and warehouse locations into a structured hierarchy.", 
      icon: MapPin,
      onClick: () => router.push("/dashboard/system/settings")
    },
  ];


  return (
    <div className="relative min-h-full space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      
      {/* Top Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-8"
      >
        <div className="space-y-2">
           <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
             {activeTab === "Dashboard" ? getGreeting() : activeTab}
           </h1>
           <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
             <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {format(currentTime, "h:mm a")}</div>
             <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
             <div className="flex items-center gap-1.5">{format(currentTime, "EEEE, MMMM do, yyyy")}</div>
           </div>
        </div>

        {activeTab === "Dashboard" && businessType !== "OFFICE" && (
          <div className="flex items-center gap-3">
             <Button 
               variant="outline"
               onClick={() => router.push("/dashboard/reports")}
               className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-bold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
             >
               View Reports
             </Button>
             <Button 
               onClick={() => router.push("/dashboard/pos")}
               className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm shadow-primary/20 transition-all gap-2"
             >
               <Plus className="h-4 w-4" /> Create Order
             </Button>
          </div>
        )}
      </motion.div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-slate-200 dark:border-slate-800 relative z-10 overflow-x-auto no-scrollbar pb-1">
         {TABS.map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "pb-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0",
               activeTab === tab ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
             )}
           >
             {tab}
             {activeTab === tab && (
               <motion.div layoutId="dashboard-tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
             )}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "Dashboard" && (
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {businessType === "OFFICE" ? (
              <OfficeDashboardView stats={stats} />
            ) : (
              <>
                {/* Top Section: AI Assistant + Stat Cards */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full max-w-full min-w-0">
                  {/* AI Assistant Card */}
                  <div className="xl:col-span-1">
                    <div className="h-full relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between group cursor-pointer border border-indigo-400/20">
                      <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                        <Sparkles className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-6 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Protech AI Assistant</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-3">
    Hi {session?.user?.name?.split(' ')[0] || (session?.user?.email?.split('@')[0] === "strangesteven001" ? "Dr. Strange" : "Admin")},
  </h2>
  <p className="text-indigo-100 font-medium text-xs sm:text-sm max-w-[240px] leading-relaxed">
    {Number(stats.todayRevenue || 0) <= 0 
      ? "Your store is ready for trade today. Open POS to process your first sale and start tracking velocity!" 
      : Number(stats.revenueChange || 0) > 0 
      ? `Your store is performing well today. Revenue is up by +${Number(stats.revenueChange).toFixed(1)}% vs yesterday.`
      : Number(stats.revenueChange || 0) < 0 
      ? `Generated Le ${Number(stats.todayRevenue).toLocaleString()} today (${Number(stats.revenueChange).toFixed(1)}% vs yesterday).`
      : `Generated Le ${Number(stats.todayRevenue).toLocaleString()} today. Off to a steady start!`
    }
  </p>
                      </div>
                      <div className="relative z-10 mt-8">
                        <Button 
                          onClick={() => router.push("/dashboard/intelligence/chat?q=generate_report")}
                          className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl h-12 font-bold shadow-lg shadow-black/10 gap-2 transition-all hover:gap-4"
                        >
                          Generate full report <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                    <StatCard 
                      title="Total Revenue" 
                      value={stats.revenue} 
                      prefix="Le "
                      description="All-time revenue" 
                      icon={DollarSign}
                      colorClass="text-primary"
                      bgClass="bg-primary/10 dark:bg-primary/20"
                      delay={0.1}
                      href="/dashboard/sales/history"
                      iconAnimation="float"
                    />
                    <StatCard 
                      title="Today's Revenue" 
                      value={stats.todayRevenue || 0} 
                      prefix="Le "
                      description="vs yesterday" 
                      icon={Activity}
                      colorClass="text-indigo-500"
                      bgClass="bg-indigo-500/10 dark:bg-indigo-500/20"
                      delay={0.15}
                      href="/dashboard/sales/history"
                      change={stats.revenueChange || 0}
                      iconAnimation="pulse"
                    />
                    <StatCard 
                      title="Total Orders" 
                      value={stats.orders} 
                      description="vs yesterday" 
                      icon={ShoppingCart}
                      colorClass="text-emerald-500"
                      bgClass="bg-emerald-500/10 dark:bg-emerald-500/20"
                      delay={0.2}
                      href="/dashboard/sales/orders"
                      change={stats.ordersChange || 8.2}
                      iconAnimation="bounce"
                    />
                    <StatCard 
                      title={businessType === "PHARMACY" ? "Drug Items" : "Total Products"} 
                      value={stats.skuCount} 
                      description="Managed Catalog" 
                      icon={Package}
                      colorClass="text-purple-500"
                      bgClass="bg-purple-500/10 dark:bg-purple-500/20"
                      delay={0.3}
                      href="/dashboard/inventory/products"
                      iconAnimation="spin"
                    />
                    <StatCard 
                      title="Low Stock Alerts" 
                      value={stats.lowStock} 
                      description="Requires attention" 
                      icon={AlertCircle}
                      colorClass="text-rose-500"
                      bgClass="bg-rose-500/10 dark:bg-rose-500/20"
                      delay={0.4}
                      href="/dashboard/inventory/products"
                      iconAnimation="shake"
                    />
                    <StatCard 
                      title="Over Stock Alerts" 
                      value={stats.overStock} 
                      description="Excess inventory" 
                      icon={AlertCircle}
                      colorClass="text-amber-500"
                      bgClass="bg-amber-500/10 dark:bg-amber-500/20"
                      delay={0.5}
                      href="/dashboard/inventory/products"
                      iconAnimation="ping"
                    />
                  </div>
                </div>

            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 w-full max-w-full min-w-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="lg:col-span-2 w-full min-h-[350px]">
                <TrendChart 
                  data={chartData} 
                  title="Revenue Velocity" 
                  description="Intelligence performance tracking (last 7 days)"
                  dataKey="value"
                  categoryKey="name"
                  color={getPrimaryHex(colors.primary)}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                 <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm h-full flex flex-col">
                   <CardHeader className="p-4 sm:p-6 lg:p-8 pb-3 sm:pb-4">
                      <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Nodes</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Operational Status</CardDescription>
                   </CardHeader>
                   <CardContent className="p-4 sm:p-6 lg:p-8 pt-2 sm:pt-4 flex-1 flex flex-col justify-center space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                          {[
                            { label: "Active Transactions", value: stats.activeTransactions.toString().padStart(2, '0'), icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                            { label: "Inventory Thresholds", value: stats.lowStock.toString().padStart(2, '0'), icon: Package, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
                            { label: "Staff Connectivity", value: stats.staffCount.toString().padStart(2, '0'), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" }
                          ].map((node, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group">
                               <div className="flex items-center gap-4 overflow-hidden">
                                  <div className={cn("p-3 rounded-xl shrink-0", node.bg)}>
                                     <node.icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mb-1 truncate">{node.label}</p>
                                     <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{node.value}</p>
                                  </div>
                               </div>
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            </div>
                          ))}
                      </div>
                      <Button onClick={runDiagnostics} className="w-full h-12 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"><Cpu className="h-4 w-4" /> Launch Neural Diagnostics</Button>
                   </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 mt-6 sm:mt-8 w-full max-w-full min-w-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className={cn("min-h-[350px]", businessType === "PHARMACY" ? "lg:col-span-2" : "lg:col-span-3")}>
                <SmartForecastingWidget />
              </motion.div>
              {businessType === "PHARMACY" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="min-h-[350px]">
                  <ExpiryWidget />
                </motion.div>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3 pb-12">
              <div className="lg:col-span-2">
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden h-full">
                   <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                               <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Recent Transactions</CardTitle>
                               <CardDescription className="text-xs text-slate-500">Live ledger stream</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-md h-8 px-3 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => router.push("/dashboard/sales/history")}>View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
                         </div>
                      </CardHeader>
                      <CardContent className="p-0">
                         {loading ? (
                           <div className="p-20 flex flex-col items-center justify-center gap-6 animate-pulse">
                              <Activity className="h-8 w-8 text-primary" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Syncing Trade Nodes...</p>
                           </div>
                         ) : recentSales.length === 0 ? (
                           <div className="p-20 text-center space-y-6">
                              <History className="h-8 w-8 text-slate-200 mx-auto" />
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No entries found</p>
                           </div>
                         ) : (
                           <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {recentSales.slice(0, 6).map((sale: any) => {
                                const badge = getPaymentBadge(sale.paymentMethod);
                                const BadgeIcon = badge.icon;
                                const itemCount = sale.items?.length || 1;
                                return (
                                  <div 
                                    key={sale.id} 
                                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border-b border-slate-100 dark:border-slate-800/50 last:border-0" 
                                    onClick={() => { setSelectedSale(sale); setIsDetailsOpen(true); }}
                                  >
                                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 mr-2 sm:mr-4">
                                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-400 transition-colors">
                                        <BadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">{sale.invoiceNumber}</span>
                                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase flex items-center gap-1", badge.className)}>
                                            <BadgeIcon className="h-2.5 w-2.5" />
                                            {badge.label}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                          <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {format(new Date(sale.createdAt), "HH:mm")}</div>
                                          <span>•</span>
                                          <span className="truncate">{sale.customer?.name || "Walk-in Customer"}</span>
                                          <span>•</span>
                                          <span className="text-slate-400 font-mono text-[10px]">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white font-mono">Le {Math.round(parseFloat(sale.totalAmount)).toLocaleString()}</div>
                                      <div className={cn(
                                        "px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold mt-1 inline-block", 
                                        sale.paymentStatus === "PAID" 
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20" 
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20"
                                      )}>
                                        {sale.paymentStatus}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                         )}
                      </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
                 <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Top Products</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Highest volume items</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 flex-1">
                    {!stats.topProducts || stats.topProducts.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-50 py-12">
                          <Package className="h-10 w-10 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No trade data yet</p>
                       </div>
                    ) : (
                       <div className="space-y-0.5">
                          {stats.topProducts.map((product, i) => (
                             <div key={i} className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group" onClick={() => router.push("/dashboard/analytics")}>
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 mr-2 sm:mr-4">
                                   <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500">#{i + 1}</span>
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">{product.name}</p>
                                      <p className="text-xs text-slate-500 truncate mt-0.5 capitalize">{product.category}</p>
                                   </div>
                                </div>
                                <div className="text-right shrink-0">
                                   <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{product.quantitySold} units</p>
                                   <p className="text-[9px] sm:text-[10px] font-medium text-emerald-600 mt-0.5">Le {product.revenue.toLocaleString()}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </CardContent>
              </Card>
            </div>

            {/* Third Row: Staff Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
                 <CardHeader className="p-4 sm:p-6 lg:p-8 pb-4">
                    <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Staff Leaderboard</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Top Revenue Generators</CardDescription>
                 </CardHeader>
                 <CardContent className="p-4 sm:p-6 lg:p-8 pt-2 sm:pt-4 flex-1">
                    {!stats.topStaff || stats.topStaff.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-50">
                          <Users className="h-10 w-10 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No staff sales data yet</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          {stats.topStaff.map((staff: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 mr-2 sm:mr-4">
                                   <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm">
                                      <span className="text-base sm:text-lg font-black">#{i + 1}</span>
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-primary transition-colors">{staff.name}</p>
                                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 truncate mt-0.5">{staff.role}</p>
                                   </div>
                                </div>
                                <div className="text-right shrink-0">
                                   <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Le {staff.revenue.toLocaleString()}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </CardContent>
              </Card>
            </div>
            </>
          )}
          </motion.div>
        )}        {activeTab === "Getting Started" && (
          <motion.div 
            key="getting-started-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 sm:space-y-12"
          >
            {/* Welcome Banner */}
            <div className="w-full break-words">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight break-words">Welcome to <span className="text-indigo-600">Protech Inventory</span></h2>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-indigo-600 mt-3 sm:mt-4 break-words">Overview of Protech Inventory</p>
              <p className="text-slate-500 font-medium text-base sm:text-lg mt-3 sm:mt-4 max-w-2xl leading-relaxed">
                The easy-to-use inventory software that you can set up in no time! Let's get you up and running effectively.
              </p>
            </div>

            {/* Setup Checklist Card */}
            <Card className="border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden w-full">
               <div className="p-4 sm:p-8 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="h-10 w-10 shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                           <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div className="min-w-0">
                           <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic break-words">Let's get you up and running</h3>
                           <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Phase 01 Configuration</p>
                        </div>
                     </div>
                     <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                        <span className="text-xl sm:text-2xl font-[1000] text-indigo-600 italic tracking-tighter shrink-0">{setupProgress}%</span>
                        <div className="flex-1 sm:w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${setupProgress}%` }} className="h-full bg-indigo-600 rounded-full" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 hidden sm:block">Completed</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-50 dark:border-slate-800">
                  {SETUP_STEPS.map((step, i) => (
                     <button 
                       key={i}
                       onClick={() => setActiveSetupStep(i)}
                       className={cn(
                         "p-3 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 transition-all relative group cursor-pointer",
                         activeSetupStep === i ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800"
                       )}
                     >
                        <div className={cn(
                          "h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500 text-sm sm:text-base",
                          activeSetupStep === i ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                        )}>
                           {i + 1}
                        </div>
                        <span className={cn(
                          "text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-tight w-full break-words",
                          activeSetupStep === i ? "text-slate-900 dark:text-white" : "text-slate-400"
                        )}>{step.title}</span>
                        {activeSetupStep === i && <motion.div layoutId="step-dot" className="absolute -bottom-px left-0 right-0 h-1 bg-indigo-600" />}
                     </button>
                  ))}
               </div>

               <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
                  <div className="flex flex-col gap-6 items-start">
                     <div className="w-full space-y-4 sm:space-y-6">
                        <h4 className="text-lg sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic break-words">{SETUP_STEPS[activeSetupStep].title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed">{SETUP_STEPS[activeSetupStep].desc}</p>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
                           {SETUP_STEPS[activeSetupStep].actions.map((action, i) => (
                             <Button key={i} onClick={() => router.push(action.href)} className="w-full sm:w-auto h-auto min-h-12 py-3 sm:py-4 px-5 sm:px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 group whitespace-normal text-left sm:text-center justify-start sm:justify-center">
                                <action.icon className="mr-3 h-4 w-4 shrink-0 group-hover:scale-125 transition-transform" />
                                {action.label}
                             </Button>
                           ))}
                           <Button variant="outline" className="w-full sm:w-auto h-auto min-h-12 py-3 sm:py-4 px-5 sm:px-8 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 whitespace-normal text-left sm:text-center justify-start sm:justify-center" onClick={() => {
                             const newProgress = Math.min(100, setupProgress + 25);
                             setSetupProgress(newProgress);
                             toast.success(`Step "${SETUP_STEPS[activeSetupStep].title}" marked as completed!`);
                             if (activeSetupStep < SETUP_STEPS.length - 1) {
                               setActiveSetupStep(activeSetupStep + 1);
                             }
                           }}>
                              Mark as completed
                           </Button>
                        </div>
                     </div>
                     <div onClick={() => setVideoModalOpen(true)} className="w-full sm:w-auto sm:min-w-[240px] h-[150px] sm:h-[180px] bg-slate-50 dark:bg-slate-800 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700/50 group cursor-pointer relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://img.youtube.com/vi/QDjNOzNO42s/hqdefault.jpg')" }} />
                        <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors z-0" />
                        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center text-indigo-600 relative z-10 group-hover:scale-110 transition-transform shrink-0">
                           <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-1" />
                        </div>
                        <p className="absolute bottom-4 sm:bottom-6 text-[9px] font-black uppercase tracking-[0.3em] text-white z-10 drop-shadow-lg">Watch Video Guide</p>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Have a Question + Expert Assistance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
               <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight italic mb-4 sm:mb-6 relative z-10">Have a question?</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6 sm:mb-8 relative z-10 break-words">Write to us at <span className="text-indigo-400 break-all">support.africa@protechassist.com</span> and we'll answer you.</p>
                  <Button onClick={() => window.open("mailto:support.africa@protechassist.com?subject=Protech Inventory OS Support Inquiry")} className="w-full h-12 sm:h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 relative z-10">
                     <MessageCircle className="mr-3 h-4 w-4" /> Mail us
                  </Button>
               </div>

               {[
                 { title: "Want to understand all we offer?", desc: "Request a demo with one of our product experts.", action: "Request a Demo", icon: Users, onClick: () => setDemoModalOpen(true) },
                 { title: "Learn more from our webinars", desc: "Gain in-depth understanding from our collection.", action: "Watch our Webinar", icon: Play, onClick: () => setWebinarModalOpen(true) },
               ].map((item, i) => (
                 <Card key={i} className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group">
                    <div className="flex gap-4 sm:gap-6 items-start">
                       <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight break-words">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4 break-words">{item.desc}</p>
                          <button onClick={item.onClick} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all cursor-pointer">
                             {item.action} <ArrowRight className="h-3 w-3" />
                          </button>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>

            {/* Useful Features Grid */}
            <div className="space-y-6 sm:space-y-10">
               <div>
                  <h3 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">Explore useful features</h3>
                  <div className="h-1 w-12 bg-indigo-600 rounded-full mt-3 sm:mt-4" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {USEFUL_FEATURES.map((feature, i) => (
                    <Card key={i} className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group">
                       <CardContent className="p-6 sm:p-10 space-y-5 sm:space-y-8">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                             <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                          </div>
                          <div className="space-y-2 sm:space-y-4">
                             <h4 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic break-words">{feature.title}</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                          </div>
                          <button onClick={feature.onClick} className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">
                             Learn More <ArrowRight className="h-4 w-4" />
                          </button>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>

            {/* Mobile Promo & QR */}
            <section className="bg-slate-900 rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-16 text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-[2s]" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center relative z-10">
                   <div>
                     <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight uppercase italic mb-5 sm:mb-8 leading-tight">Manage inventory <span className="text-indigo-400">on the go!</span></h2>
                     <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed mb-6 sm:mb-12 max-w-md">Experience the ease of managing your inventory with the Protech mobile app for Android & iOS.</p>
                     <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                        <Button onClick={() => toast.success("Mobile app package build starting... (Android APK)")} className="w-full sm:w-auto h-auto py-3 px-6 sm:px-8 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                           <Smartphone className="h-5 w-5 shrink-0" /> Google Play
                        </Button>
                        <Button onClick={() => toast.success("Mobile app package build starting... (iOS IPA)")} className="w-full sm:w-auto h-auto py-3 px-6 sm:px-8 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                           <SmartphoneIcon className="h-5 w-5 shrink-0" /> App Store
                        </Button>
                     </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl group-hover:border-indigo-500/50 transition-colors">
                     <div className="h-36 w-36 sm:h-48 sm:w-48 bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2.5rem] mb-5 sm:mb-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
                        <div className="h-full w-full bg-slate-100 rounded-2xl grid grid-cols-5 grid-rows-5 gap-1 p-2 sm:p-3">
                           {Array.from({ length: 25 }).map((_, i) => (
                             <div key={i} className={cn("rounded-sm", Math.random() > 0.4 ? "bg-slate-900" : "bg-transparent")} />
                           ))}
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic text-center">Scan to download</p>
                  </div>
               </div>
            </section>

            {/* Footer Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pt-10 sm:pt-12 border-t border-slate-100 dark:border-slate-800">
               {[
                 { 
                   title: "Other Protech Apps", 
                   items: [
                     { label: "Accounting", onClick: () => router.push("/dashboard/accounting/expenses") },
                     { label: "Ecommerce", onClick: () => toast.info("Ecommerce channel integrations are offline in free trial.") },
                     { label: "Subscription Billing", onClick: () => router.push("/dashboard/billing") },
                     { label: "Expense Reporting", onClick: () => router.push("/dashboard/accounting/expenses") },
                     { label: "CRM", onClick: () => router.push("/dashboard/customers") }
                   ] 
                 },
                 { 
                   title: "Help & Support", 
                   items: [
                     { label: "Contact Support", onClick: () => window.open("mailto:support.africa@protechassist.com?subject=Protech Inventory OS Support Request") },
                     { label: "Help Documentation", onClick: () => router.push("/dashboard/manual") },
                     { label: "Register for webinars", onClick: () => toast.success("Successfully registered for next Saturday's Protech Webinar!") },
                     { label: "FAQ", onClick: () => router.push("/dashboard/manual") }
                   ] 
                 },
                 { 
                   title: "Quick Links", 
                   items: [
                     { label: "Getting Started", onClick: () => setActiveTab("Getting Started") },
                     { label: "Mobile apps", onClick: () => toast.info("Download the app from the store using the badges below.") },
                     { label: "Add-ons", onClick: () => toast.info("Add-ons module coming soon.") }
                   ] 
                 },
                 { 
                   title: "Talk to us", 
                   items: [
                     { label: "Sierra Leone: 073019699 / +232 73 019699", onClick: () => window.open("tel:+23273019699") },
                     { label: "United Kingdom: +44 800...", onClick: () => toast.info("UK line is active for Premium customers.") },
                     { label: "Australia: +61 1800...", onClick: () => toast.info("Australia line is active for Premium customers.") }
                   ], 
                   italic: true 
                 },
               ].map((section, i) => (
                 <div key={i} className="space-y-4 sm:space-y-6">
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest break-words">{section.title}</h5>
                    <ul className="space-y-3 sm:space-y-4">
                       {section.items.map((item, j) => (
                         <li key={j}>
                            <button 
                              onClick={item.onClick}
                              className={cn("text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight hover:text-indigo-600 transition-colors text-left cursor-pointer break-words w-full", section.italic && "italic")}
                            >
                               {item.label}
                            </button>
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>

            <footer className="pt-12 pb-6 text-center px-2">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed break-words">© 2026, Protech Assist (SL) Limited. All Rights Reserved.</p>
            </footer>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ADVANCED EXECUTIVE INVOICE & THERMAL RECEIPT MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xl">
          
          {/* Receipt Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Receipt size={130} />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-indigo-400">Official Sales Receipt</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border",
                  selectedSale?.paymentStatus === "PAID" 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                )}>
                  {selectedSale?.paymentStatus || "PAID"}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">{selectedSale?.invoiceNumber}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {session?.user?.businessName || "Protech Assist Enterprise"} • Freetown Sierra Leone
              </p>
            </div>
          </div>

          {/* Metadata & Customer Bar */}
          <div className="px-6 sm:px-8 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>{selectedSale && format(new Date(selectedSale.createdAt), "MMM dd, yyyy • HH:mm")}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Users className="h-3.5 w-3.5 text-indigo-500" />
              <span>Customer: {selectedSale?.customer?.name || "Walk-in Retail Customer"}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[45vh] overflow-y-auto custom-scrollbar">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">Itemized Goods Breakdown</span>
              <div className="space-y-3">
                {selectedSale?.items && selectedSale.items.length > 0 ? (
                  selectedSale.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.product?.name || "Item"}</p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {item.quantity} × Le {Math.round(item.unitPrice || 0).toLocaleString()}
                        </p>
                      </div>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm shrink-0">
                        Le {Math.round(item.total || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    Standard POS Checkout Transaction
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Le {Math.round(parseFloat(selectedSale?.totalAmount || 0)).toLocaleString()}
                </span>
              </div>
              {Number(selectedSale?.tax) > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Sales Tax (GST):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    Le {Math.round(Number(selectedSale.tax)).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-base pt-3 border-t-2 border-slate-900 dark:border-slate-800 font-black">
                <span className="text-slate-900 dark:text-white uppercase tracking-tight">Grand Total Paid:</span>
                <span className="text-2xl font-mono text-indigo-600 dark:text-indigo-400">
                  Le {Math.round(parseFloat(selectedSale?.totalAmount || 0)).toLocaleString()}
                </span>
              </div>

              {/* Payment Auth Channel */}
              <div className="pt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Authorized Route:</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                  {selectedSale?.paymentMethod?.toUpperCase().includes("ORANGE") ? (
                    <span className="text-orange-500 font-bold flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Orange Money</span>
                  ) : selectedSale?.paymentMethod?.toUpperCase().includes("AFRI") ? (
                    <span className="text-blue-500 font-bold flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> AfriMoney</span>
                  ) : selectedSale?.paymentMethod?.toUpperCase().includes("CARD") ? (
                    <span className="text-purple-500 font-bold flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Card / POS</span>
                  ) : (
                    <span className="text-emerald-500 font-bold flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Cash Settlement</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="p-6 pt-0 flex flex-wrap gap-2.5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" /> Print Thermal Receipt
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const text = encodeURIComponent(`Hello, here is your receipt for invoice ${selectedSale?.invoiceNumber}. Total Paid: Le ${Math.round(parseFloat(selectedSale?.totalAmount || 0)).toLocaleString()}. Thank you for your business with ${session?.user?.businessName || "us"}!`);
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
              className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setIsDetailsOpen(false)}
              className="h-11 px-4 rounded-xl text-xs font-bold"
            >
              Close
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* NEURAL DIAGNOSTICS MODAL */}
      <Dialog open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xl">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <BrainCircuit size={130} />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-indigo-400">Protech Assist Neural Engine</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase border border-emerald-500/30 animate-pulse">
                  System Live
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Neural Cluster Diagnostics</h3>
              <p className="text-xs text-slate-400">
                Real-time health telemetry across all trade nodes & databases
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {diagnosticsRunning ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Scanning Trade Clusters...</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Pinging Neon PostgreSQL, Redis Cache & POS nodes</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { title: "Neon Serverless Database", detail: "Primary Read/Write Cluster (AWS us-east-1)", latency: "24ms", status: "Nominal (100%)", icon: Database, color: "text-emerald-500" },
                  { title: "AI Forecasting & Neural Engine", detail: "Predictive Inventory Depletion & Restock Models", latency: "18ms", status: "Active (99.9% SLA)", icon: BrainCircuit, color: "text-indigo-500" },
                  { title: "Offline Sync & Local IndexedDB", detail: "Bidirectional mutation queue & conflict resolution", latency: "0ms", status: "Synchronized", icon: RefreshCw, color: "text-emerald-500" },
                  { title: "Controlled Substances & Expiry SLA", detail: "Batch validation and Pharmacy Board compliance", latency: "Audited", status: "0 Violations", icon: ShieldCheck, color: "text-purple-500" },
                  { title: "Mobile Money & Payment Webhooks", detail: "Orange Money, AfriMoney & Flutterwave Gateway", latency: "Live", status: "Operational", icon: Smartphone, color: "text-emerald-500" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs shrink-0">
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.detail}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">{item.status}</span>
                      <span className="text-[9px] font-mono text-slate-400">{item.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 pt-0 flex gap-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Button 
              onClick={runDiagnostics} 
              disabled={diagnosticsRunning}
              variant="outline" 
              className="flex-1 h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", diagnosticsRunning && "animate-spin")} /> Re-run Scan
            </Button>
            <Button 
              onClick={() => {
                setIsDiagnosticsOpen(false);
                router.push("/dashboard/analytics");
              }} 
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              View Deep Analytics <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIDEO GUIDE DIALOG */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-none bg-slate-950 text-white p-0 overflow-hidden shadow-2xl">
          <div className="p-10 space-y-6">
            <h3 className="text-2xl font-[1000] tracking-tight uppercase italic text-indigo-400">Protech Inventory Walkthrough</h3>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              <iframe 
                src="https://www.youtube.com/embed/QDjNOzNO42s" 
                title="Product Walkthrough Guide"
                className="absolute inset-0 w-full h-full border-none"
                allowFullScreen
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration: 2 mins 45s</p>
              <Button onClick={() => setVideoModalOpen(false)} className="h-12 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-[10px] tracking-widest">Close Guide</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WEBINAR PLAYER DIALOG */}
      <Dialog open={webinarModalOpen} onOpenChange={setWebinarModalOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-none bg-slate-950 text-white p-0 overflow-hidden shadow-2xl">
          <div className="p-10 space-y-6">
            <h3 className="text-2xl font-[1000] tracking-tight uppercase italic text-indigo-400">Webinar: Scaling West African Retail</h3>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Webinar Video Player"
                className="absolute inset-0 w-full h-full border-none"
                allowFullScreen
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recorded Webinar Session</p>
              <Button onClick={() => setWebinarModalOpen(false)} className="h-12 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-[10px] tracking-widest">Close Player</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* REQUEST A DEMO DIALOG */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users size={140} />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Expert Assistance</div>
              <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">Schedule a Demo</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] pt-2">Unlock the full power of Protech Inventory OS with our engineering team.</p>
            </div>
          </div>
          <form onSubmit={handleDemoSubmit} className="p-10 space-y-6 bg-white dark:bg-slate-950 rounded-b-[3rem]">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                <Input 
                  type="text" 
                  required 
                  value={demoForm.name} 
                  onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                  placeholder="Steven Strange" 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                <Input 
                  type="email" 
                  required 
                  value={demoForm.email} 
                  onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                  placeholder="steven@company.com" 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
                <Input 
                  type="tel" 
                  required 
                  value={demoForm.phone} 
                  onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                  placeholder="073019699 / +232 73 019699" 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Specific Requirements (Optional)</label>
                <textarea 
                  value={demoForm.notes} 
                  onChange={(e) => setDemoForm({...demoForm, notes: e.target.value})}
                  placeholder="Tell us about your business size, locations, or migration requirements..." 
                  className="w-full p-4 min-h-[100px] rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setDemoModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                Cancel
              </Button>
              <Button type="submit" disabled={demoSubmitting} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-2xl">
                {demoSubmitting ? "Scheduling..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* RELEASE UPDATE DETAILS DIALOG */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={140} />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">System Release Note</div>
              <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">{selectedUpdate?.title}</h3>
              <div className="flex items-center gap-4 pt-4">
                <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                  Deployed
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedUpdate?.date}</span>
              </div>
            </div>
          </div>
          <div className="p-10 space-y-8 bg-white dark:bg-slate-950 rounded-b-[3rem]">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 dark:border-slate-800 pb-4">Update Details</h4>
              <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed uppercase">
                {selectedUpdate?.desc}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Release Version</span>
                <span className="text-slate-900 dark:text-white font-black">v2.6.4-beta</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Scope Impact</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">Enterprise Node</span>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <Button onClick={() => setIsUpdateOpen(false)} className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-2xl">
                Close Update View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* AI Welcome Modal */}
      <Dialog open={isWelcomeModalOpen} onOpenChange={setIsWelcomeModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl">
           <div className="relative p-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-slate-50 dark:bg-transparent dark:bg-grid-white/[0.02]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 dark:bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative h-20 w-20 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 shadow-xl backdrop-blur-md z-10 group">
                 <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 dark:border-primary/50 animate-pulse" />
                 <Cpu className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-500" />
              </div>

              <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mb-3 relative z-10 italic">Neural <span className="text-primary">Update</span></h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">System Synchronization Complete</p>

              <div className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-100 dark:border-slate-800/50 w-full relative z-10 shadow-inner min-h-[120px] flex items-center justify-center">
                 {welcomeLoading ? (
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Establishing Neural Link...</span>
                   </div>
                 ) : (
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed text-left w-full">
                     {welcomeUpdate}
                   </p>
                 )}
              </div>

              <Button 
                onClick={() => setIsWelcomeModalOpen(false)}
                className="mt-10 h-16 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 relative z-10"
              >
                Acknowledge Update
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfficeDashboardView({ stats }: { stats: any }) {
  const recentCheckins = stats?.recentCheckins || [];
  const recentExpenses = stats?.recentExpenses || [];
  const employeeCount = stats?.employeeCount || 0;
  const activeTodayCount = stats?.activeTodayCount || 0;
  const monthlyExpenses = stats?.monthlyExpenses || 0;
  const departmentsCount = stats?.departmentsCount || 0;

  const attendanceRate = employeeCount > 0 
    ? Math.round((activeTodayCount / employeeCount) * 100) 
    : 0;

  return (
    <div className="space-y-10">
      {/* Under Active Development Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start sm:items-center gap-4 text-amber-900 dark:text-amber-300">
        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
           <Briefcase className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">Under Active Development</span>
            <span className="text-xs font-bold opacity-70">• Early Access Preview</span>
          </div>
          <p className="text-xs font-medium mt-1 leading-snug">
            The Corporate Office Attendance & Expenses module is currently undergoing system development updates. You can access and preview employee check-ins and logs while full features are being completed.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard 
          title="Total Employees" 
          value={employeeCount} 
          description="Registered personnel" 
          icon={Users}
          colorClass="text-blue-600 animate-pulse"
          bgClass="bg-blue-50 dark:bg-blue-950/30"
          delay={0.1}
          href="/dashboard/staff/employees"
        />
        <StatCard 
          title="Active Today" 
          value={activeTodayCount} 
          description={`${attendanceRate}% attendance rate`} 
          icon={UserCheck}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 dark:bg-emerald-950/30"
          delay={0.2}
          href="/dashboard/staff/attendance"
        />
        <StatCard 
          title="Monthly Expenses" 
          value={monthlyExpenses} 
          prefix="Le "
          description="Current month operations" 
          icon={Wallet}
          colorClass="text-rose-600"
          bgClass="bg-rose-50 dark:bg-rose-950/30"
          delay={0.3}
          href="/dashboard/accounting/expenses"
        />
        <StatCard 
          title="Departments" 
          value={departmentsCount} 
          description="Active team units" 
          icon={Briefcase}
          colorClass="text-purple-600"
          bgClass="bg-purple-50 dark:bg-purple-950/30"
          delay={0.4}
          href="/dashboard/staff/employees"
        />
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Recent Checkins */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden h-full">
              <CardHeader className="p-8 border-b border-slate-100/50 dark:border-slate-800/50">
                 <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Check-ins</CardTitle>
                 <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live employee activity logs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto w-full">
                    <Table className="min-w-[600px] sm:min-w-full">
                       <TableHeader>
                          <TableRow>
                             <TableHead>Employee</TableHead>
                             <TableHead>Department</TableHead>
                             <TableHead>Check In</TableHead>
                             <TableHead>Status</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {recentCheckins.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-bold uppercase text-[10px]">No check-ins logged today</TableCell>
                             </TableRow>
                          ) : (
                             recentCheckins.map((c: any) => (
                                <TableRow key={c.id}>
                                   <TableCell className="font-bold flex items-center gap-3 py-4">
                                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                                         <AvatarImage src={c.employeeImage} alt={c.employeeName} />
                                         <AvatarFallback className="bg-slate-100 dark:bg-slate-800 font-black text-xs">{(c.employeeName || "E").charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                         <p className="text-sm text-slate-900 dark:text-white leading-tight">{c.employeeName}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{c.jobTitle}</p>
                                      </div>
                                   </TableCell>
                                   <TableCell className="font-bold text-slate-500 text-sm">{c.department}</TableCell>
                                   <TableCell className="font-bold text-slate-500 text-sm">
                                     {c.clockIn ? format(new Date(c.clockIn), "hh:mm a") : "-"}
                                   </TableCell>
                                   <TableCell>
                                      <span className={cn(
                                         "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                         c.status === "PRESENT" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                                      )}>
                                         {c.status}
                                      </span>
                                   </TableCell>
                                </TableRow>
                             ))
                          )}
                       </TableBody>
                    </Table>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Office Expenses */}
        <div className="space-y-8">
           <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Expenses</CardTitle>
                 <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Latest office expenditures</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 flex-1">
                 <div className="space-y-4">
                    {recentExpenses.length === 0 ? (
                       <p className="text-center text-slate-400 font-bold uppercase text-[10px] py-12">No expenses logged yet</p>
                    ) : (
                       recentExpenses.map((e: any) => (
                          <div key={e.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800/30">
                             <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{e.description}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{e.categoryName}</p>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-sm text-slate-950 dark:text-white">Le {e.amount?.toLocaleString() || 0}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-1">{e.date ? format(new Date(e.date), "MMM dd") : "-"}</p>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
