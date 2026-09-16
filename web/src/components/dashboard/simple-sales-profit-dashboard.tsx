"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  Plus, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BarChart3, 
  Coins, 
  Trash2, 
  Edit2, 
  Sparkles,
  Sliders,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  getSimpleDashboardMetrics, 
  recordSimpleDailyEntry, 
  deleteSimpleDailyEntry 
} from "@/lib/actions/simple-sales";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/utils";

export function SimpleSalesProfitDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    date: new Date().toISOString().split("T")[0],
    totalSales: "",
    totalPurchases: "",
    otherIncome: "",
    expenses: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getSimpleDashboardMetrics();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewEntry = () => {
    // If today already has an entry, pre-fill with today's figures for quick updating
    if (data?.today?.hasEntry) {
      setFormData({
        id: data.today.id || undefined,
        date: new Date().toISOString().split("T")[0],
        totalSales: String(data.today.sales || ""),
        totalPurchases: String(data.today.purchases || ""),
        otherIncome: String(data.today.otherIncome || ""),
        expenses: String(data.today.expenses || ""),
        notes: data.today.notes || ""
      });
    } else {
      setFormData({
        id: undefined,
        date: new Date().toISOString().split("T")[0],
        totalSales: "",
        totalPurchases: "",
        otherIncome: "",
        expenses: "",
        notes: ""
      });
    }
    setIsEntryModalOpen(true);
  };

  const openEditEntry = (entry: any) => {
    setFormData({
      id: entry.id,
      date: entry.date.split("T")[0],
      totalSales: String(entry.totalSales || ""),
      totalPurchases: String(entry.totalPurchases || ""),
      otherIncome: String(entry.otherIncome || ""),
      expenses: String(entry.expenses || ""),
      notes: entry.notes || ""
    });
    setIsEntryModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recordSimpleDailyEntry({
        id: formData.id,
        date: formData.date,
        totalSales: Number(formData.totalSales) || 0,
        totalPurchases: Number(formData.totalPurchases) || 0,
        otherIncome: Number(formData.otherIncome) || 0,
        expenses: Number(formData.expenses) || 0,
        notes: formData.notes
      });
      toast.success("Daily financial entry recorded successfully!");
      setIsEntryModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save daily entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this daily record?")) return;
    try {
      await deleteSimpleDailyEntry(id);
      toast.success("Daily record deleted.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    }
  };

  // Real-time live calculations for modal
  const numSales = Number(formData.totalSales) || 0;
  const numPurchases = Number(formData.totalPurchases) || 0;
  const numOtherIncome = Number(formData.otherIncome) || 0;
  const numExpenses = Number(formData.expenses) || 0;
  const liveGrossProfit = numSales - numPurchases;
  const liveNetProfit = liveGrossProfit + numOtherIncome - numExpenses;

  const currency = data?.currency || "SLL";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5" /> Simple Sales &amp; Profit Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{data?.businessName || "Business Dashboard"}</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Streamlined daily financial ledger. Record your daily total sales, stock purchases, and expenses to track live Gross &amp; Net Profit without per-item inventory overhead.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            onClick={openNewEntry}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/25 gap-2"
          >
            <Plus className="w-4 h-4" /> Record Today's Entry
          </Button>
        </div>
      </div>

      {/* Today's KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Sales */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Today's Sales</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {currency} {Number(data?.today?.sales || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Money received today</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Purchases */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Today's Stock</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {currency} {Number(data?.today?.purchases || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Purchases / restock cost</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Expenses */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Today's Expenses</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {currency} {Number(data?.today?.expenses || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Daily running overhead</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Gross Profit */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Gross Profit</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-black ${(data?.today?.grossProfit || 0) >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
                {currency} {Number(data?.today?.grossProfit || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sales minus Purchases</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Net Profit (Highlighted) */}
        <Card className="border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-md rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Today's Net Profit</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-black ${(data?.today?.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {currency} {Number(data?.today?.netProfit || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Gross + Income - Expenses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Quick Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Performance Trend Chart */}
        <Card className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
            <div>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> 7-Day Financial Trajectory
              </CardTitle>
              <CardDescription className="text-xs">
                Comparing Daily Sales, Restock Purchases, and Operating Expenses
              </CardDescription>
            </div>
            <Link href="/dashboard/simple-reports">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
                Full Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="h-64 w-full">
            {data?.trends && data.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, ""]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar dataKey="sales" name="Sales" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No recent entries recorded yet
              </div>
            )}
          </div>
        </Card>

        {/* Month Summary & Quick Links */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-border/50 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Month-To-Date Snapshot</span>
              <h3 className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                {format(new Date(), "MMMM yyyy")}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total Month Sales</span>
                <span className="font-bold text-slate-900 dark:text-white">{currency} {Number(data?.month?.sales || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total Month Purchases</span>
                <span className="font-bold text-slate-900 dark:text-white">{currency} {Number(data?.month?.purchases || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total Month Expenses</span>
                <span className="font-bold text-slate-900 dark:text-white">{currency} {Number(data?.month?.expenses || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Month Gross Profit</span>
                <span className={`font-black ${(data?.month?.grossProfit || 0) >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  {currency} {Number(data?.month?.grossProfit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-emerald-500/10 rounded-xl px-3 border border-emerald-500/20">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Month Net Profit</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {currency} {Number(data?.month?.netProfit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-border/60">
            <Link href="/dashboard/simple-profit-loss" className="w-full block">
              <Button variant="outline" className="w-full justify-between rounded-xl text-xs font-bold">
                <span>View Full Profit &amp; Loss</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/dashboard/simple-reports" className="w-full block">
              <Button variant="outline" className="w-full justify-between rounded-xl text-xs font-bold">
                <span>Export Financial Reports</span>
                <FileText className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Daily Entries Ledger */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="p-5 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black">Daily Financial Ledger</CardTitle>
            <CardDescription className="text-xs">
              Recorded daily sales, restock, expenses, and automated profit calculations.
            </CardDescription>
          </div>
          <Button
            onClick={openNewEntry}
            size="sm"
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.recentEntries || data.recentEntries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Coins className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No daily entries recorded yet</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click "+ Record Today's Entry" to log today's total sales, purchases, and expenses.
              </p>
              <Button onClick={openNewEntry} size="sm" className="rounded-xl mt-2 font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> Record First Entry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black border-b border-border/40">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Sales</th>
                    <th className="p-4">Purchases</th>
                    <th className="p-4">Expenses</th>
                    <th className="p-4">Gross Profit</th>
                    <th className="p-4">Net Profit</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.recentEntries.map((e: any) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {format(new Date(e.date), "dd MMM yyyy")}
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {currency} {Number(e.totalSales).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                        {currency} {Number(e.totalPurchases).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-rose-600 dark:text-rose-400">
                        {currency} {Number(e.expenses).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono font-semibold">
                        <span className={e.grossProfit >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600"}>
                          {currency} {Number(e.grossProfit).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black">
                        <span className={e.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}>
                          {currency} {Number(e.netProfit).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">
                        {e.notes || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditEntry(e)}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(e.id)}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Entry Modal */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-600" />
              {formData.id ? "Edit Daily Financial Record" : "Record Daily Financial Entry"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter your total financial summary for the day. Gross and Net Profit are calculated automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Entry Date *</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total Sales / Money In *</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.totalSales}
                  onChange={(e) => setFormData({ ...formData, totalSales: e.target.value })}
                  className="rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-amber-600 dark:text-amber-400">Total Stock / Purchases *</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.totalPurchases}
                  onChange={(e) => setFormData({ ...formData, totalPurchases: e.target.value })}
                  className="rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-rose-600 dark:text-rose-400">Operating Expenses *</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  className="rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Other Income (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.otherIncome}
                  onChange={(e) => setFormData({ ...formData, otherIncome: e.target.value })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Live Profit Calculation Preview */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Automated Calculation Preview
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">Gross Profit (Sales - Purchases)</span>
                  <span className={`font-mono font-black text-sm ${liveGrossProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    {currency} {liveGrossProfit.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground block text-[10px]">Net Profit (Gross + Other - Expenses)</span>
                  <span className={`font-mono font-black text-sm ${liveNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currency} {liveNetProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Notes / Comments (Optional)</Label>
              <Textarea
                placeholder="e.g. Good sales weekend, supplier restock on drinks, paid generator fuel..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEntryModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Saving Entry..." : formData.id ? "Update Entry" : "Save Daily Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
