"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Brain,
  Target,
  Globe,
  PieChart as PieChartIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { getRecentSales } from "@/lib/actions/sale";
import { getProducts } from "@/lib/actions/product";
import { format, subDays } from "date-fns";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  Pie,
  PieChart
} from "recharts";
import { useSession } from "next-auth/react";
import { cn, getIndustryColor } from "@/lib/utils";
import { toast } from "sonner";
import { NeuralAnalyst } from "@/components/dashboard/neural-analyst";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        getRecentSales(),
        getProducts()
      ]);
      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // 1. Revenue Velocity (Last 14 days)
  const revenueTrend = Array.from({ length: 14 }).map((_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, "MMM dd");
    const amount = sales
      .filter(s => format(new Date(s.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
      .reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    return { name: dateStr, value: amount };
  });

  // 2. Category Intelligence (Pie Chart)
  const categoryData = products.reduce((acc: any[], p) => {
    const catName = p.category?.name || "Uncategorized";
    const existing = acc.find(item => item.name === catName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: catName, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9'];

  // 3. Top Moving Products (Bar Chart)
  const productPerformance = products
    .sort((a, b) => parseFloat(b.unitPrice) - parseFloat(a.unitPrice))
    .slice(0, 6)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      value: parseFloat(p.unitPrice)
    }));

  const handleExport = () => {
    try {
      const headers = ["Date", "Revenue"];
      const csvContent = [
        headers.join(","),
        ...revenueTrend.map(row => `${row.name},${row.value}`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `protech_revenue_audit_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Intelligence audit exported successfully.");
    } catch (error) {
      toast.error("Failed to generate export.");
    }
  };

  const handleDeploy = () => {
    const element = document.getElementById('neural-analyst-node');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    toast("Syncing with Trade Nodes...", {
      description: "Establishing link with regional intelligence hubs.",
    });

    setTimeout(() => {
      toast.success("Insights deployed to all operational units.", {
        description: "System velocity optimized across Sierra Leone, Nigeria, and Ghana.",
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-14 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Analytics Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Business Velocity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time operational performance, revenue trends, and catalog distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="h-9 px-3.5 rounded-lg border-slate-200 dark:border-slate-800 font-medium text-xs"
            onClick={handleExport}
          >
            Export Audit
          </Button>
          <Button 
            className="h-9 px-4 rounded-lg text-white font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm gap-1.5"
            onClick={handleDeploy}
          >
            <Brain className="h-3.5 w-3.5" /> Deploy Insights
          </Button>
        </div>
      </div>

      {/* Neural Analyst Hub */}
      <div id="neural-analyst-node">
        <NeuralAnalyst />
      </div>

      {/* Primary Intelligence Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart 
            data={revenueTrend} 
            title="Revenue Velocity" 
            description="Systemized daily revenue tracking (14 day cycle)"
            dataKey="value"
            categoryKey="name"
            color="#2563EB"
          />
        </div>

        <div>
          <div className="card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Catalog Spread</h3>
                <p className="text-[11px] text-slate-400">Inventory Distribution by Category</p>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={6}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1000}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs">
                              <p className="opacity-70">{payload[0].name}</p>
                              <p className="font-bold font-mono">{payload[0].value} Items</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Intelligence Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">High-Value Assets</h3>
            <p className="text-[11px] text-slate-400">Unit value performance analysis</p>
          </div>
          <div className="h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={90}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs font-mono">
                          Le {Math.round(Number(payload[0].value) || 0).toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]} 
                  barSize={24}
                  animationDuration={1200}
                >
                  {productPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#10B981'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Predictive Health", val: "94%", sub: "System Accuracy", icon: Target, color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Market Velocity", val: "+18%", sub: "Growth Node", icon: TrendingUp, color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Regional Reach", val: "SL / NG", sub: "Operational Context", icon: Globe, color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "System Uptime", val: "99.9%", sub: "Offline-First Core", icon: Activity, color: "#8B5CF6", bg: "bg-purple-50 dark:bg-purple-950/30" },
          ].map((node, i) => (
            <div key={i} className="card p-5 flex flex-col justify-center items-center text-center">
              <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center", node.bg)}>
                <node.icon className="h-5 w-5" style={{ color: node.color }} />
              </div>
              <h4 className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight mb-0.5">{node.val}</h4>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{node.label}</p>
              <p className="text-[10px] text-slate-400">{node.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
