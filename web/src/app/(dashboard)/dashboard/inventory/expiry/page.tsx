"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Calendar, Search, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, addDays, isPast, isBefore, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { getExpiringBatches } from "@/lib/actions/stock";
import { BackButton } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Batch = {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string | null;
  product: { name: string; sku: string | null } | null;
};

export default function ExpiryTrackingPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EXPIRED" | "NEAR" | "SAFE">("ALL");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getExpiringBatches();
      setBatches(data as Batch[]);
    } catch {
      toast.error("Failed to load expiry tracking data");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const warningThreshold = addDays(today, 30);

  const getStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "NONE";
    const date = new Date(expiryDate);
    if (isPast(date)) return "EXPIRED";
    if (isBefore(date, warningThreshold)) return "NEAR";
    return "SAFE";
  };

  const STATUS_CONFIG = {
    EXPIRED: { label: "Expired", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", badgeBg: "bg-rose-100 text-rose-700", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    NEAR:    { label: "Near Expiry", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", badgeBg: "bg-amber-100 text-amber-700", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    SAFE:    { label: "Safe", color: "text-emerald-600", bg: "", badgeBg: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    NONE:    { label: "No Expiry", color: "text-slate-400", bg: "", badgeBg: "bg-slate-100 text-slate-500", icon: <Calendar className="h-3.5 w-3.5" /> },
  };

  const expiredCount = batches.filter(b => getStatus(b.expiryDate) === "EXPIRED").length;
  const nearCount    = batches.filter(b => getStatus(b.expiryDate) === "NEAR").length;
  const safeCount    = batches.filter(b => getStatus(b.expiryDate) === "SAFE").length;

  const filtered = batches.filter(b => {
    const productName = b.product?.name?.toLowerCase() || "";
    const sku = b.product?.sku?.toLowerCase() || "";
    const batchNum = b.batchNumber.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = productName.includes(q) || sku.includes(q) || batchNum.includes(q);
    const status = getStatus(b.expiryDate);
    const matchesFilter = statusFilter === "ALL" || status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic">Expiry <span className="text-rose-500">Tracking</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Monitor batch expiry dates across your inventory.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: "Expired", count: expiredCount, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", icon: <AlertTriangle className="h-5 w-5 text-rose-600" />, filter: "EXPIRED" as const },
          { label: "Near Expiry (30d)", count: nearCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, filter: "NEAR" as const },
          { label: "Safe", count: safeCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, filter: "SAFE" as const },
        ]).map((card) => (
          <motion.div key={card.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              onClick={() => setStatusFilter(statusFilter === card.filter ? "ALL" : card.filter)}
              className={cn(
                "p-5 rounded-3xl border-0 shadow-md cursor-pointer transition-all duration-300 bg-white dark:bg-slate-900",
                statusFilter === card.filter && card.bg
              )}
            >
              <CardContent className="p-0 flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", card.bg)}>{card.icon}</div>
                <div>
                  <p className={cn("text-2xl font-black", card.color)}>{loading ? "—" : card.count}</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by product, SKU, or batch number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-black uppercase tracking-widest">Loading expiry data...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-6">Product</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Batch #</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Qty</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Expiry Date</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Days Left</TableHead>
                <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Calendar className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        {search || statusFilter !== "ALL" ? "No matching batches" : "No batch expiry data found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((batch) => {
                  const status = getStatus(batch.expiryDate);
                  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                  const daysLeft = batch.expiryDate ? differenceInDays(new Date(batch.expiryDate), today) : null;
                  return (
                    <TableRow key={batch.id} className={cn("transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40", cfg.bg)}>
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{batch.product?.name ?? "Unknown Product"}</span>
                          {batch.product?.sku && <span className="text-[10px] text-slate-400">SKU: {batch.product.sku}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-indigo-600 dark:text-indigo-400 tracking-wide">{batch.batchNumber}</TableCell>
                      <TableCell className="font-bold text-slate-700 dark:text-slate-300">{batch.quantity.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                        {batch.expiryDate ? format(new Date(batch.expiryDate), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {daysLeft !== null ? (
                          <span className={cn("font-black text-sm", cfg.color)}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wide", cfg.badgeBg)}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {filtered.length} of {batches.length} batches
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
