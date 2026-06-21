"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, RefreshCcw, ArrowUpRight, ArrowDownRight,
  Search, Package, Loader2, X, AlertCircle, TrendingUp, TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";
import { getStockMovements, adjustStock } from "@/lib/actions/stock";
import { getProducts } from "@/lib/actions/product";
import { motion } from "framer-motion";

type Movement = {
  id: string;
  quantity: number;
  type: string;
  reason: string | null;
  createdAt: string;
  product: { name: string; sku: string | null } | null;
  user: { name: string | null } | null;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stockQuantity: number;
};

const TYPE_BADGES: Record<string, string> = {
  IN:         "bg-emerald-100 text-emerald-700",
  OUT:        "bg-rose-100 text-rose-700",
  ADJUSTMENT: "bg-amber-100 text-amber-700",
  RETURN:     "bg-blue-100 text-blue-700",
};

export default function InventoryAdjustmentsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    productId: "",
    type: "ADJUSTMENT" as "IN" | "OUT" | "ADJUSTMENT" | "RETURN",
    quantity: "",
    reason: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const [movData, prodData] = await Promise.all([
        getStockMovements(),
        getProducts(),
      ]);
      setMovements(movData as Movement[]);
      setProducts(prodData as Product[]);
    } catch {
      toast.error("Failed to load adjustment data.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = movements.filter(m => {
    const name = m.product?.name?.toLowerCase() || "";
    const sku  = m.product?.sku?.toLowerCase()  || "";
    const reason = m.reason?.toLowerCase() || "";
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || sku.includes(q) || reason.includes(q);
    const matchType = typeFilter === "ALL" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIn   = movements.filter(m => m.type === "IN").reduce((s, m) => s + m.quantity, 0);
  const totalOut  = movements.filter(m => m.type === "OUT").reduce((s, m) => s + m.quantity, 0);
  const totalAdj  = movements.filter(m => m.type === "ADJUSTMENT").length;

  function resetForm() {
    setForm({ productId: "", type: "ADJUSTMENT", quantity: "", reason: "" });
  }

  function handleSubmit() {
    if (!form.productId) { toast.error("Please select a product."); return; }
    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty) || qty <= 0) { toast.error("Please enter a valid quantity."); return; }
    if (!form.reason.trim()) { toast.error("Please enter a reason for the adjustment."); return; }

    startTransition(async () => {
      try {
        await adjustStock({
          productId: form.productId,
          type: form.type,
          quantity: qty,
          reason: form.reason.trim(),
        });
        toast.success("Stock adjustment recorded successfully.");
        setOpen(false);
        resetForm();
        setLoading(true);
        await load();
      } catch (err: any) {
        toast.error(err?.message || "Failed to record adjustment.");
      }
    });
  }

  const selectedProduct = products.find(p => p.id === form.productId);

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic">
              Inventory <span className="text-indigo-600">Adjustments</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              Record stock corrections, additions, and removals.
            </p>
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setOpen(true); }}
          className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
        >
          <Plus className="mr-2 h-4 w-4" /> New Adjustment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Stock In", value: totalIn.toLocaleString(), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: <TrendingUp className="h-5 w-5 text-emerald-600" /> },
          { label: "Total Stock Out", value: totalOut.toLocaleString(), color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", icon: <TrendingDown className="h-5 w-5 text-rose-600" /> },
          { label: "Adjustments Made", value: totalAdj.toLocaleString(), color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", icon: <RefreshCcw className="h-5 w-5 text-amber-600" /> },
        ].map((card) => (
          <Card key={card.label} className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", card.bg)}>{card.icon}</div>
              <div>
                <p className={cn("text-2xl font-black", card.color)}>{loading ? "—" : card.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by product, SKU, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest shadow-sm">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="IN">Stock In</SelectItem>
            <SelectItem value="OUT">Stock Out</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
            <SelectItem value="RETURN">Returns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-black uppercase tracking-widest">Loading adjustments...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-6">Date</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Product</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Type</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Qty</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Reason</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pr-6">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <RefreshCcw className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        {search || typeFilter !== "ALL" ? "No matching records" : "No adjustments recorded yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{format(new Date(m.createdAt), "dd MMM yyyy")}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(m.createdAt), "hh:mm a")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Package className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{m.product?.name ?? "Unknown"}</span>
                          {m.product?.sku && <span className="text-[10px] text-slate-400">SKU: {m.product.sku}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-0", TYPE_BADGES[m.type] || "bg-slate-100 text-slate-600")}>
                        {m.type === "IN" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {m.type === "OUT" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {m.type === "ADJUSTMENT" && <RefreshCcw className="h-3 w-3 mr-1" />}
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-black text-base",
                        m.type === "IN" || m.type === "RETURN" ? "text-emerald-600" :
                        m.type === "OUT" ? "text-rose-600" : "text-amber-600"
                      )}>
                        {m.type === "IN" || m.type === "RETURN" ? "+" : "-"}{m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {m.reason || "—"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                        {m.user?.name ?? "System"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filtered.length} of {movements.length} records
            </p>
          </div>
        )}
      </Card>

      {/* New Adjustment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-indigo-500" /> Record Adjustment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Product <span className="text-rose-500">*</span></Label>
              <Select value={form.productId} onValueChange={(v) => setForm(f => ({ ...f, productId: v }))}>
                <SelectTrigger className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl dark:bg-slate-900">
                  {products.length === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-400">No products found</div>
                  ) : (
                    products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
                        {p.sku && <span className="text-slate-400 ml-2 text-xs">({p.sku})</span>}
                        <span className="text-slate-400 ml-2 text-xs">Stock: {p.stockQuantity}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                  Current stock: {selectedProduct.stockQuantity} units
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Adjustment Type <span className="text-rose-500">*</span></Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as any }))}>
                <SelectTrigger className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl dark:bg-slate-900">
                  <SelectItem value="ADJUSTMENT">⚖️ Adjustment (count correction)</SelectItem>
                  <SelectItem value="IN">📦 Stock In (received goods)</SelectItem>
                  <SelectItem value="OUT">📤 Stock Out (removed/damaged)</SelectItem>
                  <SelectItem value="RETURN">↩️ Return (customer return)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Quantity <span className="text-rose-500">*</span></Label>
              <Input
                type="number" min={1} placeholder="e.g. 10"
                value={form.quantity}
                onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {form.type === "OUT" && selectedProduct && form.quantity && (
                <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  parseInt(form.quantity) > selectedProduct.stockQuantity ? "text-rose-600" : "text-slate-400"
                )}>
                  <AlertCircle className="h-3 w-3" />
                  {parseInt(form.quantity) > selectedProduct.stockQuantity
                    ? `Warning: Exceeds current stock of ${selectedProduct.stockQuantity}`
                    : `Will reduce stock to ${selectedProduct.stockQuantity - parseInt(form.quantity)}`
                  }
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Reason <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="e.g. Physical count correction, damaged goods..."
                value={form.reason}
                onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={isPending} className="rounded-xl">
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg"
            >
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Plus className="mr-2 h-4 w-4" /> Record</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
