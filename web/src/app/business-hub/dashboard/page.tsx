"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/components/providers/business-provider";
import Link from "next/link";
import { Package, Receipt, TrendingUp, ArrowRight } from "lucide-react";

export default function BusinessDashboard() {
  const { activeBusinessId } = useBusiness();

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function load() {
      if (!activeBusinessId) return;

      const res = await fetch(
        `/api/business/stats?businessId=${activeBusinessId}`
      );
      const data = await res.json();
      setStats(data);
    }

    load();
  }, [activeBusinessId]);

  return (
    <div className="p-6 md:p-12 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black tracking-tight">Business Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Products</p>
          <h2 className="text-3xl font-black mt-2">{stats.products}</h2>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Orders</p>
          <h2 className="text-3xl font-black mt-2">{stats.orders}</h2>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Revenue</p>
          <h2 className="text-3xl font-black mt-2">${stats.revenue}</h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/business-hub/products"
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all"
        >
          <Package className="h-4 w-4" /> Manage Products
        </Link>

        <Link
          href="/business-hub/orders"
          className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest hover:border-slate-900 transition-all"
        >
          <Receipt className="h-4 w-4" /> View Orders
        </Link>

        <Link
          href="/business-hub/analytics"
          className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest hover:border-slate-900 transition-all"
        >
          <TrendingUp className="h-4 w-4" /> Analytics
        </Link>
      </div>
    </div>
  );
}
