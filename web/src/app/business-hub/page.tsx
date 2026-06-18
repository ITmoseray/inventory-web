"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, Store, Database, Users, TrendingUp, CreditCard, 
  ArrowRight, LayoutDashboard, PlusCircle, Package, Receipt 
} from "lucide-react";

const gatewayActions = [
  { title: "Create Business Profile", icon: Building2, description: "Set up your digital footprint.", href: "/business-hub/onboarding" },
  { title: "Browse Marketplace", icon: Store, description: "Discover products nearby.", href: "/business-hub/marketplace" },
  { title: "Sell Products", icon: PlusCircle, description: "List your inventory.", href: "/business-hub/sell" },
  { title: "Manage Inventory", icon: Package, description: "Sync with your OS.", href: "/dashboard/inventory" },
  { title: "Accept Payments", icon: CreditCard, description: "Enable local payments.", href: "/business-hub/payments" },
  { title: "Sales Analytics", icon: TrendingUp, description: "Track your growth.", href: "/business-hub/analytics" },
];

export default function BusinessHubGateway() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Business Hub <span className="text-indigo-600">Gateway</span></h1>
          <p className="text-slate-500 font-medium mt-2">Welcome back to your ecosystem dashboard.</p>
        </div>
        <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600">Back Home</Link>
      </header>

      {/* Gateway Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {gatewayActions.map((action, index) => (
          <Link href={action.href} key={index}>
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <action.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
              <p className="text-slate-500 leading-relaxed">{action.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Preview Stats Section */}
      <section className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black mb-8">Sierra Leone Marketplace Preview</h2>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">124</div>
                <div className="text-sm font-bold text-slate-600 mt-1">Active Local Businesses</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">3,450</div>
                <div className="text-sm font-bold text-slate-600 mt-1">Products in Freetown</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">89%</div>
                <div className="text-sm font-bold text-slate-600 mt-1">Verified Sellers</div>
            </div>
        </div>
      </section>
    </div>
  );
}
