"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, RefreshCw, Calendar, Download, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSimpleReports } from "@/lib/actions/simple-sales";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function SimpleReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "custom">("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [report, setReport] = useState<any>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getSimpleReports(
        timeframe,
        timeframe === "custom" ? { start: customStart, end: customEnd } : undefined
      );
      setReport(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeframe !== "custom") {
      fetchReport();
    }
  }, [timeframe]);

  const currency = report?.currency || "SLL";
  const s = report?.summary || { totalSales: 0, totalPurchases: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0, count: 0 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Financial Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Executive Financial Reports</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Period performance, gross/net margins, and visual charts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.print()} variant="outline" size="sm" className="rounded-xl border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-1.5" /> Export / Print
          </Button>
          <Button onClick={fetchReport} variant="outline" size="sm" className="rounded-xl border-white/20 text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Custom Date Picker */}
      <Card className="rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="bg-muted p-1 rounded-xl flex gap-1">
            {(["daily", "weekly", "monthly", "custom"] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timeframe === tf ? 'bg-indigo-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {timeframe === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <Input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="h-8 rounded-lg text-xs"
              />
              <span>to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="h-8 rounded-lg text-xs"
              />
              <Button size="sm" onClick={fetchReport} className="h-8 rounded-lg text-xs font-bold">
                Apply
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Sales</span>
          <p className="text-lg font-black font-mono mt-1 text-indigo-600 dark:text-indigo-400">
            {currency} {s.totalSales.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Stock Purchases</span>
          <p className="text-lg font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
            {currency} {s.totalPurchases.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Expenses</span>
          <p className="text-lg font-black font-mono mt-1 text-rose-500">
            {currency} {s.totalExpenses.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Gross Profit</span>
          <p className={`text-lg font-black font-mono mt-1 ${s.grossProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
            {currency} {s.grossProfit.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Net Profit</span>
          <p className={`text-lg font-black font-mono mt-1 ${s.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {currency} {s.netProfit.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border bg-card">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Recorded Entries</span>
          <p className="text-lg font-black font-mono mt-1 text-slate-800 dark:text-white">
            {s.count} Days
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="rounded-2xl border bg-card p-6">
        <CardTitle className="text-base font-black mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" /> Revenue vs Restock vs Expenses Overview
        </CardTitle>
        <div className="h-72 w-full">
          {report?.chartData && report.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, ""]}
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="sales" name="Sales" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netProfit" name="Net Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No data available for this timeframe
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
