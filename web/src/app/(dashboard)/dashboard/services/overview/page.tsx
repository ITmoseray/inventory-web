"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign, Activity,
  Users, Star, Calendar, Clock, ArrowRight, Plus, BarChart3, Loader2
} from "lucide-react";
import { getServicesOverview } from "@/lib/actions/services-analytics";

function StatCard({ title, value, sub, icon: Icon, color, trend, trendLabel }: any) {
  return (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
          <p className="text-3xl font-[1000] text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-black ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend).toFixed(0)}% {trendLabel}
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ServicesOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicesOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `Le ${Number(n).toLocaleString()}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const monthTrend = data?.lastMonthRevenue > 0
    ? ((data.monthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100
    : null;

  const maxService = data?.topServices?.[0]?.revenue || 1;
  const maxStaff = data?.staffPerformance?.[0]?.revenue || 1;
  const maxDay = Math.max(...(data?.dailyTrend?.map((d: any) => d.revenue) || [1]));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Services Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time analytics for your service revenue</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/services/record"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            Record Fee
          </Link>
          <Link
            href="/dashboard/services"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Services
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={fmt(data?.totalRevenue || 0)}
          sub={`${data?.totalTransactions || 0} transactions`}
          icon={DollarSign}
          color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="This Month"
          value={fmt(data?.monthRevenue || 0)}
          sub={`${data?.monthTransactions || 0} services this month`}
          icon={Calendar}
          color="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600"
          trend={monthTrend}
          trendLabel="vs last month"
        />
        <StatCard
          title="This Week"
          value={fmt(data?.weekRevenue || 0)}
          sub="Last 7 days"
          icon={Activity}
          color="bg-violet-100 dark:bg-violet-500/10 text-violet-600"
        />
        <StatCard
          title="Avg Service Value"
          value={fmt(data?.avgServiceValue || 0)}
          sub="Per transaction"
          icon={TrendingUp}
          color="bg-amber-100 dark:bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Daily Revenue Chart (visual bar chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Daily Revenue — Last 7 Days
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">This Week</span>
        </div>
        <div className="flex items-end gap-3 h-40">
          {data?.dailyTrend?.map((d: any) => {
            const pct = maxDay > 0 ? (d.revenue / maxDay) * 100 : 0;
            const dayName = new Date(d.date).toLocaleDateString("en-GB", { weekday: "short" });
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] font-black text-slate-500">
                  {d.revenue > 0 ? `Le ${(d.revenue / 1000).toFixed(0)}k` : "—"}
                </span>
                <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-700"
                    style={{ height: `${Math.max(pct, d.revenue > 0 ? 6 : 2)}%` }}
                  />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Top Services by Revenue
            </h2>
          </div>
          {data?.topServices?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No service data yet.</p>
          ) : (
            <div className="space-y-4">
              {data?.topServices?.map((s: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        #{i + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">{fmt(s.revenue)}</p>
                      <p className="text-[10px] text-slate-400">{s.count} job{s.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <MiniBar value={s.revenue} max={maxService} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Staff / Technician Performance
            </h2>
          </div>
          {data?.staffPerformance?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No staff data yet.</p>
          ) : (
            <div className="space-y-4">
              {data?.staffPerformance?.map((s: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                        <span className="text-[9px] font-black text-indigo-600">{s.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-indigo-600">{fmt(s.revenue)}</p>
                      <p className="text-[10px] text-slate-400">{s.count} job{s.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <MiniBar value={s.revenue} max={maxStaff} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Service Transactions
          </h2>
          <Link href="/dashboard/sales/history" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Invoice</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentTransactions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No service transactions yet.</td>
                </tr>
              ) : data?.recentTransactions?.map((tx: any) => (
                <tr key={tx.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/invoice/${tx.id}`} className="font-mono text-[11px] font-black text-primary hover:underline">
                      {tx.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-800 dark:text-white text-xs">{tx.serviceName}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{tx.staff}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{tx.customer}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase">
                      {tx.paymentMethod?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-black text-emerald-600 text-sm">{fmt(tx.amount)}</td>
                  <td className="px-6 py-3 text-right text-[10px] text-slate-400 whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
