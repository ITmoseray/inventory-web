"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BrainCircuit, ShoppingCart, Package, X, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPredictiveReplenishment } from "@/lib/actions/ai";
import { createDraftPurchase } from "@/lib/actions/purchase";
import { getSuppliers } from "@/lib/actions/supplier";
import { cn } from "@/lib/utils";

export default function AIReplenishmentPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Order modal state
  const [selectedPred, setSelectedPred] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderQty, setOrderQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    fetchReplenishments();
    getSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  async function fetchReplenishments() {
    try {
      setLoading(true);
      const res = await getPredictiveReplenishment();
      if (res.success) setData(res);
    } catch {
      toast.error("Failed to compile AI replenishment forecast.");
    } finally {
      setLoading(false);
    }
  }

  function openOrderModal(pred: any) {
    setSelectedPred(pred);
    setOrderQty(String(pred.recommendedOrderQty > 0 ? pred.recommendedOrderQty : 1));
    setUnitCost(String(pred.costPrice || ""));
    setSupplierId("");
    setIsModalOpen(true);
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(orderQty);
    const cost = parseFloat(unitCost) || 0;
    if (!qty || qty <= 0) return toast.error("Enter a valid quantity");
    setIsOrdering(true);
    try {
      const res = await createDraftPurchase(selectedPred.id, qty, cost);
      if (res.success) {
        toast.success(`Draft Purchase Order created for ${qty}x ${selectedPred.name}!`);
        setIsModalOpen(false);
        router.push("/dashboard/purchases");
      }
    } catch {
      toast.error("Failed to create Draft PO. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  }

  const filteredPredictions = data?.predictions?.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const totalReplenishCost = filteredPredictions
    .filter((p: any) => p.status !== "OK")
    .reduce((sum: number, p: any) => sum + (p.estimatedCost || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
          AI Stock <span className="text-indigo-500 dark:text-indigo-400">Forecast</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Predictive restocking thresholds and velocity diagnostics.</p>
      </div>

      {/* AI Advisory Card */}
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
                  {data?.predictions?.filter((p: any) => p.status === "CRITICAL").length ?? 0} SKUs
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

      {/* Search */}
      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-3xl">
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search forecast by SKU or name..."
            className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Predictions Table */}
      <div className="rounded-[1.5rem] sm:rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Product</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Stock</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Velocity</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Days Left</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Suggested Qty</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                  <TableCell colSpan={7} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                </TableRow>
              ))
            ) : filteredPredictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Package className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No critical items detected</p>
                    <p className="text-slate-300 text-xs">All stock levels are within healthy ranges</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPredictions.map((pred: any) => (
                <TableRow
                  key={pred.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                  onClick={() => openOrderModal(pred)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{pred.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{pred.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-black text-sm",
                      pred.stockQuantity <= 0 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {pred.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">
                      {pred.dailyVelocity} / day
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-black text-sm",
                      pred.stockQuantity <= 0 ? "text-rose-600" :
                      pred.daysRemaining <= 7 ? "text-rose-500" :
                      pred.daysRemaining <= 15 ? "text-amber-500" : "text-slate-500"
                    )}>
                      {pred.stockQuantity <= 0
                        ? "Depleted"
                        : pred.daysRemaining === 999 ? "∞" : `${pred.daysRemaining}d`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                      pred.stockQuantity <= 0 ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse" :
                      pred.status === "CRITICAL" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600" :
                      pred.status === "WARNING" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" :
                      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                    )}>
                      {pred.stockQuantity <= 0 ? "DEPLETED" : pred.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {pred.recommendedOrderQty} units
                    </span>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Button
                      size="sm"
                      onClick={e => { e.stopPropagation(); openOrderModal(pred); }}
                      className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 rounded-xl whitespace-nowrap"
                    >
                      Order Now <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              Create Purchase Order
            </DialogTitle>
          </DialogHeader>

          {selectedPred && (
            <>
              {/* Product info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
                <p className="font-black text-slate-900 dark:text-white text-sm">{selectedPred.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {selectedPred.sku}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Current Stock</p>
                    <p className={cn("text-lg font-black", selectedPred.stockQuantity <= 0 ? "text-rose-600" : "text-slate-900 dark:text-white")}>
                      {selectedPred.stockQuantity <= 0 ? "OUT" : selectedPred.stockQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Daily Sales</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedPred.dailyVelocity}/day</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">AI Suggests</p>
                    <p className="text-lg font-black text-indigo-600">{selectedPred.recommendedOrderQty} units</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Order Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={orderQty}
                      onChange={e => setOrderQty(e.target.value)}
                      className="h-12 text-lg font-mono rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Unit Cost (Le)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitCost}
                      onChange={e => setUnitCost(e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-lg font-mono rounded-xl"
                    />
                  </div>
                </div>

                {/* Supplier (optional) */}
                {suppliers.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Supplier (Optional)</Label>
                    <select
                      value={supplierId}
                      onChange={e => setSupplierId(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                    >
                      <option value="">Select supplier...</option>
                      {suppliers.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Total estimate */}
                {orderQty && unitCost && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Estimated Total</p>
                    <p className="text-2xl font-black text-indigo-600">
                      Le {Math.round(parseInt(orderQty || "0") * parseFloat(unitCost || "0")).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isOrdering}
                    className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                  >
                    {isOrdering
                      ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating...</>
                      : <><ShoppingCart className="h-4 w-4" /> Create Draft PO</>
                    }
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
