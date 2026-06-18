"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, Store, Database, Users, TrendingUp, CreditCard, 
  ArrowRight, LayoutDashboard, PlusCircle, Package, Receipt, Bell
} from "lucide-react";
import { CountUp } from "@/components/shared/count-up";
import { NotificationBell } from "@/components/shared/notification-bell";

const gatewayActions = [
  { title: "Create Business Profile", icon: Building2, description: "Set up your digital footprint.", href: "/business-hub/onboarding" },
  { title: "Browse Marketplace", icon: Store, description: "Discover products nearby.", href: "/marketplace" },
  { title: "Sell Products", icon: PlusCircle, description: "List your inventory.", href: "/business-hub/products" },
  { title: "Manage Inventory", icon: Package, description: "Advanced stock management.", href: "/dashboard/inventory/overview" },
  { title: "Order History", icon: Receipt, description: "Track your sales records.", href: "/business-hub/orders" },
  { title: "Sales Analytics", icon: TrendingUp, description: "Track your growth.", href: "/business-hub/analytics" },
];

export default function BusinessHubGateway() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Business Hub <span className="text-indigo-600">Gateway</span></h1>
          <p className="text-slate-500 font-medium mt-2">Welcome back to your ecosystem dashboard.</p>
        </div>
        <div className="flex items-center gap-6">
          <NotificationBell />
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Back Home</Link>
        </div>
      </header>

      {/* Gateway Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto">
        {gatewayActions.map((action, index) => (
          <Link href={action.href} key={index}>
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                <action.icon className="w-24 h-24 -mr-8 -mt-8" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <action.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{action.description}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                Launch Module <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Preview Stats Section */}
      <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
            <TrendingUp className="text-indigo-600" />
            Sierra Leone Marketplace Preview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="text-4xl font-black text-indigo-600 tabular-nums">
                    <CountUp value={124} />
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Active Local Businesses</div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="text-4xl font-black text-indigo-600 tabular-nums">
                    <CountUp value={3450} />
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Products in Freetown</div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="text-4xl font-black text-indigo-600 tabular-nums">
                    <CountUp value={89} formatter={(v) => `${v}%`} />
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Verified Sellers</div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
