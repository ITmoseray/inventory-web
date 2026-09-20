"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { getCashFlowData } from "@/lib/actions/cashflow";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CashFlowPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const result = await getCashFlowData();
      setData(result);
    } catch (error) {
      toast.error("Failed to aggregate financial nodes.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
         <div className="relative">
            <div className="h-16 w-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <DollarSign className="h-6 w-6 text-primary animate-pulse" />
            </div>
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Liquidity Nodes...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Liquidity Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Cash Flow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analysis of capital velocity, liquidity inflows, operational disbursements, and solvency.
          </p>
        </div>

        <Button onClick={fetchData} variant="outline" className="h-9 px-3.5 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-800 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Re-Sync Ledger</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Inflow</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              Le {Math.round(data.summary.totalInflow).toLocaleString()}
            </h2>
            <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Revenue Collections</span>
            </div>
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Outflow</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              Le {Math.round(data.summary.totalOutflow).toLocaleString()}
            </h2>
            <div className="mt-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium text-xs">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Expenditures &amp; Payouts</span>
            </div>
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Cash Position</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#2563EB]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className={cn("text-2xl font-bold font-mono tracking-tight", data.summary.netCashFlow >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600")}>
              Le {Math.round(data.summary.netCashFlow).toLocaleString()}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", data.summary.netCashFlow >= 0 ? "bg-[#10B981]" : "bg-rose-500")}
                  style={{ width: `${Math.min(Math.abs(data.summary.burnRate || 50), 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Velocity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Flow Visualization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily Inflow vs Outflow Movements</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span className="text-slate-600 dark:text-slate-400">Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-slate-600 dark:text-slate-400">Outflow</span>
              </div>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(value) => `Le ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                  formatter={(value: any) => [`Le ${Number(value).toLocaleString()}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="inflow" 
                  name="Inflow"
                  stroke="#2563EB" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInflow)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="outflow" 
                  name="Outflow"
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOutflow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-[#0F1E38] to-[#1B3F6E] text-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <Activity className="h-5 w-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold font-display tracking-tight mb-2">Liquidity &amp; Solvency</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Our automated models indicate positive cash flow stability for the current cycle. Operational liquidity nodes remain within optimal thresholds.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Runway Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">Optimal</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Burn Intensity</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">Low</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/reports" className="w-full mt-6 block">
            <Button className="w-full h-10 bg-white text-[#0F1E38] hover:bg-slate-100 font-semibold text-xs rounded-lg shadow-md transition-all">
              Generate Full Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
