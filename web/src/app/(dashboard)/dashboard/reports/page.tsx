"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  FileText,
  CheckCircle2,
  Truck,
  Users,
  ArrowRight,
  ShieldCheck,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  getEnterpriseReport,
  ReportTimeframe,
  WeeklyPreset,
  MonthlyPreset,
  EnterpriseReportOptions,
  EnterpriseReportResult,
} from "@/lib/actions/enterprise-report";
import {
  exportMasterEnterpriseExcel,
  exportCategoryExcel,
} from "@/lib/utils/export-advanced-report";
import { getSales } from "@/lib/actions/sale";
import { getCurrentBusiness } from "@/lib/actions/business";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { PaymentStatusBadge } from "@/components/enterprise";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const reportCategories = [
  {
    key: "sales",
    icon: TrendingUp,
    title: "Sales Reports",
    color: "#2563EB",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    reports: [
      "Daily Sales Summary",
      "Monthly Sales Report",
      "Sales by Product",
      "Sales by Category",
      "Sales by Customer",
      "Sales by Staff",
    ],
  },
  {
    key: "inventory",
    icon: Package,
    title: "Inventory Reports",
    color: "#10B981",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    reports: [
      "Current Stock Level",
      "Stock Valuation",
      "Low Stock Report",
      "Expiry Report",
      "Dead Stock Report",
      "Stock Movement",
    ],
  },
  {
    key: "purchase",
    icon: Truck,
    title: "Purchase Reports",
    color: "#F59E0B",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    reports: [
      "Purchase History",
      "Supplier Summary",
      "Purchase by Product",
      "Pending Orders",
      "Payment Status",
    ],
  },
  {
    key: "customer",
    icon: Users,
    title: "Customer Reports",
    color: "#8B5CF6",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    reports: [
      "Customer List",
      "Customer Purchases",
      "Credit Report",
      "Top Customers",
      "Customer Activity",
    ],
  },
  {
    key: "financial",
    icon: DollarSign,
    title: "Financial Reports",
    color: "#EF4444",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    reports: [
      "Profit & Loss",
      "Income Statement",
      "Expense Report",
      "Cash Flow",
      "Balance Summary",
    ],
  },
  {
    key: "performance",
    icon: BarChart3,
    title: "Performance Reports",
    color: "#0EA5E9",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    reports: [
      "Product Performance",
      "Staff Performance",
      "Warehouse Report",
      "Business Overview",
      "Growth Analysis",
    ],
  },
];

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  // ── Period state ──────────────────────────────────────────────────────────
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("monthly");
  const [weeklyPreset, setWeeklyPreset] = useState<WeeklyPreset>("this-week");
  const [monthlyPreset, setMonthlyPreset] = useState<MonthlyPreset>("this-month");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [report, setReport] = useState<EnterpriseReportResult | null>(null);

  // Sub-breakdown tabs
  const [activeDetailTab, setActiveDetailTab] = useState<
    "interval" | "products" | "inventory" | "staff" | "payments"
  >("interval");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [sData, bData] = await Promise.all([
        getSales(),
        getCurrentBusiness(),
      ]);
      setSales(sData || []);
      setBusiness(bData || null);
    } catch {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }

  const fetchReport = useCallback(async () => {
    try {
      setReportLoading(true);
      const options: EnterpriseReportOptions = {
        timeframe,
        weeklyPreset,
        monthlyPreset,
        selectedMonth,
        selectedYear,
        customStart: timeframe === "custom" ? customStart : undefined,
        customEnd: timeframe === "custom" ? customEnd : undefined,
      };
      const r = await getEnterpriseReport(options);
      setReport(r);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  }, [timeframe, weeklyPreset, monthlyPreset, selectedMonth, selectedYear, customStart, customEnd]);

  useEffect(() => {
    if (timeframe !== "custom") {
      fetchReport();
    }
  }, [timeframe, weeklyPreset, monthlyPreset, selectedMonth, selectedYear]);

  async function handleExportExcel() {
    if (!report) return;
    try {
      setExporting(true);
      toast.info("Compiling multi-sheet Enterprise Excel report...");
      await exportMasterEnterpriseExcel(report);
      toast.success("Executive Excel report downloaded successfully!");
    } catch (err: any) {
      toast.error("Excel export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleCategoryExport(catKey: string, reportName?: string) {
    if (!report) return;
    try {
      toast.info(`Generating ${reportName || catKey} Excel export...`);
      await exportCategoryExcel(catKey, report);
      toast.success(`${reportName || catKey} exported to Excel!`);
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    }
  }

  const s = report?.summary;
  const currency = report?.currency || "Le";
  const paidSales = sales.filter((s: any) => s.paymentStatus === "PAID");
  const totalRevenue = paidSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const auditColumns = [
    {
      header: "Transaction Node",
      isMain: true,
      accessor: (sale: any) => (
        <div>
          <div className="font-black text-slate-800 dark:text-white text-sm">{sale.invoiceNumber}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {format(new Date(sale.createdAt), "HH:mm • MMM dd")}
          </div>
        </div>
      ),
    },
    {
      header: "Settlement Vector",
      isMeta: true,
      accessor: (sale: any) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-slate-300" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
            {sale.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      header: "Yield Value",
      accessor: (sale: any) => (
        <div className="font-[1000] text-primary">
          {currency} {Math.round(sale.totalAmount).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Audit Status",
      accessor: (sale: any) => <PaymentStatusBadge status={sale.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-24">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Executive Analytics & Financial Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            System Reports & Audit Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Advanced weekly & monthly profitability analytics, inventory valuations, and multi-sheet Excel exports for administration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 font-bold text-xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print PDF</span>
          </Button>

          {/* Master Admin Excel Export Button */}
          <Button
            onClick={handleExportExcel}
            disabled={!report || reportLoading || exporting}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
          >
            <FileSpreadsheet className={cn("h-4 w-4", exporting && "animate-spin")} />
            <span>{exporting ? "Generating Excel…" : "Export Master Excel (Admin)"}</span>
          </Button>

          <Button
            onClick={fetchReport}
            disabled={reportLoading}
            variant="outline"
            className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", reportLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Advanced Period Selector ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Report Mode:
            </span>
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setTimeframe("weekly")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                  timeframe === "weekly"
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Weekly Report
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                  timeframe === "monthly"
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Monthly Report
              </button>
              <button
                onClick={() => setTimeframe("custom")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                  timeframe === "custom"
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Custom Range
              </button>
            </div>
          </div>

          {report && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {report.periodLabel}
              </span>
            </div>
          )}
        </div>

        {/* Level 2 Sub-Presets */}
        {timeframe === "weekly" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Select Week:
            </span>
            {[
              { id: "this-week", label: "This Week (Current)" },
              { id: "last-week", label: "Last Week" },
              { id: "2-weeks-ago", label: "2 Weeks Ago" },
              { id: "3-weeks-ago", label: "3 Weeks Ago" },
              { id: "4-weeks-ago", label: "4 Weeks Ago" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setWeeklyPreset(p.id as WeeklyPreset)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold text-xs transition border",
                  weeklyPreset === p.id
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-black shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {timeframe === "monthly" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Month:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setMonthlyPreset("this-month")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold text-xs transition border",
                  monthlyPreset === "this-month"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-black shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                This Month (Current)
              </button>
              <button
                onClick={() => setMonthlyPreset("last-month")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold text-xs transition border",
                  monthlyPreset === "last-month"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-black shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                Last Month
              </button>
              <button
                onClick={() => setMonthlyPreset("custom-month")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold text-xs transition border",
                  monthlyPreset === "custom-month"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-black shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                Choose Month & Year
              </button>
            </div>

            {monthlyPreset === "custom-month" && (
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-2.5 font-bold"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-2.5 font-bold"
                >
                  {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(
                    (y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>
        )}

        {timeframe === "custom" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              From Date:
            </span>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-8 rounded-lg text-xs w-36"
            />
            <span className="text-slate-400 font-bold">To:</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-8 rounded-lg text-xs w-36"
            />
            <Button
              size="sm"
              onClick={fetchReport}
              disabled={!customStart || !customEnd || reportLoading}
              className="h-8 rounded-lg text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Apply Range
            </Button>
          </div>
        )}

        {/* Benchmark Growth Comparison Banner */}
        {s && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vs Previous Period:
            </span>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Revenue Growth:</span>
              <span
                className={cn(
                  "font-black font-mono flex items-center gap-0.5",
                  s.revenueGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {s.revenueGrowthPct >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {s.revenueGrowthPct >= 0 ? "+" : ""}
                {s.revenueGrowthPct}%
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Invoice Volume:</span>
              <span
                className={cn(
                  "font-black font-mono flex items-center gap-0.5",
                  s.transactionsGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {s.transactionsGrowthPct >= 0 ? "+" : ""}
                {s.transactionsGrowthPct}%
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Net Profit:</span>
              <span
                className={cn(
                  "font-black font-mono flex items-center gap-0.5",
                  s.netProfitGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {s.netProfitGrowthPct >= 0 ? "+" : ""}
                {s.netProfitGrowthPct}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Primary Executive KPI Cards ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Gross Sales Revenue",
            value: `${currency} ${Math.round(s?.totalRevenue ?? totalRevenue).toLocaleString()}`,
            sub: s ? `${s.grossMargin.toFixed(1)}% gross margin` : "All-time sales",
            icon: DollarSign,
            color: "#2563EB",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Cost of Goods (COGS)",
            value: `${currency} ${Math.round(s?.totalCOGS ?? 0).toLocaleString()}`,
            sub: "Direct product acquisition cost",
            icon: Package,
            color: "#EF4444",
            bg: "bg-rose-50 dark:bg-rose-950/30",
          },
          {
            label: "Net Operating Profit",
            value: `${currency} ${Math.round(s?.netProfit ?? 0).toLocaleString()}`,
            sub: s ? `${s.netMargin.toFixed(1)}% net yield margin` : "Revenue minus costs",
            icon: TrendingUp,
            color: "#10B981",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Transaction Velocity",
            value: `${(s?.totalTransactions ?? sales.length).toLocaleString()} Invoices`,
            sub: s ? `Avg: ${currency} ${Math.round(s.avgTransactionValue).toLocaleString()}` : `${paidSales.length} paid`,
            icon: ShoppingCart,
            color: "#0EA5E9",
            bg: "bg-sky-50 dark:bg-sky-950/30",
          },
        ].map((kpi, i) => (
          <div key={i} className="card p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", kpi.bg)}>
                <kpi.icon className="h-4.5 w-4.5" style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {kpi.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Secondary Operational Metrics ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Current Inventory Valuation",
            value: `${currency} ${Math.round(s?.totalStockCostValuation ?? 0).toLocaleString()}`,
            sub: `Retail: ${currency} ${Math.round(s?.totalStockRetailValuation ?? 0).toLocaleString()}`,
            icon: Package,
            color: "#8B5CF6",
            bg: "bg-purple-50 dark:bg-purple-950/30",
          },
          {
            label: "Operating Expenses (OpEx)",
            value: `${currency} ${Math.round(s?.totalExpenses ?? 0).toLocaleString()}`,
            sub: `${report?.expenseRows.length || 0} recorded expense entries`,
            icon: Wallet,
            color: "#F59E0B",
            bg: "bg-amber-50 dark:bg-amber-950/30",
          },
          {
            label: "NRA 15% GST Collected",
            value: `${currency} ${Math.round(s?.totalGST ?? 0).toLocaleString()}`,
            sub: `Taxable Base: ${currency} ${Math.round(s?.taxableBase ?? 0).toLocaleString()}`,
            icon: ShieldCheck,
            color: "#10B981",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Credit / Receivables",
            value: `${currency} ${Math.round(s?.totalCreditSales ?? 0).toLocaleString()}`,
            sub: "Unpaid customer invoice balances",
            icon: Clock,
            color: "#EF4444",
            bg: "bg-rose-50 dark:bg-rose-950/30",
          },
        ].map((kpi, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between shadow-xs border-dashed">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", kpi.bg)}>
                <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Visual Charts Grid ── */}
      {report && report.chartData.length > 0 && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                  Period Financial Trajectory (Revenue vs Net Profit)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daily revenue velocity plotted against operating costs and bottom-line margin.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {report.periodLabel}
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, ""]}
                    contentStyle={{ borderRadius: 12, fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Revenue"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    name="Net Profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNet)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                Payment Tender Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Cash, Mobile Money & Card breakdown</p>
            </div>
            <div className="space-y-3 pt-1">
              {report.paymentBreakdown.length > 0 ? (
                report.paymentBreakdown.map((p, idx) => (
                  <div key={p.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {p.method}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {currency} {Math.round(p.total).toLocaleString()} ({p.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(4, p.percentage))}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">No payments recorded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Breakdown Multi-Tab Analysis ── */}
      <div className="card overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              Detailed Operational Accounting Ledger
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Multi-dimensional ledger tables included in the executive Excel workbook.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveDetailTab("interval")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap",
                activeDetailTab === "interval"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {timeframe === "weekly" ? "Day-by-Day Schedule" : "Weekly Schedule"}
            </button>
            <button
              onClick={() => setActiveDetailTab("products")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap",
                activeDetailTab === "products"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Top Product Margins
            </button>
            <button
              onClick={() => setActiveDetailTab("inventory")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap",
                activeDetailTab === "inventory"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Inventory Valuation
            </button>
            <button
              onClick={() => setActiveDetailTab("staff")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap",
                activeDetailTab === "staff"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Staff Performance
            </button>
          </div>
        </div>

        {/* Tab 1: Interval Breakdown Table */}
        {activeDetailTab === "interval" && report && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Period / Day</th>
                  <th className="py-3 px-4 text-right">Invoices</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">COGS</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {report.intervalBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold font-sans text-slate-900 dark:text-white">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      {row.transactions}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {currency} {Math.round(row.revenue).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {currency} {Math.round(row.cogs).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-500">
                      {currency} {Math.round(row.expenses).toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-black",
                        row.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                      )}
                    >
                      {currency} {Math.round(row.netProfit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans font-bold text-slate-700 dark:text-slate-300">
                      {row.grossMargin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Top Products */}
        {activeDetailTab === "products" && report && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Units Sold</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">COGS</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {report.topProducts.slice(0, 10).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold font-sans text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {p.qtySold}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {currency} {Math.round(p.revenue).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {currency} {Math.round(p.cogs).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {currency} {Math.round(p.grossProfit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans font-bold text-slate-700 dark:text-slate-300">
                      {p.marginPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Inventory Valuation */}
        {activeDetailTab === "inventory" && report && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4 text-right">In Stock</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Valuation</th>
                  <th className="py-3 px-4 text-right">Retail Valuation</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {report.inventorySnapshot.slice(0, 12).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold font-sans text-slate-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.sku}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {item.currentStock}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {currency} {Math.round(item.costPrice).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {currency} {Math.round(item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {currency} {Math.round(item.costValuation).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {currency} {Math.round(item.retailValuation).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          item.status === "OUT_OF_STOCK"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                            : item.status === "LOW_STOCK"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        )}
                      >
                        {item.status === "OUT_OF_STOCK"
                          ? "Out of Stock"
                          : item.status === "LOW_STOCK"
                          ? "Low Stock"
                          : "Healthy"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Staff Performance */}
        {activeDetailTab === "staff" && report && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff / Cashier</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4 text-right">Invoices Handled</th>
                  <th className="py-3 px-4 text-right">Total Sales Yield</th>
                  <th className="py-3 px-4 text-right">Average Sale Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {report.staffPerformance.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold font-sans text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">{st.email}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {st.transactions}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-blue-600 dark:text-blue-400">
                      {currency} {Math.round(st.totalRevenue).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {currency} {Math.round(st.avgTransaction).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Interactive Report Categories (6 Cards with 1-Click Excel Download) ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-white">
            Pre-Built Audit Templates & Excel Exports
          </h2>
          <p className="text-xs text-slate-400">
            Click any template below to download its dedicated Microsoft Excel report.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reportCategories.map((cat) => (
            <div
              key={cat.title}
              className="card p-5 space-y-4 hover:shadow-md transition border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cat.bg)}>
                    <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                    <p className="text-[11px] text-slate-400">{cat.reports.length} report templates</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCategoryExport(cat.key, cat.title)}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  title="Download Category Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel
                </Button>
              </div>

              <div className="space-y-1">
                {cat.reports.map((r) => (
                  <div
                    key={r}
                    onClick={() => handleCategoryExport(cat.key, r)}
                    className="flex items-center justify-between py-2 px-2.5 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />
                      <span className="truncate">{r}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                        Export .xlsx
                      </span>
                      <Download className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NRA Fiscal Tax & Z-Report Card ── */}
      {(() => {
        const rawSettings = (business?.receiptSettings as any) || {};
        const tin = rawSettings.taxIdentificationNumber || business?.taxId || "1002934-8";
        const ecrId = rawSettings.nraDeviceId || "CIS-TNSD-001";
        const gstRate = rawSettings.gstRate ?? 15;
        const rateDecimal = gstRate / 100;
        const taxableBase = s ? s.taxableBase : totalRevenue / (1 + rateDecimal);
        const totalGstCollected = s ? s.totalGST : totalRevenue - taxableBase;

        return (
          <div className="card p-6 bg-gradient-to-br from-[#0F1E38] via-[#152747] to-[#0F1E38] text-white border-slate-800">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    NRA Fiscal & Tax Compliance (EBITAS / ECR Standard)
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight">
                  NRA 15% GST Collection & Fiscal Status
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Real-time GST calculation for National Revenue Authority compliance and monthly tax filing.
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                  <span>TIN: <b className="text-white">{tin}</b></span>
                  <span>•</span>
                  <span>CIS Device ID: <b className="text-white">{ecrId}</b></span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10 min-w-[140px]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300">Taxable Net Base</p>
                  <p className="text-base font-bold font-mono mt-0.5">Le {Math.round(taxableBase).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/20 rounded-xl p-3.5 border border-emerald-500/30 min-w-[140px]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">GST 15% Collected</p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">Le {Math.round(totalGstCollected).toLocaleString()}</p>
                </div>
                <Button
                  onClick={() => setIsZReportOpen(true)}
                  className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 shadow-md cursor-pointer w-full sm:w-auto"
                >
                  <Printer className="h-3.5 w-3.5" /> Print NRA Z-Report
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Session Audit Ledger ── */}
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Session Audit Ledger</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Raw transaction history for compliance & reconciliation
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportExcel}
            className="h-8 rounded-lg font-semibold text-[#2563EB] text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            Export Full Ledger &rarr;
          </Button>
        </div>
        <ResponsiveTable
          data={sales.slice(0, 8)}
          columns={auditColumns}
          loading={loading}
          emptyState={
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-400 text-xs font-medium">No transaction records found</p>
            </div>
          }
        />
      </div>

      {/* ── NRA Z-Report Modal ── */}
      <Dialog open={isZReportOpen} onOpenChange={setIsZReportOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 bg-white dark:bg-[#0F1E38] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">NRA EBITAS / ECR Compliance</span>
            </div>
            <DialogTitle className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Official Fiscal Z-Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              End-of-period tax collection & fiscal reconciliation
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const rawSettings = (business?.receiptSettings as any) || {};
            const tin = rawSettings.taxIdentificationNumber || business?.taxId || "1002934-8";
            const ecrId = rawSettings.nraDeviceId || "CIS-TNSD-001";
            const gstRate = rawSettings.gstRate ?? 15;
            const rateDecimal = gstRate / 100;
            const revForCalc = s?.totalRevenue ?? totalRevenue;
            const taxableBase = revForCalc / (1 + rateDecimal);
            const totalGstCollected = revForCalc - taxableBase;
            const paidSalesForBreak = s ? report?.paymentBreakdown || [] : [];
            const cashTotal =
              paidSalesForBreak.find((p) => p.method === "CASH")?.total ??
              paidSales.filter((s: any) => s.paymentMethod === "CASH").reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const momoTotal =
              paidSalesForBreak.filter((p) => ["MOBILE_MONEY", "ORANGE_MONEY", "AFRIMONEY"].includes(p.method)).reduce((sum, p) => sum + p.total, 0) ||
              paidSales.filter((s: any) => ["MOBILE_MONEY", "ORANGE_MONEY", "AFRIMONEY"].includes(s.paymentMethod)).reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const bankTotal =
              paidSalesForBreak.filter((p) => ["BANK_TRANSFER", "CARD", "CHEQUE"].includes(p.method)).reduce((sum, p) => sum + p.total, 0) ||
              paidSales.filter((s: any) => ["BANK_TRANSFER", "CARD", "CHEQUE"].includes(s.paymentMethod)).reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const zNum = `Z-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`;
            const periodLabel = report ? report.periodLabel : "Current Session";

            return (
              <div className="space-y-4 pt-2">
                <div id="nra-z-report-paper" className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl font-mono text-[11px] space-y-2 text-slate-900 dark:text-white">
                  <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-800 pb-2 space-y-0.5">
                    <p className="font-bold text-sm uppercase">{business?.name || "Enterprise OS"}</p>
                    <p className="text-[9px] text-slate-500">{business?.address || "Freetown, Sierra Leone"}</p>
                    <p className="text-[9px] font-semibold text-emerald-600 uppercase mt-1">*** NRA FISCAL Z-REPORT ***</p>
                    <p className="text-[9px] font-semibold">REPORT NO: {zNum}</p>
                    <p className="text-[9px] text-slate-500">PERIOD: {periodLabel}</p>
                    <p className="text-[9px] text-slate-500">PRINT DATE: {new Date().toLocaleString()}</p>
                  </div>
                  <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 dark:border-slate-800 pb-2">
                    <p>TAXPAYER TIN: <span className="font-bold">{tin}</span></p>
                    <p>ECR / CIS ID: <span className="font-bold">{ecrId}</span></p>
                    <p>OPERATIONAL SHIFT: <span className="font-bold">DAY CLOSE</span></p>
                    <p>TRANSACTIONS: <span className="font-bold">{s?.totalTransactions ?? paidSales.length} Transactions</span></p>
                  </div>
                  <div className="space-y-1 border-b border-dashed border-slate-300 dark:border-slate-800 pb-2">
                    <p className="font-semibold text-[10px] uppercase text-slate-500">TAX CATEGORY BREAKDOWN</p>
                    <div className="flex justify-between">
                      <span>Standard Rate A (15%):</span>
                      <span className="font-bold">Le {Math.round(taxableBase).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>GST (15%) Collected:</span>
                      <span>Le {Math.round(totalGstCollected).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Zero-Rated (0%):</span><span>Le 0</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Exempt (0%):</span><span>Le 0</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-b border-dashed border-slate-300 dark:border-slate-800 pb-2">
                    <p className="font-semibold text-[10px] uppercase text-slate-500">SETTLEMENT SUMMARY</p>
                    <div className="flex justify-between">
                      <span>CASH PAYMENTS:</span>
                      <span className="font-bold">Le {Math.round(cashTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MOBILE MONEY (ORANGE/AFRI):</span>
                      <span className="font-bold">Le {Math.round(momoTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BANK / CARD:</span>
                      <span className="font-bold">Le {Math.round(bankTotal).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-1">
                    <span>GROSS FISCAL TOTAL:</span>
                    <span className="text-[#2563EB] dark:text-blue-400 font-mono">
                      Le {Math.round(revForCalc).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 text-[8px] text-center text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-800 font-mono">
                    <p className="font-semibold">SDC FISCAL SIGNATURE</p>
                    <p className="break-all font-mono text-[7.5px]">SIG: 8E4A-21CD-98BF-44E1-NRA2026</p>
                    <p className="mt-0.5">NATIONAL REVENUE AUTHORITY • SIERRA LEONE</p>
                  </div>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsZReportOpen(false)}
                    className="flex-1 h-9 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 h-9 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Z-Report
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
