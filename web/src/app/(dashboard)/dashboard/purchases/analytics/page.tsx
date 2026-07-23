"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, ArrowLeft, BarChart3, PieChart, AlertTriangle, Building2,
  RefreshCw, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPurchaseAnalytics } from "@/lib/actions/supplier";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function PurchaseAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const result = await getPurchaseAnalytics();
      setData(result);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />)}
      </div>
    );
  }

  if (!data) return null;

  const maxSupplier = Math.max(...(data.topSuppliers || []).map((s: any) => s.total), 1);
  const maxCategory = Math.max(...(data.byCategory || []).map((c: any) => c.total), 1);
  const maxMonth = Math.max(...(data.monthlySpend || []).map((m: any) => m[1]), 1);

  const agingTotal = data.aging.current + data.aging.days30 + data.aging.days60 + data.aging.overdue60;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases/suppliers">
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Purchase Analytics</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.purchaseCount} total purchase orders</p>
            </div>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline" className="h-11 px-5 rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: `Le ${Math.round(data.totalSpend).toLocaleString()}`, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", icon: TrendingUp },
          { label: "Total Paid", value: `Le ${Math.round(data.totalPaid).toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: TrendingUp },
          { label: "Outstanding", value: `Le ${Math.round(data.totalOutstanding).toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", icon: AlertTriangle },
          { label: "Orders", value: data.purchaseCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", icon: BarChart3 },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", k.bg)}>
              <k.icon className={cn("h-6 w-6", k.color)} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
              <p className={cn("text-base font-black tracking-tight", k.color)}>{k.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Spend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-5 w-5 text-violet-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Monthly Spend (Last 6 Months)</h2>
          </div>
          <div className="space-y-3">
            {data.monthlySpend.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-8 uppercase tracking-widest text-xs">No data</p>
            ) : data.monthlySpend.map(([month, total]: [string, number], i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">Le {Math.round(total).toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(total / maxMonth) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payables Aging */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Payables Aging Analysis</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Current (Not Due)", value: data.aging.current, color: "bg-emerald-500", text: "text-emerald-600" },
              { label: "1–30 Days Overdue", value: data.aging.days30, color: "bg-amber-500", text: "text-amber-600" },
              { label: "31–60 Days Overdue", value: data.aging.days60, color: "bg-orange-500", text: "text-orange-600" },
              { label: "60+ Days Overdue", value: data.aging.overdue60, color: "bg-rose-600", text: "text-rose-600" },
            ].map((bucket, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{bucket.label}</span>
                  <span className={cn("text-[10px] font-black", bucket.text)}>Le {Math.round(bucket.value).toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: agingTotal > 0 ? `${(bucket.value / agingTotal) * 100}%` : "0%" }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className={cn("h-full rounded-full", bucket.color)}
                  />
                </div>
              </div>
            ))}
            {agingTotal === 0 && (
              <div className="text-center py-8">
                <p className="text-emerald-500 font-black text-sm uppercase tracking-widest">✓ All Payables Current</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Top Suppliers by Spend</h2>
          </div>
          <div className="space-y-3">
            {data.topSuppliers.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-8 uppercase tracking-widest text-xs">No data</p>
            ) : data.topSuppliers.map((s: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400">#{i + 1}</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{s.name}</span>
                    <span className="text-[9px] text-slate-400">({s.count} orders)</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600">Le {Math.round(s.total).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.total / maxSupplier) * 100}%` }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-5 w-5 text-teal-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Spend by Category</h2>
          </div>
          <div className="space-y-3">
            {data.byCategory.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-8 uppercase tracking-widest text-xs">No data</p>
            ) : data.byCategory.slice(0, 10).map((c: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{c.name}</span>
                  <span className="text-[10px] font-black text-teal-600">Le {Math.round(c.total).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.total / maxCategory) * 100}%` }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
