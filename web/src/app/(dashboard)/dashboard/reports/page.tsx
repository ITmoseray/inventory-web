"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from "sonner";
import { getSales } from "@/lib/actions/sale";
import { getProducts } from "@/lib/actions/product";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

import { ResponsiveTable } from "@/components/shared/responsive-table";

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [sData, pData] = await Promise.all([
        getSales(),
        getProducts()
      ]);
      setSales(sData);
      setProducts(pData);
    } catch (error) {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }

  // Analytics Logic
  const paidSales = sales.filter((s: any) => s.paymentStatus === 'PAID');
  const totalRevenue = paidSales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  const analytics = paidSales.reduce((acc, sale) => {
    sale.items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      const cost = product?.costPrice || 0;
      acc.totalCost += (cost * item.quantity);
      
      if (!acc.productSales[item.productId]) {
        acc.productSales[item.productId] = { id: item.productId, name: product?.name || "Unknown", qty: 0, revenue: 0 };
      }
      acc.productSales[item.productId].qty += item.quantity;
      acc.productSales[item.productId].revenue += item.total;
    });
    return acc;
  }, { totalCost: 0, productSales: {} as any });

  const grossProfit = totalRevenue - analytics.totalCost;
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const topProducts = Object.values(analytics.productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  const chartData = sales.map(s => ({
    name: format(new Date(s.createdAt), "HH:mm"),
    revenue: s.totalAmount
  })).reverse();

  const auditColumns = [
    {
      header: "Transaction Node",
      isMain: true,
      accessor: (sale: any) => (
        <div>
           <div className="font-black text-slate-800 dark:text-white text-sm">{sale.invoiceNumber}</div>
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(sale.createdAt), "HH:mm • MMM dd")}</div>
        </div>
      )
    },
    {
      header: "Settlement Vector",
      isMeta: true,
      accessor: (sale: any) => (
        <div className="flex items-center gap-2">
           <DollarSign className="h-3 w-3 text-slate-300" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{sale.paymentMethod}</span>
        </div>
      )
    },
    {
      header: "Yield Value",
      accessor: (sale: any) => <div className="font-[1000] text-primary">Le {Math.round(sale.totalAmount).toLocaleString()}</div>
    },
    {
      header: "Audit Status",
      accessor: (sale: any) => (
        <div className="text-right lg:text-left">
           <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-100 dark:border-emerald-800/50">
              {sale.paymentStatus}
           </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-10 animate-in fade-in duration-700 pb-20 bg-slate-50/30 dark:bg-slate-950/50">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                 <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Analytics</span>
           </div>
           <h1 className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic">Strategic <span className="text-indigo-600">Intelligence</span></h1>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Deep-dive into your business profitability and sales velocity.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 gap-2 font-black uppercase text-[10px] tracking-widest bg-white dark:bg-slate-900 shadow-sm transition-all hover:scale-[1.02]">
              <Download className="h-4 w-4 text-indigo-600" /> Export PDF Vault
           </Button>
           <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-2">
              <Calendar className="h-4 w-4" /> Current Cycle
           </Button>
        </div>
      </div>

      {/* Primary KPIs Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Net Revenue Yield", value: totalRevenue, icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", sub: "+12.5% VS LAST CYCLE" },
          { label: "Cost of Goods (COGS)", value: analytics.totalCost, icon: Package, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", sub: "DIRECT ASSET EXPENSE" },
          { label: "Gross Profit Margin", value: grossProfit, icon: TrendingUp, color: "text-emerald-500", bg: "bg-slate-900 dark:bg-slate-950 dark:text-white", sub: `${margin.toFixed(1)}% EFFICIENCY`, isDark: true },
          { label: "Transaction Velocity", value: sales.length, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", sub: `AVG TICKET: Le ${Math.round(totalRevenue / (sales.length || 1)).toLocaleString()}`, noPrefix: true }
        ].map((kpi, i) => (
          <Card key={i} className={cn("border-none shadow-sm rounded-[2.5rem] overflow-hidden relative group", kpi.isDark ? "bg-slate-900 text-white dark:bg-slate-950 dark:text-white dark:border dark:border-slate-800" : "bg-white dark:bg-slate-900")}>
             <CardHeader className="p-6 sm:p-8 pb-2">
                <CardTitle className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", kpi.isDark ? "text-slate-400" : "text-slate-400")}>
                   <kpi.icon className={cn("h-3 w-3", kpi.color)} /> {kpi.label}
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 sm:p-8 pt-0">
                <div className="text-2xl sm:text-3xl font-[1000] tracking-tighter">
                  {kpi.noPrefix ? "" : "Le "}{Math.round(kpi.value as number).toLocaleString()}
                </div>
                <div className={cn("mt-4 text-[9px] font-black uppercase tracking-widest", kpi.isDark ? "text-emerald-400" : "text-emerald-500")}>
                   {kpi.sub}
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-7">
         {/* Sales Trend Chart */}
         <Card className="lg:col-span-4 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Sales Velocity Trend</CardTitle>
               <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Revenue trends over recent sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-8 pt-6">
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#0f172a', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                           itemStyle={{ fontWeight: 900, color: '#818cf8', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         {/* Top Products */}
         <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col">
            <CardHeader className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Node Ranking</CardTitle>
               <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Best performing inventory items</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
               <div className="space-y-8">
                  {topProducts.map((p: any, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xl shadow-black/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", COLORS[i % COLORS.length])}>
                              #{i+1}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight line-clamp-1">{p.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.qty} UNITS DISPATCHED</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(p.revenue).toLocaleString()}</div>
                           <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden shadow-inner ml-auto">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(p.revenue / (topProducts[0] as any).revenue) * 100}%` }}
                                 transition={{ duration: 1.5, delay: i * 0.1 }}
                                 className={cn("h-full rounded-full", COLORS[i % COLORS.length])} 
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Audit Log Preview */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-4 sm:px-0">
            <div>
               <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic">Session <span className="text-indigo-600">Log</span></h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Raw transaction history for compliance</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-indigo-600 text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">View Full Ledger</Button>
         </div>

         <ResponsiveTable 
            data={sales.slice(0, 8)}
            columns={auditColumns}
            loading={loading}
            emptyState={
               <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                     <BarChart3 className="h-8 w-8 text-slate-200 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Intelligence Entries Identified</p>
               </div>
            }
         />
      </div>
    </div>
  );
}
