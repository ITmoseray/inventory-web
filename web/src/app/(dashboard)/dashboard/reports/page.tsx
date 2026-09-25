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
  EnterpriseReportResult,
} from "@/lib/actions/enterprise-report";
import { getSales } from "@/lib/actions/sale";
import { getCurrentBusiness } from "@/lib/actions/business";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import {
  PaymentStatusBadge,
} from "@/components/enterprise";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9"];

const reportCategories = [
  {
    icon: TrendingUp, title: "Sales Reports", color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/30",
    reports: ["Daily Sales Summary", "Monthly Sales Report", "Sales by Product", "Sales by Category", "Sales by Customer", "Sales by Staff"],
  },
  {
    icon: Package, title: "Inventory Reports", color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/30",
    reports: ["Current Stock Level", "Stock Valuation", "Low Stock Report", "Expiry Report", "Dead Stock Report", "Stock Movement"],
  },
  {
    icon: Truck, title: "Purchase Reports", color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/30",
    reports: ["Purchase History", "Supplier Summary", "Purchase by Product", "Pending Orders", "Payment Status"],
  },
  {
    icon: Users, title: "Customer Reports", color: "#8B5CF6", bg: "bg-purple-50 dark:bg-purple-950/30",
    reports: ["Customer List", "Customer Purchases", "Credit Report", "Top Customers", "Customer Activity"],
  },
  {
    icon: DollarSign, title: "Financial Reports", color: "#EF4444", bg: "bg-rose-50 dark:bg-rose-950/30",
    reports: ["Profit & Loss", "Income Statement", "Expense Report", "Cash Flow", "Balance Summary"],
  },
  {
    icon: BarChart3, title: "Performance Reports", color: "#0EA5E9", bg: "bg-sky-50 dark:bg-sky-950/30",
    reports: ["Product Performance", "Staff Performance", "Warehouse Report", "Business Overview", "Growth Analysis"],
  },
];

// ── Excel export helper (client-side, no server needed) ──────────────────────
async function exportToExcel(report: EnterpriseReportResult) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ─────────────────────────────────────────────────────
  const summaryData = [
    ["Enterprise Financial Report"],
    [`Business: ${report.businessName}`],
    [`Period: ${format(new Date(report.startDate), "MMM d, yyyy")} – ${format(new Date(report.endDate), "MMM d, yyyy")}`],
    [`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`],
    [],
    ["SUMMARY", ""],
    ["Total Revenue", report.summary.totalRevenue],
    ["Cost of Goods (COGS)", report.summary.totalCOGS],
    ["Gross Profit", report.summary.grossProfit],
    ["Gross Margin (%)", `${report.summary.grossMargin.toFixed(1)}%`],
    ["Total Expenses", report.summary.totalExpenses],
    ["Net Profit", report.summary.netProfit],
    ["Net Margin (%)", `${report.summary.netMargin.toFixed(1)}%`],
    ["Total Transactions", report.summary.totalTransactions],
    ["Avg Transaction Value", report.summary.avgTransactionValue],
    ["GST 15% Collected", report.summary.totalGST],
    ["Taxable Base", report.summary.taxableBase],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // ── Sheet 2: Sales Transactions ──────────────────────────────────────────
  const salesHeader = [
    "Invoice #", "Date & Time", "Customer", "Staff", "Payment Method", "Status", "Items", `Amount (${report.currency})`
  ];
  const salesData = [salesHeader, ...report.salesRows.map((r) => [
    r.invoiceNumber, r.date, r.customer, r.staff, r.paymentMethod, r.paymentStatus, r.items, r.totalAmount
  ])];
  const wsSales = XLSX.utils.aoa_to_sheet(salesData);
  wsSales["!cols"] = salesHeader.map((_, i) => ({ wch: i === 0 ? 22 : i === 1 ? 20 : 20 }));
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales Transactions");

  // ── Sheet 3: Purchases ───────────────────────────────────────────────────
  if (report.purchaseRows.length > 0) {
    const purchaseHeader = ["Invoice #", "Date & Time", "Supplier", "Items", `Amount (${report.currency})`];
    const purchaseData = [purchaseHeader, ...report.purchaseRows.map((r) => [
      r.invoiceNumber, r.date, r.supplier, r.items, r.totalAmount
    ])];
    const wsPurchases = XLSX.utils.aoa_to_sheet(purchaseData);
    wsPurchases["!cols"] = [{ wch: 22 }, { wch: 20 }, { wch: 24 }, { wch: 8 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsPurchases, "Purchases");
  }

  // ── Sheet 4: Expenses ────────────────────────────────────────────────────
  if (report.expenseRows.length > 0) {
    const expenseHeader = ["Description", "Category", "Date", `Amount (${report.currency})`, "Recorded By"];
    const expenseData = [expenseHeader, ...report.expenseRows.map((r) => [
      r.description, r.category, r.date, r.amount, r.recordedBy
    ])];
    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);
    wsExpenses["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");
  }

  // ── Sheet 5: Top Products ─────────────────────────────────────────────────
  if (report.topProducts.length > 0) {
    const prodHeader = ["Product Name", "Qty Sold", `Revenue (${report.currency})`];
    const prodData = [prodHeader, ...report.topProducts.map((p) => [p.name, p.qtySold, p.revenue])];
    const wsProd = XLSX.utils.aoa_to_sheet(prodData);
    wsProd["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsProd, "Top Products");
  }

  // ── Sheet 6: Payment Breakdown ────────────────────────────────────────────
  if (report.paymentBreakdown.length > 0) {
    const pyHeader = ["Payment Method", "Count", `Total (${report.currency})`];
    const pyData = [pyHeader, ...report.paymentBreakdown.map((p) => [p.method, p.count, p.total])];
    const wsPay = XLSX.utils.aoa_to_sheet(pyData);
    wsPay["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsPay, "Payment Breakdown");
  }

  // ── Sheet 7: Daily Chart Data ─────────────────────────────────────────────
  const chartHeader = ["Date", "Label", `Revenue (${report.currency})`, `COGS (${report.currency})`, `Expenses (${report.currency})`, `Gross Profit (${report.currency})`, `Net Profit (${report.currency})`, "Transactions"];
  const chartData = [chartHeader, ...report.chartData.map((d) => [
    d.date, d.label, d.revenue, d.cogs, d.expenses, d.grossProfit, d.netProfit, d.transactions
  ])];
  const wsChart = XLSX.utils.aoa_to_sheet(chartData);
  wsChart["!cols"] = chartHeader.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsChart, "Daily Data");

  // ── Write and download ────────────────────────────────────────────────────
  const period = `${format(new Date(report.startDate), "yyyy-MM-dd")}_to_${format(new Date(report.endDate), "yyyy-MM-dd")}`;
  XLSX.writeFile(wb, `Enterprise_Report_${period}.xlsx`);
}

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  // ── Period state ──────────────────────────────────────────────────────────
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [report, setReport] = useState<EnterpriseReportResult | null>(null);

  // ── Legacy KPI state (from getSales, still used for Z-Report) ────────────
  const [products, setProducts] = useState<any[]>([]);

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
      const r = await getEnterpriseReport(
        timeframe,
        timeframe === "custom"
          ? { start: customStart, end: customEnd }
          : undefined
      );
      setReport(r);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  }, [timeframe, customStart, customEnd]);

  useEffect(() => {
    if (timeframe !== "custom") {
      fetchReport();
    }
  }, [timeframe]);

  async function handleExportExcel() {
    if (!report) return;
    try {
      toast.info("Preparing Excel export…");
      await exportToExcel(report);
      toast.success("Excel report downloaded!");
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    }
  }

  // ── Legacy KPI values for quick header cards ──────────────────────────────
  const paidSales = sales.filter((s: any) => s.paymentStatus === "PAID");
  const totalRevenue = paidSales.reduce(
    (sum, s) => sum + s.totalAmount,
    0
  );

  const s = report?.summary;

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
          Le {Math.round(sale.totalAmount).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Audit Status",
      accessor: (sale: any) => <PaymentStatusBadge status={sale.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Executive Analytics & Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Reports Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate, analyze, and export executive business reports, NRA compliance, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 px-3.5 rounded-lg border-slate-200 dark:border-slate-800 gap-1.5 font-medium text-xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print PDF</span>
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={!report || reportLoading}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </Button>
          <Button
            onClick={fetchReport}
            disabled={reportLoading}
            className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", reportLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Period Selector ── */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Report Period:
          </span>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            {(["weekly", "monthly", "custom"] as ReportTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  timeframe === tf
                    ? "bg-[#2563EB] text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tf === "weekly" ? "This Week" : tf === "monthly" ? "This Month" : "Custom"}
              </button>
            ))}
          </div>

          {timeframe === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 rounded-lg text-xs w-36"
              />
              <span className="text-slate-400">to</span>
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
                Apply
              </Button>
            </div>
          )}

          {report && (
            <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">
              {format(new Date(report.startDate), "MMM d")} – {format(new Date(report.endDate), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Net Revenue Yield",
            value: `${report?.currency || "Le"} ${Math.round(s?.totalRevenue ?? totalRevenue).toLocaleString()}`,
            sub: s ? `${s.grossMargin.toFixed(1)}% gross margin` : "All-time sales",
            icon: DollarSign, color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Cost of Goods (COGS)",
            value: `${report?.currency || "Le"} ${Math.round(s?.totalCOGS ?? 0).toLocaleString()}`,
            sub: "Direct product cost",
            icon: Package, color: "#EF4444", bg: "bg-rose-50 dark:bg-rose-950/30",
          },
          {
            label: "Gross Profit",
            value: `${report?.currency || "Le"} ${Math.round(s?.grossProfit ?? 0).toLocaleString()}`,
            sub: s ? `Net: ${report?.currency} ${Math.round(s.netProfit).toLocaleString()}` : "Revenue minus COGS",
            icon: TrendingUp, color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Transaction Velocity",
            value: s?.totalTransactions ?? sales.length,
            sub: s ? `Avg: ${report?.currency} ${Math.round(s.avgTransactionValue).toLocaleString()}` : `${paidSales.length} paid`,
            icon: ShoppingCart, color: "#0EA5E9", bg: "bg-sky-50 dark:bg-sky-950/30",
          },
        ].map((kpi, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", kpi.bg)}>
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue + Net Profit Chart ── */}
      {report && report.chartData.length > 0 && (
        <div className="card p-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                {timeframe === "weekly" ? "Weekly" : timeframe === "monthly" ? "Monthly" : "Custom Period"} Revenue Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Revenue, COGS & Net Profit over the selected period
              </p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                  formatter={(v: any, name: string) => [`${report.currency} ${Number(v).toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Top Products + Payment Breakdown ── */}
      {report && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <div className="card p-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Top Performing Products</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Best items by revenue yield</p>
            </div>
            <div className="space-y-3">
              {report.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      #{i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.qtySold} units</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-slate-900 dark:text-white">
                      {report.currency} {Math.round(p.revenue).toLocaleString()}
                    </p>
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden ml-auto">
                      <div
                        style={{
                          width: `${Math.min(100, (p.revenue / (report.topProducts[0]?.revenue || 1)) * 100)}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="card p-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Payment Method Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Settlement vectors for the period</p>
            </div>
            <div className="h-[160px] w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.paymentBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.15)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                  />
                  <YAxis type="category" dataKey="method" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} width={80} />
                  <Tooltip
                    formatter={(v: any) => [`${report.currency} ${Number(v).toLocaleString()}`]}
                    contentStyle={{ borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card)" }}
                  />
                  <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
                    {report.paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {report.paymentBreakdown.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{p.method}</span>
                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {report.currency} {Math.round(p.total).toLocaleString()}
                    </span>
                    <span className="text-slate-400 ml-1.5">({p.count} txns)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Report Category Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCategories.map((cat) => (
          <div key={cat.title} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cat.bg)}>
                  <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white">{cat.title}</h3>
                  <p className="text-[11px] text-slate-400">{cat.reports.length} report templates</p>
                </div>
              </div>
              <div className="space-y-1">
                {cat.reports.map((r) => (
                  <div
                    key={r}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => toast.info(`Generating ${r}…`, { description: "Report export initialized." })}
                  >
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />
                      <span className="truncate">{r}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Download">
                        <Download className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Print">
                        <Printer className="h-3 w-3" />
                      </button>
                      <button className="p-1" style={{ color: cat.color }} title="View">
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
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
          <Button variant="ghost" size="sm" className="h-8 rounded-lg font-semibold text-[#2563EB] text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30">
            View Full Ledger
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
            const cashTotal = paidSalesForBreak.find((p) => p.method === "CASH")?.total ??
              paidSales.filter((s: any) => s.paymentMethod === "CASH").reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const momoTotal = paidSalesForBreak.filter((p) => ["MOBILE_MONEY","ORANGE_MONEY","AFRIMONEY"].includes(p.method)).reduce((sum, p) => sum + p.total, 0) ||
              paidSales.filter((s: any) => ["MOBILE_MONEY","ORANGE_MONEY","AFRIMONEY"].includes(s.paymentMethod)).reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const bankTotal = paidSalesForBreak.filter((p) => ["BANK_TRANSFER","CARD","CHEQUE"].includes(p.method)).reduce((sum, p) => sum + p.total, 0) ||
              paidSales.filter((s: any) => ["BANK_TRANSFER","CARD","CHEQUE"].includes(s.paymentMethod)).reduce((sum: number, s: any) => sum + s.totalAmount, 0);
            const zNum = `Z-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`;
            const periodLabel = report
              ? `${format(new Date(report.startDate), "MMM d")} – ${format(new Date(report.endDate), "MMM d, yyyy")}`
              : "Current Session";

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
