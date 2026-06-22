"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ShoppingCart, Users, BarChart3, Settings, 
  Search, Bell, Info, ChevronRight, PieChart, TrendingUp, 
  Clock, CheckCircle2, AlertCircle, Box, Truck, Filter,
  ExternalLink, Play, HelpCircle, MessageCircle, FileText,
  Smartphone, Globe, LayoutDashboard, Database, Activity,
  Calendar, Menu, X, ArrowRight, ShieldCheck, CreditCard,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart as RePieChart, Pie, Cell 
} from "recharts";
import Image from "next/image";
import { cn } from "@/lib/utils";

const TABS = ["Dashboard", "Getting Started", "Recent Updates"];

const MOCK_SALES_DATA = [
  { name: "01 Oct", value: 120 },
  { name: "03 Oct", value: 300 },
  { name: "05 Oct", value: 200 },
  { name: "07 Oct", value: 450 },
  { name: "09 Oct", value: 320 },
  { name: "11 Oct", value: 600 },
  { name: "13 Oct", value: 400 },
  { name: "15 Oct", value: 550 },
  { name: "17 Oct", value: 380 },
  { name: "19 Oct", value: 700 },
  { name: "21 Oct", value: 500 },
  { name: "23 Oct", value: 450 },
  { name: "25 Oct", value: 600 },
  { name: "27 Oct", value: 800 },
  { name: "29 Oct", value: 650 },
  { name: "31 Oct", value: 900 },
];

const VENDOR_DATA = [
  { name: "Emily J.", value: 28, color: "#4f46e5" },
  { name: "David Williams", value: 25, color: "#06b6d4" },
  { name: "Michael Davis", value: 20, color: "#10b981" },
  { name: "Zoe Turner", value: 15, color: "#f59e0b" },
  { name: "John Smith", value: 12, color: "#ef4444" },
];

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [setupProgress, setSetupProgress] = useState(0);
  const [activeSetupStep, setActiveSetupStep] = useState(0);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white w-72 flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full lg:hidden"
      )}>
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
             <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter italic">Protech <span className="text-indigo-400">Inventory</span></h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Trade Intelligence OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-8 mt-4">
          <div className="space-y-1">
             <div className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Main Menu</div>
             {[
               { icon: LayoutDashboard, label: "Home", active: true },
               { icon: Box, label: "Inventory" },
               { icon: ShoppingCart, label: "Sales" },
               { icon: Truck, label: "Purchases" },
               { icon: Users, label: "Customers" },
               { icon: BarChart3, label: "Reports" },
             ].map((item) => (
               <button 
                 key={item.label}
                 className={cn(
                   "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                   item.active ? "bg-white/10 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                 )}
               >
                 <item.icon className={cn("h-5 w-5", item.active ? "text-indigo-400" : "text-slate-500")} />
                 {item.label}
               </button>
             ))}
          </div>

          <div className="space-y-1">
             <div className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Configuration</div>
             {[
               { icon: FileText, label: "Documents" },
               { icon: Activity, label: "Integrations" },
               { icon: Settings, label: "Settings" },
             ].map((item) => (
               <button 
                 key={item.label}
                 className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5"
               >
                 <item.icon className="h-5 w-5 text-slate-500" />
                 {item.label}
               </button>
             ))}
          </div>
        </nav>

        <div className="p-6 mt-auto">
           <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 italic">Live Guided Onboarding</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">Let our experts show you how to maximize your inventory ROI.</p>
              <Button size="sm" className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] h-9">Connect Now</Button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Trial Banner */}
        <div className="w-full bg-[#FFF9E5] border-b border-amber-100 px-6 py-3 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <p className="text-sm font-bold text-slate-800 dark:text-white text-slate-900 dark:text-white">
                Your premium trial plan ends today.
              </p>
              <div className="hidden sm:block h-3 w-px bg-slate-200" />
              <Link href="/pricing" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                Subscribe Now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <button className="p-1.5 hover:bg-amber-200/50 rounded-full transition-colors text-amber-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <div className="flex items-center gap-6 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all lg:hidden"
            >
               <Menu className="h-6 w-6" />
            </button>
            <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tech Enterprise</span>
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
            <button className="relative p-2 rounded-full hover:bg-slate-50 transition-all group">
               <Bell className="h-5 w-5 text-slate-400 group-hover:text-slate-900 dark:text-white" />
               <div className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-[1000] text-slate-900 dark:text-white leading-none">strangesteven001</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Admin Account</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-sm">
                  S
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          
          <div className="mb-10">
             <div className="flex items-center gap-4 mb-2">
                <div className="h-1.5 w-8 bg-indigo-600 rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">Home Intelligence</h2>
             </div>
             <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Hello, <span className="text-indigo-600">strangesteven001</span></h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 mb-10 border-b border-slate-200">
             {TABS.map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                   activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {tab}
                 {activeTab === tab && (
                   <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
                 )}
               </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { label: "To be Packed", value: "51.00", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                     { label: "To be Shipped", value: "40.00", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
                     { label: "To be Delivered", value: "52.00", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                     { label: "To be Invoiced", value: "97.00", icon: FileText, color: "text-rose-600", bg: "bg-rose-50" },
                   ].map((item, i) => (
                     <Card key={i} className="border-none bg-white shadow-sm rounded-3xl group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                        <CardContent className="p-8">
                           <div className="flex items-center justify-between mb-6">
                              <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", item.bg)}>
                                 <item.icon className={cn("h-6 w-6", item.color)} />
                              </div>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                           </div>
                           <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{item.value}</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sales Order Summary */}
                  <Card className="lg:col-span-2 border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-black uppercase tracking-tight italic">Sales Order Summary</CardTitle>
                          <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Order Volume Intensity • This Month</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <Calendar className="h-3 w-3" /> Monthly
                           </div>
                           <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_SALES_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} 
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#4f46e5' }}
                          />
                          <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Vendors */}
                  <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                      <CardTitle className="text-xl font-black uppercase tracking-tight italic">Top Vendors</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Supplier Market Share</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="h-[200px] mb-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                              <Pie
                                data={VENDOR_DATA}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {VENDOR_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </RePieChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="space-y-4">
                          {VENDOR_DATA.map((vendor) => (
                            <div key={vendor.name} className="flex items-center justify-between group cursor-pointer">
                               <div className="flex items-center gap-3">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: vendor.color }} />
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{vendor.name}</span>
                               </div>
                               <span className="text-xs font-[1000] text-slate-400 italic">{vendor.value}%</span>
                            </div>
                          ))}
                       </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Top Selling Items */}
                   <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                      <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tight italic">Top Selling Items</CardTitle>
                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">This Month</span>
                         </div>
                      </CardHeader>
                      <CardContent className="p-0">
                         <div className="divide-y divide-slate-50">
                            {[
                              { name: "Storage Cabinet", sku: "CAB-001", qty: "118Mtr", growth: "118%" },
                              { name: "Dining Table Set", sku: "DIN-882", qty: "261Mtr", growth: "261%" },
                              { name: "Sofa", sku: "SOF-991", qty: "51Mtr", growth: "51%" },
                              { name: "Queen Size Bed", sku: "BED-102", qty: "341Mtr", growth: "341%" },
                            ].map((item, i) => (
                              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                       <Box className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">SKU: {item.sku}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{item.qty}</p>
                                    <p className="text-[9px] font-black text-emerald-500 mt-1">+{item.growth}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </CardContent>
                   </Card>

                   {/* Receive History */}
                   <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                      <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                         <CardTitle className="text-lg font-black uppercase tracking-tight italic">Receive History</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                         <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                               <tr>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Receive#</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {[
                                 { date: "2026-06-04", id: "PR-7446", vendor: "Delia Kautzer", qty: "88237" },
                                 { date: "2025-10-07", id: "PR-9021", vendor: "Dr. Tony Rolfson", qty: "87352" },
                                 { date: "2025-11-27", id: "PR-7269", vendor: "Darren Sporer", qty: "76255" },
                                 { date: "2026-05-06", id: "PR-5263", vendor: "Leroy Predovic", qty: "22836" },
                               ].map((item, i) => (
                                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{item.date}</td>
                                    <td className="px-6 py-5 text-[10px] font-black text-indigo-600">{item.id}</td>
                                    <td className="px-6 py-5 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.vendor}</td>
                                    <td className="px-6 py-5 text-[10px] font-black text-slate-900 dark:text-white text-right">{item.qty}</td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </CardContent>
                   </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "Getting Started" && (
              <motion.div 
                key="getting-started"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="flex flex-col lg:flex-row gap-12">
                   <div className="flex-1 space-y-8">
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Welcome to <span className="text-indigo-600">Protech Inventory</span></h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-4">Overview of Protech Inventory</p>
                        <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
                          The easy-to-use inventory software that you can set up in no time! Let's get you up and running effectively.
                        </p>
                      </div>

                      {/* Checklist */}
                      <Card className="border-none bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden">
                         <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                  <Zap className="h-5 w-5 fill-current" />
                               </div>
                               <div>
                                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Let's get you up and running</h3>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Phase 01 Configuration</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-8">
                               <Button variant="outline" className="hidden md:flex h-12 rounded-xl border-indigo-100 text-indigo-600 font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 gap-2">
                                  <Plus className="h-3 w-3" /> Quick Create
                               </Button>
                               <div className="text-right">
                                  <div className="flex items-center gap-3 mb-2">
                                     <span className="text-3xl font-[1000] text-indigo-600 italic tracking-tighter">{setupProgress}% Completed</span>
                                  </div>
                                  <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${setupProgress}%` }} className="h-full bg-indigo-600 rounded-full" />
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="p-10">
                            <div className="flex flex-col gap-4">
                               {["Configure Inventory", "Configure Purchases", "Configure Sales", "Dispatch Order"].map((step, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                       <div className="h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-indigo-600 group-hover:text-indigo-600">{i+1}</div>
                                       <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{step}</span>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-slate-200 group-hover:text-indigo-600" />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </Card>
                   </div>

                   <div className="w-full lg:w-[400px] space-y-12">
                      <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                         <h3 className="text-xl font-black uppercase tracking-tight italic mb-8 relative z-10">Have a question?</h3>
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 relative z-10">Write to us at <span className="text-indigo-400">support.africa@protechassist.com</span></p>
                         <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50">Mail us</Button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Recent Updates" && (
              <motion.div 
                key="updates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl space-y-8"
              >
                {[
                  { date: "28 April 2026", title: "Add as Credit Option for Bill Payment Deletion", desc: "We have enhanced bill payment deletion. You can now retain the amount as a Vendor Credit by selecting the Dissociate and Add as Credit option." },
                  { date: "27 April 2026", title: "Set a Default Inventory Valuation Method for Items", desc: "You can now set a default inventory valuation method for items. The configured default is applied automatically during item creation." },
                  { date: "21 April 2026", title: "Enhancement in Report Filters", desc: "You can now use Advanced Filters in Reports to include child options for reporting tags, making data filtering easier." },
                ].map((update, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex flex-col items-center">
                       <div className="h-4 w-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                       <div className="flex-1 w-px bg-slate-200 mt-2" />
                    </div>
                    <div className="pb-12">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{update.date}</span>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2 mb-4 group-hover:text-indigo-600 transition-colors">{update.title}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{update.desc}</p>
                       <Button variant="outline" className="mt-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest px-6">Read More</Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Promo */}
          <section className="mt-20 py-16 bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
             <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div>
                   <h2 className="text-4xl font-black tracking-tight uppercase italic mb-6">Manage inventory <span className="text-indigo-400">on the go!</span></h2>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-md">Experience the ease of managing your inventory with the Protech mobile app for Android & iOS.</p>
                   <div className="flex flex-wrap gap-4">
                      <Button className="bg-white text-slate-900 font-black h-14 px-8 rounded-2xl flex items-center gap-3">
                         Google Play
                      </Button>
                      <Button className="bg-white text-slate-900 font-black h-14 px-8 rounded-2xl flex items-center gap-3">
                         <Smartphone className="h-5 w-5" />
                         App Store
                      </Button>
                   </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                   <div className="h-40 w-40 bg-white p-4 rounded-3xl mb-6 shadow-2xl">
                      <div className="h-full w-full bg-slate-100 rounded-xl grid grid-cols-4 grid-rows-4 gap-1 p-2">
                         {Array.from({ length: 16 }).map((_, i) => (
                           <div key={i} className={cn("rounded-sm", Math.random() > 0.5 ? "bg-slate-900" : "bg-transparent")} />
                         ))}
                      </div>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Scan to download</p>
                </div>
             </div>
          </section>

          <footer className="mt-20 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 mb-8">
             <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest">© 2026 PROTECH ASSIST (SL) LIMITED</p>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <p className="text-[10px] font-bold">All Rights Reserved</p>
             </div>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-indigo-600 transition-colors">Help Docs</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
