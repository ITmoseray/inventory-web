"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TrendingUp, RefreshCw, ArrowUpRight, Coins, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSimpleReports } from "@/lib/actions/simple-sales";

export default function SimpleProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly");

  const loadReport = async (tf = timeframe) => {
    try {
      setLoading(true);
      const res = await getSimpleReports(tf);
      setReport(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load profit & loss statement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(timeframe);
  }, [timeframe]);

  const currency = report?.currency || "SLL";
  const s = report?.summary || { totalSales: 0, totalPurchases: 0, totalOtherIncome: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Coins className="w-3.5 h-3.5" /> Financial Accounting
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Profit &amp; Loss Statement</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated Gross and Net Income calculation breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
            {(["daily", "weekly", "monthly"] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timeframe === tf ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <Button onClick={() => loadReport(timeframe)} variant="outline" size="sm" className="rounded-xl border-white/20 text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="border-b pb-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black">{report?.businessName || "Business"} — Income Statement</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
              Period: {timeframe.toUpperCase()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl text-xs font-bold">
            Print P&amp;L
          </Button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Revenue */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white border-b pb-1">
              <span>Operating Revenue (Total Sales)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {currency} {s.totalSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pl-4">
              <span>Cost of Goods (Stock Purchases)</span>
              <span className="font-mono text-rose-500">- {currency} {s.totalPurchases.toLocaleString()}</span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="p-4 rounded-2xl bg-muted/40 border flex justify-between items-center font-black">
            <div>
              <span className="text-xs uppercase tracking-wider block text-muted-foreground">Gross Profit</span>
              <span className="text-[10px] text-muted-foreground font-normal">Formula: Total Sales - Total Purchases</span>
            </div>
            <span className={`text-lg font-mono ${s.grossProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
              {currency} {s.grossProfit.toLocaleString()}
            </span>
          </div>

          {/* Operating Overhead */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground pl-4">
              <span>Other Miscellaneous Income</span>
              <span className="font-mono text-emerald-600">+ {currency} {s.totalOtherIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pl-4">
              <span>Operating Expenses (Rent, Utilities, Fuel, etc.)</span>
              <span className="font-mono text-rose-500">- {currency} {s.totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex justify-between items-center font-black text-slate-900 dark:text-white mt-4">
            <div>
              <span className="text-sm uppercase tracking-wider block text-emerald-800 dark:text-emerald-300">
                Net Profit / (Loss)
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                Formula: Gross Profit + Other Income - Expenses
              </span>
            </div>
            <span className={`text-2xl font-mono ${s.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {currency} {s.netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
