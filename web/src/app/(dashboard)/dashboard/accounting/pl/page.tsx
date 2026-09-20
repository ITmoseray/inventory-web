"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProfitLossData } from "@/lib/actions/pl";
import { getProductProfitability } from "@/lib/actions/product-pl";
import { subDays, format } from "date-fns";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnterprisePageHeader, EnterpriseKpiCard, EnterpriseCard, EnterpriseBadge } from "@/components/enterprise";

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [productData, setProductData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range] = useState(30); // days

  useEffect(() => {
    const end = new Date();
    const start = subDays(end, range);

    Promise.all([
      getProfitLossData(start, end),
      getProductProfitability(start, end),
    ])
      .then(([pl, products]) => {
        setData(pl);
        setProductData(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("P&L Fetch Error:", err);
        setError(
          "Failed to load financial data. Please ensure you have recorded sales and expenses."
        );
        setLoading(false);
      });
  }, [range]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  if (error || !data)
    return (
      <div className="p-20 text-center font-bold text-rose-500 bg-rose-50/50 rounded-3xl m-10 border border-rose-100">
        {error || "No data available"}
      </div>
    );

  const marginPct =
    data.totalRevenue > 0
      ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1)
      : "0.0";

  const grossMarginPct =
    data.totalRevenue > 0
      ? ((data.grossProfit / data.totalRevenue) * 100).toFixed(1)
      : "0.0";

  const summaryCards = [
    {
      title: "Total Revenue",
      value: data.totalRevenue,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-100 dark:border-emerald-900/40",
    },
    {
      title: "Cost of Goods Sold",
      value: data.totalCOGS,
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-100 dark:border-amber-900/40",
    },
    {
      title: "Gross Profit",
      value: data.grossProfit,
      sub: `${grossMarginPct}% margin`,
      icon: BarChart3,
      color: "text-sky-600",
      bg: "bg-sky-50 dark:bg-sky-950/30",
      border: "border-sky-100 dark:border-sky-900/40",
    },
    {
      title: "Operating Expenses",
      value: data.operatingExpenses,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-100 dark:border-rose-900/40",
    },
    {
      title: "Net Profit",
      value: data.netProfit,
      sub: `${marginPct}% net margin`,
      icon: DollarSign,
      color:
        data.netProfit >= 0
          ? "text-indigo-600"
          : "text-rose-600",
      bg:
        data.netProfit >= 0
          ? "bg-indigo-50 dark:bg-indigo-950/30"
          : "bg-rose-50 dark:bg-rose-950/30",
      border:
        data.netProfit >= 0
          ? "border-indigo-100 dark:border-indigo-900/40"
          : "border-rose-100 dark:border-rose-900/40",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Profit &amp; Loss Statement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accrual accounting overview for the last {range} days · as of {format(new Date(), "dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 px-3.5 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-800 gap-1.5" onClick={() => window.print()}>
            <Receipt className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Statement</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { title: "Total Revenue", value: Math.round(data.totalRevenue), sub: "Gross turnover", icon: TrendingUp, color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { title: "Cost of Goods (COGS)", value: Math.round(data.totalCOGS), sub: "Inventory cost", icon: ShoppingCart, color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { title: "Gross Profit", value: Math.round(data.grossProfit), sub: `${grossMarginPct}% gross margin`, icon: BarChart3, color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { title: "Operating Expenses", value: Math.round(data.operatingExpenses), sub: "Opex & overheads", icon: TrendingDown, color: "#EF4444", bg: "bg-rose-50 dark:bg-rose-950/30" },
          {
            title: "Net Profit",
            value: Math.round(data.netProfit),
            sub: `${marginPct}% net margin`,
            icon: DollarSign,
            color: data.netProfit >= 0 ? "#8B5CF6" : "#EF4444",
            bg: data.netProfit >= 0 ? "bg-purple-50 dark:bg-purple-950/30" : "bg-rose-50 dark:bg-rose-950/30"
          },
        ].map((kpi, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.title}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", kpi.bg)}>
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {kpi.value < 0 ? `-Le ${Math.abs(kpi.value).toLocaleString()}` : `Le ${kpi.value.toLocaleString()}`}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Income Statement & Margin Analysis Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* P&L Statement */}
        <div className="card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Income Statement</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Values in SLE</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {[
              { label: "Revenue (Turnover)", value: data.totalRevenue, bold: false, type: "revenue" },
              { label: "Cost of Goods Sold (COGS)", value: -data.totalCOGS, bold: false, type: "cost" },
              { label: "Gross Profit", value: data.grossProfit, bold: true, type: "gross", margin: `${grossMarginPct}%` },
              { label: "Operating Expenses (Opex)", value: -data.operatingExpenses, bold: false, type: "exp" },
              { label: "Net Operating Profit", value: data.netProfit, bold: true, type: "net", margin: `${marginPct}%` },
            ].map((row, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-lg my-1 transition-colors",
                  row.type === "gross" ? "bg-emerald-50/80 dark:bg-emerald-950/30 font-semibold" :
                  row.type === "net" ? "bg-blue-50/80 dark:bg-blue-950/30 font-semibold" :
                  "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs", row.bold ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                    {row.label}
                  </span>
                  {row.margin && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      {row.margin}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-mono tabular-nums",
                    row.type === "net" ? (data.netProfit >= 0 ? "text-[#2563EB] font-bold" : "text-rose-600 font-bold") :
                    row.type === "gross" ? "text-emerald-700 dark:text-emerald-400 font-bold" :
                    row.value < 0 ? "text-rose-600 dark:text-rose-400" :
                    "text-slate-900 dark:text-white"
                  )}
                >
                  {row.value < 0 ? `-Le ${Math.abs(row.value).toLocaleString()}` : `Le ${row.value.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Margin Analysis */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <BarChart3 className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Margin Analysis</h3>
            </div>
            <div className="space-y-4 mt-4">
              {[
                {
                  label: "Gross Margin",
                  pct: Number(grossMarginPct),
                  color: "bg-[#2563EB]",
                  trackColor: "bg-blue-50 dark:bg-blue-950/40",
                },
                {
                  label: "Net Profit Margin",
                  pct: Math.max(0, Number(marginPct)),
                  color: data.netProfit >= 0 ? "bg-[#10B981]" : "bg-rose-500",
                  trackColor: data.netProfit >= 0 ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40",
                },
                {
                  label: "COGS as % of Revenue",
                  pct: data.totalRevenue > 0 ? Math.min(100, (data.totalCOGS / data.totalRevenue) * 100) : 0,
                  color: "bg-[#F59E0B]",
                  trackColor: "bg-amber-50 dark:bg-amber-950/40",
                },
              ].map((bar, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">{bar.label}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{bar.pct.toFixed(1)}%</span>
                  </div>
                  <div className={cn("h-2 rounded-full overflow-hidden", bar.trackColor)}>
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", bar.color)}
                      style={{ width: `${Math.min(100, bar.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats bottom row */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                label: "Break-Even Sales",
                value: data.operatingExpenses > 0 ? `Le ${Math.round(data.totalCOGS + data.operatingExpenses).toLocaleString()}` : "N/A",
              },
              {
                label: "Units Sold",
                value: productData.reduce((s, p) => s + p.quantity, 0),
              },
              {
                label: "Avg Rev / Item",
                value: productData.length > 0 ? `Le ${Math.round(data.totalRevenue / productData.length).toLocaleString()}` : "N/A",
              },
              {
                label: "Reporting Period",
                value: "Last 30 Days",
              },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5">
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Profitability Table */}
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Product Profitability</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{productData.length} items sold</span>
        </div>
        <div>
          {productData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">No product sales recorded in this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800">
                    <TableHead className="pl-5 font-semibold text-xs text-slate-600 dark:text-slate-400">Product</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600 dark:text-slate-400">Qty Sold</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600 dark:text-slate-400">Revenue</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600 dark:text-slate-400">COGS</TableHead>
                    <TableHead className="text-right pr-5 font-semibold text-xs text-slate-600 dark:text-slate-400">Profit</TableHead>
                    <TableHead className="text-right pr-5 font-semibold text-xs text-slate-600 dark:text-slate-400">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productData.map((p) => {
                    const margin = p.totalRevenue > 0 ? ((p.profit / p.totalRevenue) * 100).toFixed(1) : "0.0";
                    return (
                      <TableRow
                        key={p.id}
                        className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <TableCell className="pl-5 font-medium text-xs text-slate-900 dark:text-white py-3">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                          {p.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                          Le {Math.round(p.totalRevenue).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400">
                          Le {Math.round(p.totalCost).toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right pr-5 font-mono text-xs font-semibold",
                            p.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          Le {Math.round(Math.abs(p.profit)).toLocaleString()}
                          {p.profit < 0 && <span className="text-[10px] ml-1">(Loss)</span>}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <span
                            className={cn(
                              "text-[10px] font-semibold font-mono px-2 py-0.5 rounded",
                              p.profit >= 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            )}
                          >
                            {margin}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
