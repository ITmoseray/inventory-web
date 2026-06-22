"use client";

import { useState } from "react";
import { 
  Settings, Search, X, Building, Users, ShieldCheck, 
  Globe, CreditCard, Layout, Zap, Bell, FileText, 
  ShoppingCart, Package, Truck, MessageSquare, Database, 
  Smartphone, Share2, Code2, Calculator, Percent, Clock,
  ArrowRight, Landmark, Briefcase, Plus, Menu, Sparkles,
  MapPin, Coins, Hash, Mail, Tag, Play, History, Box, 
  Wallet, Activity, Edit, Receipt, Undo, FileSpreadsheet,
  Layers, Scan, Terminal, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

const SETTINGS_GROUPS = [
  {
    title: "Organization Settings",
    icon: Building,
    items: [
      { name: "Organization Profile", icon: Building, url: "/dashboard/system/settings/business" },
      { name: "Branding", icon: Sparkles },
      { name: "Locations", icon: MapPin },
      { name: "AI Integration", icon: Zap },
      { name: "Manage Subscription", icon: CreditCard, url: "/dashboard/billing" }
    ]
  },
  {
    title: "Users & Roles",
    icon: Users,
    items: [
      { name: "Users", icon: Users, url: "/dashboard/staff/employees" },
      { name: "Roles", icon: ShieldCheck, url: "/dashboard/staff/roles" },
      { name: "User Preferences", icon: Settings, url: "/dashboard/system/profile" }
    ]
  },
  {
    title: "Taxes & Compliance",
    icon: Calculator,
    items: [
      { name: "Taxes", icon: Percent }
    ]
  },
  {
    title: "Setup & Configurations",
    icon: Layout,
    items: [
      { name: "General", icon: Globe },
      { name: "Currencies", icon: Coins },
      { name: "Payment Terms New", icon: Clock },
      { name: "Reminders", icon: Bell },
      { name: "Customer Portal", icon: Users },
      { name: "Vendor Portal", icon: Truck }
    ]
  },
  {
    title: "Customization",
    icon: Edit,
    items: [
      { name: "Transaction Number Series", icon: Hash },
      { name: "PDF Templates", icon: FileText },
      { name: "Email Notifications", icon: Mail },
      { name: "Reporting Tags", icon: Tag },
      { name: "Web Tabs", icon: Globe }
    ]
  },
  {
    title: "Automation",
    icon: Zap,
    items: [
      { name: "Workflow Rules", icon: Settings },
      { name: "Workflow Actions", icon: Play },
      { name: "Workflow Logs", icon: History },
      { name: "Schedules", icon: Calendar }
    ]
  },
  {
    title: "Module Settings",
    icon: Box,
    items: [
      { name: "Customers and Vendors", icon: Users, url: "/dashboard/customers" },
      { name: "Items & Inventory", icon: Package, url: "/dashboard/inventory/products" },
      { name: "Units of Measurement", icon: Layers },
      { name: "Inventory Adjustments", icon: Edit },
      { name: "Packages & Shipments", icon: Truck, url: "/dashboard/inventory/packages" },
      { name: "Online Payments", icon: CreditCard },
      { name: "Sales Orders & Invoices", icon: ShoppingCart, url: "/dashboard/sales/orders" },
      { name: "Sales Returns & Credits", icon: Undo, url: "/dashboard/sales/returns" },
      { name: "Purchases & Expenses", icon: Wallet, url: "/dashboard/purchases" },
      { name: "Custom Modules", icon: Layout }
    ]
  },
  {
    title: "Integrations & Marketplace",
    icon: Share2,
    items: [
      { name: "WhatsApp & SMS", icon: MessageSquare },
      { name: "Shipping Partners", icon: Truck },
      { name: "eCommerce & Shopping Cart", icon: ShoppingCart },
      { name: "Accounting Apps", icon: Calculator },
      { name: "Marketplace", icon: Globe }
    ]
  },
  {
    title: "Developer Space",
    icon: Code2,
    items: [
      { name: "Widgets & SDK", icon: Code2 },
      { name: "Incoming Webhooks", icon: Zap },
      { name: "API Usage", icon: Activity },
      { name: "Signals", icon: Bell }
    ]
  },
  {
    title: "Data Management",
    icon: Database,
    items: [
      { name: "Deluge Components Usage", icon: Terminal },
      { name: "Web Forms", icon: FileSpreadsheet },
      { name: "Audit Trail", icon: History, url: "/dashboard/system/logs" },
      { name: "Backup & Recovery", icon: Database }
    ]
  }
];

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = SETTINGS_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      
      {/* Settings Top Bar */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-[50] backdrop-blur-md bg-white/80">
         <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Settings className="h-5 w-5 text-white" />
               </div>
               <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-600">All Settings</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Enterprise Node</p>
               </div>
            </div>

            <div className="relative w-full max-w-xl group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search settings ( / )" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-xl border-none pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 transition-all"
               />
            </div>
         </div>

         <div className="flex items-center gap-6">
            <Link href="/dashboard">
               <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-50 transition-all">
                  <X className="h-4 w-4" /> Close Settings
               </Button>
            </Link>
         </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12">
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
            {filteredGroups.map((group, groupIdx) => (
              <motion.div 
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.05 }}
                className="space-y-8"
              >
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                       <group.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{group.title}</h3>
                 </div>

                 <div className="flex flex-col gap-1 pl-1">
                    {group.items.map((item: any, itemIdx) => {
                      const content = (
                         <>
                            <div className="flex items-center gap-4">
                               <item.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                               <span className="text-[11px] font-[1000] uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:text-white dark:group-hover:text-white transition-colors">{item.name}</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                         </>
                      );

                      if (item.url) {
                        return (
                          <Link 
                            key={item.name}
                            href={item.url}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-left"
                          >
                             {content}
                          </Link>
                        );
                      }

                      return (
                        <button 
                          key={item.name}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-left"
                        >
                           {content}
                        </button>
                      );
                    })}
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Extended Marketplace Promo */}
         <section className="mt-32 p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
               <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-center gap-3">
                     <Landmark className="h-6 w-6 text-indigo-400" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Marketplace Ecosystem</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                    Extend your Protech <br /><span className="text-indigo-400">Capabilities!</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md uppercase tracking-tight text-[12px]">
                    Connect your favorite apps and streamline your workflow with our extensive integration library.
                  </p>
                  <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 transition-all shadow-2xl">Explore Marketplace</Button>
               </div>
               
               <div className="flex flex-wrap gap-4 items-center justify-center p-6 lg:p-12 bg-white/5 rounded-3xl lg:rounded-[3rem] border border-white/10 backdrop-blur-xl">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-16 lg:h-20 w-24 lg:w-32 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                       <Plus className="h-5 w-5 lg:h-6 lg:w-6 text-slate-500" />
                    </div>
                  ))}
               </div>
            </div>
         </section>

         <footer className="mt-32 pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic">© 2026, Protech Assist (SL) Limited. Global Network Operations Center.</p>
         </footer>
      </main>

    </div>
  );
}
