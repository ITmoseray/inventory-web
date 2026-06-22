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
} from "@/components/ui/dialog";
import Image from "next/image";
import { 
  Plus, Box, Users, FileText, ShoppingCart, Truck, Globe, ShieldCheck, 
  CreditCard, MapPin, Activity, Sparkles, History, Clock, ArrowRight, 
  Play, MessageCircle, Wallet, Smartphone, SmartphoneIcon, Printer, Receipt, 
  DollarSign, AlertCircle, Package, Book, Zap, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getRecentSales } from "@/lib/actions/sale";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getWelcomeUpdate } from "@/lib/actions/ai";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";

const TABS = ["Dashboard", "Getting Started", "Recent Updates"];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Dashboard");
  
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
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    skuCount: 0,
    lowStock: 0,
    expiringItems: 0,
    activeTransactions: 0,
    staffCount: 0,
    topProducts: [] as any[]
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
    fetchDashboardData();
  }, [session]);

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
      const [sales, dashboardStats] = await Promise.all([
        getRecentSales(),
        getDashboardStats()
      ]);

      setRecentSales(sales);
      setStats(dashboardStats);
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
    <div className="relative min-h-full pb-8 sm:p-6 md:p-10 bg-slate-50/30 dark:bg-slate-950/50 space-y-10">
      {/* Dynamic Background Ornament */}
      <div className={cn("absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[120px] opacity-[0.05] dark:opacity-[0.03] pointer-events-none", colors.primary)} />
      
      {/* Top Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 relative z-10"
      >
        <div className="space-y-4">
           <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-105">
                 <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] sm:text-[10px] font-[1000] text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">Enterprise Hub Active</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-400 dark:text-slate-500">
                {format(new Date(), "EEEE, MMMM dd, yyyy")}
              </span>
           </div>

           <div className="space-y-2">
              <h2 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                {getGreeting()}
              </h2>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none italic uppercase">
                {activeTab === "Dashboard" ? "Welcome " : ""}
                <span className="text-indigo-600">{activeTab === "Dashboard" ? "Back" : activeTab}</span>
              </h1>
           </div>
        </div>

        {activeTab === "Dashboard" && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
             <Button 
               onClick={() => router.push("/dashboard/manual")}
               variant="outline"
               className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl sm:rounded-[2rem] border-slate-200 bg-white dark:bg-slate-900 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-sm hover:bg-slate-50 transition-all hover:scale-[1.05] active:scale-95 gap-3"
             >
               <Book className="h-5 w-5 text-indigo-600" /> Manual
             </Button>
             <Button 
               onClick={() => router.push("/dashboard/pos")}
               className={cn("h-14 sm:h-16 px-8 sm:px-10 rounded-2xl sm:rounded-[2rem] text-white font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl transition-all hover:scale-[1.05] active:scale-95", colors.primary)}
             >
               <ShoppingCart className="mr-3 h-5 w-5" /> New Transaction
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
            {/* KPI Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StatCard 
                title="Total Revenue" 
                value={stats.revenue} 
                prefix="Le "
                description="Global Platform Total" 
                icon={DollarSign}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50 dark:bg-emerald-950/30"
                delay={0.1}
                href="/dashboard/sales/history"
              />
              <StatCard 
                title="Today's Orders" 
                value={stats.orders} 
                description="Processing Cycles" 
                icon={ShoppingCart}
                colorClass="text-blue-600"
                bgClass="bg-blue-50 dark:bg-blue-950/30"
                delay={0.2}
                href="/dashboard/sales/orders"
              />
              <StatCard 
                title={businessType === "PHARMACY" ? "Drug Items" : "SKU Count"} 
                value={stats.skuCount} 
                description="Managed Catalog" 
                icon={Package}
                colorClass="text-purple-600"
                bgClass="bg-purple-50 dark:bg-purple-950/30"
                delay={0.3}
                href="/dashboard/inventory/products"
              />
              <StatCard 
                title="Low Stock" 
                value={stats.lowStock} 
                description="Urgent Attention" 
                icon={AlertCircle}
                colorClass="text-rose-600"
                bgClass="bg-rose-50 dark:bg-rose-950/30"
                delay={0.4}
                href="/dashboard/inventory/products"
              />
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
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
                 <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm h-full flex flex-col">
                   <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Nodes</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Operational Status</CardDescription>
                   </CardHeader>
                   <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-center space-y-6">
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
                      <Button onClick={() => router.push("/dashboard/analytics")} className="w-full h-14 rounded-2xl bg-slate-900 text-white dark:bg-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all">Launch Neural Diagnostics</Button>
                   </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 pb-12">
              <div className="lg:col-span-2">
                <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm overflow-hidden h-full">
                   <CardHeader className="p-8 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                               <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Activity</CardTitle>
                               <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live ledger stream</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 self-start sm:self-auto" onClick={() => router.push("/dashboard/sales/history")}>History Explorer <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
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
                           <div className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                              {recentSales.slice(0, 6).map((sale: any) => (
                                <div key={sale.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group" onClick={() => { setSelectedSale(sale); setIsDetailsOpen(true); }}>
                                   <div className="flex items-center gap-5">
                                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white dark:border-slate-800", colors.secondary)}>
                                         <Activity className={cn("h-6 w-6", colors.text)} />
                                      </div>
                                      <div>
                                         <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{sale.invoiceNumber}</div>
                                         <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {format(new Date(sale.createdAt), "HH:mm")}</div>
                                            <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <span className="italic">{sale.paymentMethod}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <div className="font-[1000] text-xl text-slate-900 dark:text-white tracking-tighter">Le {Math.round(parseFloat(sale.totalAmount)).toLocaleString()}</div>
                                      <div className={cn("px-2 py-0.5 rounded-lg text-[9px] font-[1000] uppercase tracking-widest mt-1", sale.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>{sale.paymentStatus}</div>
                                   </div>
                                </div>
                              ))}
                           </div>
                         )}
                      </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden h-full">
                 <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Performing SKUs</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Highest volume products</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 flex-1">
                    {!stats.topProducts || stats.topProducts.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-50">
                          <Package className="h-10 w-10 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No trade data yet</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          {stats.topProducts.map((product, i) => (
                             <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group" onClick={() => router.push("/dashboard/analytics")}>
                                <div className="flex items-center gap-4 overflow-hidden">
                                   <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white dark:border-slate-700 shadow-sm", colors.secondary)}>
                                      <span className={cn("text-lg font-black", colors.text)}>#{i + 1}</span>
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-primary transition-colors">{product.name}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate mt-0.5">{product.category}</p>
                                   </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                   <p className="text-sm font-[1000] text-slate-900 dark:text-white">{product.quantitySold} units</p>
                                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Le {product.revenue.toLocaleString()}</p>
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
              <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden h-full">
                 <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Staff Leaderboard</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Top Revenue Generators</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 flex-1">
                    {!stats.topStaff || stats.topStaff.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-50">
                          <Users className="h-10 w-10 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No staff sales data yet</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          {stats.topStaff.map((staff: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                   <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm">
                                      <span className="text-lg font-black">#{i + 1}</span>
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-primary transition-colors">{staff.name}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate mt-0.5">{staff.role}</p>
                                   </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Le {staff.revenue.toLocaleString()}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "Getting Started" && (
          <motion.div 
            key="getting-started-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Welcome Banner */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
               <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Welcome to <span className="text-indigo-600">Protech Inventory</span></h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-4">Overview of Protech Inventory</p>
                    <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
                      The easy-to-use inventory software that you can set up in no time! Let's get you up and running effectively.
                    </p>
                  </div>

                  {/* Setup Checklist */}
                  <Card className="border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden">
                     <div className="p-5 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/30">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                              <Zap className="h-5 w-5 fill-current" />
                           </div>
                           <div>
                              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Let's get you up and running</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Phase 01 Configuration</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                           <Button variant="outline" className="hidden md:flex h-12 rounded-xl border-indigo-100 text-indigo-600 font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 gap-2" onClick={() => router.push("/dashboard/inventory/products")}>
                              <Plus className="h-3 w-3" /> Quick Create
                           </Button>
                           <div className="text-left sm:text-right">
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="text-xl sm:text-3xl font-[1000] text-indigo-600 italic tracking-tighter">{setupProgress}% Completed</span>
                              </div>
                              <div className="w-full sm:w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${setupProgress}%` }} className="h-full bg-indigo-600 rounded-full" />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-50 dark:border-slate-800">
                        {SETUP_STEPS.map((step, i) => (
                           <button 
                             key={i}
                             onClick={() => setActiveSetupStep(i)}
                             className={cn(
                               "p-6 flex flex-col items-center text-center gap-3 transition-all relative group cursor-pointer",
                               activeSetupStep === i ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800"
                             )}
                           >
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                activeSetupStep === i ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                              )}>
                                 {i + 1}
                              </div>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest leading-tight",
                                activeSetupStep === i ? "text-slate-900 dark:text-white" : "text-slate-400"
                              )}>{step.title}</span>
                              {activeSetupStep === i && <motion.div layoutId="step-dot" className="absolute -bottom-px left-0 right-0 h-1 bg-indigo-600" />}
                           </button>
                        ))}
                     </div>

                     <div className="p-5 md:p-12 space-y-8 md:space-y-10">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                           <div className="flex-1 space-y-6">
                              <h4 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">{SETUP_STEPS[activeSetupStep].title}</h4>
                              <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg leading-relaxed">{SETUP_STEPS[activeSetupStep].desc}</p>
                              
                              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                                 {SETUP_STEPS[activeSetupStep].actions.map((action, i) => (
                                   <Button key={i} onClick={() => router.push(action.href)} className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-600/20 group">
                                      <action.icon className="mr-3 h-4 w-4 group-hover:scale-125 transition-transform" />
                                      {action.label}
                                   </Button>
                                 ))}
                                 <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50" onClick={() => {
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
                           <div onClick={() => setVideoModalOpen(true)} className="w-full md:w-[280px] h-[160px] md:h-[180px] bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700/50 group cursor-pointer relative overflow-hidden shrink-0">
                              <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                              <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center text-indigo-600 relative z-10 group-hover:scale-110 transition-transform">
                                 <Play className="h-6 w-6 fill-current ml-1" />
                              </div>
                              <p className="absolute bottom-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Watch Video Guide</p>
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Features Grid & Resource Links */}
               <div className="w-full lg:w-[420px] xl:w-[450px] shrink-0 space-y-10 lg:space-y-12">
                  <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                     <h3 className="text-xl font-black uppercase tracking-tight italic mb-8 relative z-10">Have a question?</h3>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 relative z-10">Write to us at <span className="text-indigo-400">support.africa@protechassist.com</span> and we'll answer you.</p>
                     <Button onClick={() => window.open("mailto:support.africa@protechassist.com?subject=Protech Inventory OS Support Inquiry")} className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 relative z-10">
                        <MessageCircle className="mr-3 h-4 w-4" /> Mail us
                     </Button>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 italic ml-1">Expert Assistance</h4>
                     {[
                       { title: "Want to understand all we offer?", desc: "Request a demo with one of our product experts.", action: "Request a Demo", icon: Users, onClick: () => setDemoModalOpen(true) },
                       { title: "Learn more from our webinars", desc: "Gain in-depth understanding from our collection.", action: "Watch our Webinar", icon: Play, onClick: () => setWebinarModalOpen(true) },
                     ].map((item, i) => (
                       <Card key={i} className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group">
                          <div className="flex gap-6 items-center">
                             <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <item.icon className="h-6 w-6" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{item.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">{item.desc}</p>
                                <button onClick={item.onClick} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all cursor-pointer">
                                   {item.action} <ArrowRight className="h-3 w-3" />
                                </button>
                             </div>
                          </div>
                       </Card>
                     ))}
                  </div>
               </div>
            </div>

            {/* Useful Features Grid */}
            <div className="space-y-10">
               <div>
                  <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">Explore useful features</h3>
                  <div className="h-1 w-12 bg-indigo-600 rounded-full mt-4" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {USEFUL_FEATURES.map((feature, i) => (
                    <Card key={i} className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group">
                       <CardContent className="p-10 space-y-8">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                             <feature.icon className="h-8 w-8" />
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{feature.title}</h4>
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
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-[2s]" />
               <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
                   <div>
                     <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase italic mb-6 sm:mb-8 leading-[1.1] sm:leading-[0.9]">Manage inventory <br className="hidden sm:block" /><span className="text-indigo-400">on the go!</span></h2>
                     <p className="text-slate-400 font-medium text-base sm:text-lg leading-relaxed mb-8 sm:mb-12 max-w-md">Experience the ease of managing your inventory with the Protech mobile app for Android & iOS.</p>
                     <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
                        <Button onClick={() => toast.success("Mobile app package build starting... (Android APK)")} className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-white text-slate-900 dark:text-white dark:bg-slate-950 font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
                           <Smartphone className="h-5 w-5" /> Google Play
                        </Button>
                        <Button onClick={() => toast.success("Mobile app package build starting... (iOS IPA)")} className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-white text-slate-900 dark:text-white dark:bg-slate-950 font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
                           <SmartphoneIcon className="h-5 w-5" /> App Store
                        </Button>
                     </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl group-hover:border-indigo-500/50 transition-colors">
                     <div className="h-48 w-48 bg-white p-6 rounded-[2.5rem] mb-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
                        <div className="h-full w-full bg-slate-100 rounded-2xl grid grid-cols-5 grid-rows-5 gap-1.5 p-3">
                           {Array.from({ length: 25 }).map((_, i) => (
                             <div key={i} className={cn("rounded-sm", Math.random() > 0.4 ? "bg-slate-900" : "bg-transparent")} />
                           ))}
                        </div>
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Scan to download</p>
                  </div>
               </div>
            </section>

            {/* Other Apps & Footer Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pt-12 border-t border-slate-100 dark:border-slate-800">
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
                     { label: "Add-ons", onClick: () => toast.info("Add-ons module coming soon.") },
                     { label: "What's New?", onClick: () => setActiveTab("Recent Updates") }
                   ] 
                 },
                 { 
                   title: "Talk to us", 
                   items: [
                     { label: "Sierra Leone: +232 34 955581", onClick: () => window.open("tel:+23234955581") },
                     { label: "United Kingdom: +44 800...", onClick: () => toast.info("UK line is active for Premium customers.") },
                     { label: "Australia: +61 1800...", onClick: () => toast.info("Australia line is active for Premium customers.") }
                   ], 
                   italic: true 
                 },
               ].map((section, i) => (
                 <div key={i} className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{section.title}</h5>
                    <ul className="space-y-4">
                       {section.items.map((item, j) => (
                         <li key={j}>
                            <button 
                              onClick={item.onClick}
                              className={cn("text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight hover:text-indigo-600 transition-colors text-left cursor-pointer", section.italic && "italic")}
                            >
                               {item.label}
                            </button>
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>

            <footer className="pt-20 pb-12 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic">© 2026, Protech Assist (SL) Limited. All Rights Reserved.</p>
            </footer>
          </motion.div>
        )}

        {activeTab === "Recent Updates" && (
          <motion.div 
            key="updates-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl space-y-12 pb-20 overflow-hidden"
          >
             {[
               { date: "28 April 2026", title: "Add as Credit Option for Bill Payment Deletion", desc: "We have enhanced bill payment deletion. You can now retain the amount as a Vendor Credit by selecting the Dissociate and Add as Credit option, allowing it to be applied to future bills." },
               { date: "27 April 2026", title: "Set a Default Inventory Valuation Method for Items", desc: "You can now set a default inventory valuation method for items. The configured default is applied automatically during item creation or import if the valuation method is not specified." },
               { date: "21 April 2026", title: "Enhancement in Report Filters", desc: "You can now use Advanced Filters in Reports to include child options for reporting tags, making data filtering easier." },
               { date: "17 April 2026", title: "Import Applied Excess Vendor Payments With TDS Columns", desc: "The Import Applied Excess Payments option in the Payments Made module now supports the Bill TDS Amount and TDS Account columns." },
               { date: "15 April 2026", title: "Filter Line Items by Warehouse on Purchase Receives", desc: "You can now filter line items by warehouse on the Purchase Receive creation page, making it easy to view and receive items for a specific warehouse." },
               { date: "13 April 2026", title: "Android App Updates: Preferred Bin & Approvals", desc: "We've rolled out a new update with enhancements to improve your mobile experience. You can now use Preferred Bin in the Picklist module and perform simple approvals." },
               { date: "08 April 2026", title: "Introducing Accessibility Preferences", desc: "Accessibility Preferences is a dedicated panel in the profile section that lets you customize text spacing, underline links, and access keyboard shortcuts." },
               { date: "06 April 2026", title: "Introducing Purchase Returns", desc: "You can now create Purchase Returns in Protech Inventory to manage the return of purchased items to vendors. Note: Available only for Enterprise plan." },
               { date: "01 April 2026", title: "Scan Items in Custom Modules", desc: "You can now use the Scan Item option in custom modules to quickly add and manage items using barcode scanning." },
               { date: "31 March 2026", title: "Recount Option in Stock Counts", desc: "Create a new stock count using rejected items from an existing completed stock count through the Recount option." },
               { date: "24 March 2026", title: "Quick Assembly Option in Assemblies", desc: "Instantly assemble component items using the Quick Assembly option without interrupting the workflow." },
               { date: "18 March 2026", title: "Introducing Profit Margin", desc: "The Profit Margin feature is now available across all editions with configurable user access and permissions." },
             ].map((update, i) => (
               <div key={i} className="flex gap-4 sm:gap-10 group">
                  <div className="flex flex-col items-center shrink-0">
                     <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] group-hover:scale-125 transition-transform mt-1" />
                     <div className="flex-1 w-px bg-slate-200 dark:bg-slate-800 mt-4" />
                  </div>
                  <div className="pb-10 sm:pb-16 min-w-0">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{update.date}</span>
                     <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mt-2 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{update.title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed max-w-2xl">{update.desc}</p>
                      <Button 
                        onClick={() => {
                          setSelectedUpdate(update);
                          setIsUpdateOpen(true);
                        }}
                        variant="outline" 
                        className="mt-8 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest px-8 h-12 hover:bg-slate-50"
                      >
                        Read More
                      </Button>
                  </div>
               </div>
             ))}

             <div className="pt-10 flex flex-col items-center border-t border-slate-100 dark:border-slate-800 gap-10">
                <Button className="h-16 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl">
                   More Updates
                </Button>
                
                <section className="w-full bg-slate-900 rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-16 text-white overflow-hidden relative group">
                   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                   <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
                      <div>
                         <h2 className="text-5xl font-black tracking-tight uppercase italic mb-8 leading-[0.9]">Manage inventory <br /><span className="text-indigo-400">on the go!</span></h2>
                         <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-md">Experience the ease of managing your inventory with the mobile app.</p>
                         <div className="flex flex-wrap gap-6">
                            <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black flex items-center gap-4 uppercase text-[11px] tracking-widest hover:scale-105 transition-all">
                               <Smartphone className="h-5 w-5" /> Google Play
                            </Button>
                            <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black flex items-center gap-4 uppercase text-[11px] tracking-widest hover:scale-105 transition-all">
                               <SmartphoneIcon className="h-5 w-5" /> App Store
                            </Button>
                         </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                         <div className="h-48 w-48 bg-white p-6 rounded-[2.5rem] mb-8 shadow-2xl">
                            <div className="h-full w-full bg-slate-100 rounded-2xl grid grid-cols-5 grid-rows-5 gap-1.5 p-3">
                               {Array.from({ length: 25 }).map((_, i) => (
                                 <div key={i} className={cn("rounded-sm", Math.random() > 0.4 ? "bg-slate-900" : "bg-transparent")} />
                               ))}
                            </div>
                         </div>
                         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Scan to download</p>
                      </div>
                   </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-12 w-full">
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
                         { label: "Add-ons", onClick: () => toast.info("Add-ons module coming soon.") },
                         { label: "What's New?", onClick: () => setActiveTab("Recent Updates") }
                       ] 
                     },
                     { 
                       title: "Talk to us", 
                       items: [
                         { label: "USA: +1 844...", onClick: () => toast.info("USA line is active for Premium customers.") },
                         { label: "UK: +44 800...", onClick: () => toast.info("UK line is active for Premium customers.") },
                         { label: "AU: +61 1800...", onClick: () => toast.info("Australia line is active for Premium customers.") }
                       ], 
                       italic: true 
                     },
                   ].map((section, i) => (
                     <div key={i} className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{section.title}</h5>
                        <ul className="space-y-4">
                           {section.items.map((item, j) => (
                             <li key={j}>
                                <button 
                                  onClick={item.onClick}
                                  className={cn("text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight hover:text-indigo-600 transition-colors text-left cursor-pointer", section.italic && "italic")}
                                >
                                   {item.label}
                                </button>
                             </li>
                           ))}
                        </ul>
                     </div>
                   ))}
                </div>

                <footer className="pt-20 pb-12 text-center w-full">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic">© 2026, Protech Assist (SL) Limited. All Rights Reserved.</p>
                </footer>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVOICE DETAILS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white text-slate-900">
           <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Receipt size={140} />
              </div>
              <div className="relative z-10 space-y-2">
                 <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Invoice Intelligence</div>
                 <h3 className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none">{selectedSale?.invoiceNumber}</h3>
                 <div className="flex items-center gap-4 pt-4">
                    <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", 
                       selectedSale?.paymentStatus === 'PAID' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                       {selectedSale?.paymentStatus}
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedSale && format(new Date(selectedSale.createdAt), "PPP p")}</span>
                 </div>
              </div>
           </div>

           <div className="p-10 space-y-10 bg-white max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Line Item Breakdown</h4>
                 <div className="space-y-6">
                    {selectedSale?.items.map((item: any, i: number) => (
                       <div key={i} className="flex justify-between items-start">
                          <div className="flex-1">
                             <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.product?.name || 'Unknown Product'}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}
                             </div>
                          </div>
                          <div className="text-lg font-[1000] text-slate-900 dark:text-white tracking-tighter">
                             Le {Math.round(item.total).toLocaleString()}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 space-y-4">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Transaction Subtotal</span>
                    <span className="text-slate-900 dark:text-white">Le {Math.round(selectedSale?.totalAmount / 1.15).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Tax Applied (15%)</span>
                    <span className="text-slate-900 dark:text-white">Le {Math.round(selectedSale?.totalAmount - (selectedSale?.totalAmount / 1.15)).toLocaleString()}</span>
                 </div>
                 <div className="h-px bg-slate-50 w-full my-4" />
                 <div className="flex justify-between items-end pt-2">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] italic">Final Settlement</span>
                       <div className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(selectedSale?.totalAmount).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Method</span>
                       <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                          {selectedSale?.paymentMethod === 'CASH' ? <Wallet size={14} className="text-indigo-500" /> : <SmartphoneIcon size={14} className="text-emerald-500" />}
                          {selectedSale?.paymentMethod}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 pt-0 flex gap-4 bg-white relative z-10">
              <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-500 border-slate-100 hover:bg-slate-50 transition-all flex gap-3">
                 <Printer className="h-5 w-5" /> Print Copy
              </Button>
              <Button onClick={() => setIsDetailsOpen(false)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-2xl transition-all">
                 Terminate View
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
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
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
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white text-slate-900">
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
          <form onSubmit={handleDemoSubmit} className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                <Input 
                  type="text" 
                  required 
                  value={demoForm.name} 
                  onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                  placeholder="Steven Strange" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900"
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
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
                <Input 
                  type="tel" 
                  required 
                  value={demoForm.phone} 
                  onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                  placeholder="+232 34 955581" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus:ring-2 focus:ring-indigo-500/10 text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Specific Requirements (Optional)</label>
                <textarea 
                  value={demoForm.notes} 
                  onChange={(e) => setDemoForm({...demoForm, notes: e.target.value})}
                  placeholder="Tell us about your business size, locations, or migration requirements..." 
                  className="w-full p-4 min-h-[100px] rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setDemoModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 border-slate-100 hover:bg-slate-50">
                Cancel
              </Button>
              <Button type="submit" disabled={demoSubmitting} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-2xl">
                {demoSubmitting ? "Scheduling..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* RELEASE UPDATE DETAILS DIALOG */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white text-slate-900">
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
          <div className="p-10 space-y-8 bg-white">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Update Details</h4>
              <p className="text-slate-700 font-medium text-sm leading-relaxed uppercase">
                {selectedUpdate?.desc}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Release Version</span>
                <span className="text-slate-900 dark:text-white font-black">v2.6.4-beta</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Scope Impact</span>
                <span className="text-indigo-600 font-black">Enterprise Node</span>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <Button onClick={() => setIsUpdateOpen(false)} className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-2xl">
                Close Update View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* AI Welcome Modal */}
      <Dialog open={isWelcomeModalOpen} onOpenChange={setIsWelcomeModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-900 border-slate-800 rounded-3xl shadow-[0_0_100px_rgba(79,74,133,0.3)]">
           <div className="relative p-8 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative h-20 w-20 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md z-10">
                 <div className="absolute inset-0 rounded-3xl border-2 border-primary/50 animate-pulse" />
                 <Cpu className="h-10 w-10 text-primary" />
              </div>

              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 relative z-10">Neural <span className="text-primary">Update</span></h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">System Synchronization Complete</p>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 w-full relative z-10 shadow-inner min-h-[100px] flex items-center justify-center">
                 {welcomeLoading ? (
                   <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Establishing Link...</span>
                   </div>
                 ) : (
                   <p className="text-sm font-medium text-slate-200 leading-relaxed text-left w-full">
                     {welcomeUpdate}
                   </p>
                 )}
              </div>

              <Button 
                onClick={() => setIsWelcomeModalOpen(false)}
                className="mt-8 h-14 w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all relative z-10"
              >
                Acknowledge
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
