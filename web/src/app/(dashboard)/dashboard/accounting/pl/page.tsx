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
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Profit &amp; Loss Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Last {range} days · as of {format(new Date(), "dd MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card, i) => (
          <Card
            key={i}
            className={cn(
              "border rounded-3xl shadow-lg overflow-hidden",
              card.border
            )}
          >
            <CardContent className="p-5">
              <div className={cn("inline-flex p-2 rounded-xl mb-3", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                {card.title}
              </p>
              <p
                className={cn(
                  "text-2xl font-[900] tracking-tight",
                  card.value < 0 ? "text-rose-600" : "text-slate-900 dark:text-white"
                )}
              >
                Le {Math.round(Math.abs(card.value)).toLocaleString()}
                {card.value < 0 && (
                  <span className="text-sm font-bold ml-1">(Loss)</span>
                )}
              </p>
              {card.sub && (
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income Statement Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* P&L Statement */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-500" />
              Income Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-0">
            {[
              {
                label: "Revenue",
                value: data.totalRevenue,
                style: "font-bold text-slate-800 dark:text-slate-200",
                bg: "",
              },
              {
                label: "− Cost of Goods Sold (COGS)",
                value: -data.totalCOGS,
                style: "text-amber-700 dark:text-amber-400",
                bg: "",
              },
              {
                label: "Gross Profit",
                value: data.grossProfit,
                style: "font-black text-slate-900 dark:text-white",
                bg: "bg-slate-50 dark:bg-slate-800/60 rounded-xl",
                divider: true,
              },
              {
                label: "− Operating Expenses",
                value: -data.operatingExpenses,
                style: "text-rose-600 dark:text-rose-400",
                bg: "",
              },
              {
                label: "Net Profit",
                value: data.netProfit,
                style: cn(
                  "font-black text-lg",
                  data.netProfit >= 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-rose-600 dark:text-rose-400"
                ),
                bg: cn(
                  "rounded-xl",
                  data.netProfit >= 0
                    ? "bg-indigo-50 dark:bg-indigo-950/40"
                    : "bg-rose-50 dark:bg-rose-950/40"
                ),
                divider: true,
              },
            ].map((row, i) => (
              <div key={i}>
                {row.divider && (
                  <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
                )}
                <div
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3",
                    row.bg
                  )}
                >
                  <span className={cn("text-sm", row.style)}>{row.label}</span>
                  <span className={cn("text-sm tabular-nums", row.style)}>
                    {row.value < 0 ? "−" : ""} Le{" "}
                    {Math.round(Math.abs(row.value)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Margin Analysis */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Margin Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            {[
              {
                label: "Gross Margin",
                pct: Number(grossMarginPct),
                color: "bg-sky-500",
                trackColor: "bg-sky-100 dark:bg-sky-900/40",
              },
              {
                label: "Net Profit Margin",
                pct: Math.max(0, Number(marginPct)),
                color: data.netProfit >= 0 ? "bg-indigo-500" : "bg-rose-500",
                trackColor:
                  data.netProfit >= 0
                    ? "bg-indigo-100 dark:bg-indigo-900/40"
                    : "bg-rose-100 dark:bg-rose-900/40",
              },
              {
                label: "COGS as % of Revenue",
                pct:
                  data.totalRevenue > 0
                    ? Math.min(
                        100,
                        (data.totalCOGS / data.totalRevenue) * 100
                      )
                    : 0,
                color: "bg-amber-500",
                trackColor: "bg-amber-100 dark:bg-amber-900/40",
              },
            ].map((bar, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {bar.label}
                  </span>
                  <span className="font-black tabular-nums text-slate-900 dark:text-white">
                    {bar.pct.toFixed(1)}%
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2.5 rounded-full overflow-hidden",
                    bar.trackColor
                  )}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      bar.color
                    )}
                    style={{ width: `${Math.min(100, bar.pct)}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Quick stats */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Break-Even Sales",
                  value:
                    data.operatingExpenses > 0
                      ? `Le ${Math.round(data.totalCOGS + data.operatingExpenses).toLocaleString()}`
                      : "N/A",
                },
                {
                  label: "Products Sold",
                  value: productData.reduce((s, p) => s + p.quantity, 0),
                },
                {
                  label: "Avg Revenue/Product",
                  value:
                    productData.length > 0
                      ? `Le ${Math.round(data.totalRevenue / productData.length).toLocaleString()}`
                      : "N/A",
                },
                {
                  label: "Period",
                  value: "Last 30 days",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                    {stat.label}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Profitability Table */}
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" />
            Product Profitability
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-6">
          {productData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Package className="h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">
                No product sales found in this period.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Product
                  </TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Qty Sold
                  </TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Revenue
                  </TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400">
                    COGS
                  </TableHead>
                  <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Profit
                  </TableHead>
                  <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Margin
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productData.map((p) => {
                  const margin =
                    p.totalRevenue > 0
                      ? ((p.profit / p.totalRevenue) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <TableRow
                      key={p.id}
                      className="border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="pl-6 font-bold flex items-center gap-3 py-4">
                        <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                          <Package className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="text-slate-900 dark:text-white">
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-700 dark:text-slate-300">
                        {p.quantity}
                      </TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400 tabular-nums">
                        Le {Math.round(p.totalRevenue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-amber-600 dark:text-amber-400 tabular-nums font-medium">
                        Le {Math.round(p.totalCost).toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right pr-6 font-black tabular-nums",
                          p.profit >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        Le {Math.round(Math.abs(p.profit)).toLocaleString()}
                        {p.profit < 0 && (
                          <span className="text-xs ml-1">(Loss)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span
                          className={cn(
                            "text-xs font-black px-2 py-1 rounded-lg",
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
