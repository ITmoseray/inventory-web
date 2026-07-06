"use client";

import { useState, useEffect } from "react";
import { Search, BrainCircuit, AlertTriangle, TrendingDown, Info, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getPredictiveReplenishment } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";

export default function AIReplenishmentPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReplenishments();
  }, []);

  async function fetchReplenishments() {
    try {
      setLoading(true);
      const res = await getPredictiveReplenishment();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      toast.error("Failed to compile AI replenishment forecast.");
    } finally {
      setLoading(false);
    }
  }

  const filteredPredictions = data?.predictions?.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalReplenishCost = filteredPredictions
    .filter((p: any) => p.status !== "OK")
    .reduce((sum: number, p: any) => sum + p.estimatedCost, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
          AI Stock <span className="text-indigo-650 dark:text-indigo-400">Forecast</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Predictive restocking thresholds and velocity diagnostics.</p>
      </div>

      {/* AI Advisory Summary Alert */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-indigo-900 to-slate-950 text-white rounded-[2rem] overflow-hidden relative p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500/20 rounded-xl border border-indigo-400/20 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Advisory Node</span>
          </div>
          
          <h2 className="text-xl font-[1000] tracking-tight uppercase italic">Autonomous Replenishment Assessment</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            {loading ? "Analyzing historical trade ledger and SKU velocity..." : data?.aiAdvice}
          </p>

          {!loading && (
            <div className="flex gap-6 pt-4 border-t border-indigo-950">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Critical Stockouts</span>
                <span className="text-2xl font-[1000] text-rose-500 mt-1 block">
                  {data?.predictions?.filter((p: any) => p.status === "CRITICAL").length} SKUs
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Est. Restock Budget</span>
                <span className="text-2xl font-[1000] text-emerald-500 mt-1 block">
                  Le {Math.round(totalReplenishCost).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-3xl">
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
          <Input
            placeholder="Search forecast by SKU or name..."
            className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Predictions Table */}
      <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-850">
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Product Details</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Velocity (Sold/Day)</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Days Remaining</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Auto Recommendation</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pr-6">Est. Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-850">
                  <TableCell colSpan={6} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                </TableRow>
              ))
            ) : filteredPredictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold italic">
                  No prediction matrix compiled. Product records or sales required.
                </TableCell>
              </TableRow>
            ) : (
              filteredPredictions.map(pred => (
                <TableRow key={pred.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-850 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{pred.name}</span>
                      <span className="text-[10px] text-slate-450 font-bold uppercase">{pred.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-800 dark:text-slate-350">{pred.dailyVelocity} units/day</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-black text-sm",
                      pred.daysRemaining <= 7 ? "text-rose-500" :
                      pred.daysRemaining <= 15 ? "text-amber-500" : "text-slate-650 dark:text-slate-400"
                    )}>
                      {pred.daysRemaining === 999 ? "∞ (No sales)" : `${pred.daysRemaining} days left`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      pred.status === "CRITICAL" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                      pred.status === "WARNING" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {pred.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {pred.status !== "OK" ? (
                      <span className="flex items-center gap-1.5 font-bold text-xs text-indigo-650 dark:text-indigo-400">
                        <ShoppingCart className="h-3.5 w-3.5" /> Order +{pred.recommendedOrderQty} units
                      </span>
                    ) : (
                      <span className="text-slate-450 text-xs italic">Stock level stable</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6">
                    <span className="font-black text-sm text-slate-905 dark:text-slate-300">
                      {pred.recommendedOrderQty > 0 ? `Le ${Math.round(pred.estimatedCost).toLocaleString()}` : "-"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
