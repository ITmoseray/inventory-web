"use client";

import { useState, useEffect } from "react";
import {
  Search, History, ArrowUpRight, ArrowDownRight, RefreshCcw,
  ShoppingCart, Truck, AlertTriangle, Package, Clock, Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getStockMovements } from "@/lib/actions/stock";
import { cn, getIndustryColor } from "@/lib/utils";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/ModuleHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Movement = {
  id: string;
  quantity: number;
  type: string;
  reason: string | null;
  createdAt: string;
  product: { name: string; sku: string | null } | null;
  user: { name: string | null } | null;
};

export default function StockHistoryPage() {
  const { data: session } = useSession();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => { fetchMovements(); }, []);

  async function fetchMovements() {
    try {
      setLoading(true);
      const data = await getStockMovements();
      setMovements(data as Movement[]);
    } catch (error) {
      toast.error("Failed to load stock movements.");
    } finally {
      setLoading(false);
    }
  }

  const filteredMovements = movements.filter(m => {
    const productName = m.product?.name?.toLowerCase() || "";
    const sku = m.product?.sku?.toLowerCase() || "";
    const reason = m.reason?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    const matchesSearch = productName.includes(q) || sku.includes(q) || reason.includes(q);
    const matchesType = typeFilter === "ALL" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type: string) => {
    switch(type) {
      case "IN": return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case "OUT": return <ArrowDownRight className="h-4 w-4 text-rose-500" />;
      case "ADJUSTMENT": return <RefreshCcw className="h-4 w-4 text-amber-500" />;
      case "RETURN": return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      default: return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  const getSignedQty = (type: string, qty: number) => {
    if (type === "IN" || type === "RETURN") return `+${qty}`;
    if (type === "OUT") return `-${qty}`;
    return qty > 0 ? `+${qty}` : `${qty}`; // ADJUSTMENT uses raw value
  };

  const getQtyColor = (type: string) => {
    if (type === "IN" || type === "RETURN") return "text-emerald-600 dark:text-emerald-500";
    if (type === "OUT") return "text-rose-600 dark:text-rose-500";
    return "text-amber-600 dark:text-amber-500";
  };

  const getSourceIcon = (reason: string | null) => {
    if (!reason) return <AlertTriangle className="h-3.5 w-3.5" />;
    if (reason.includes("Sale")) return <ShoppingCart className="h-3.5 w-3.5" />;
    if (reason.includes("Purchase")) return <Truck className="h-3.5 w-3.5" />;
    return <AlertTriangle className="h-3.5 w-3.5" />;
  };

  const TYPE_BADGES: Record<string, string> = {
    IN: "bg-emerald-100 text-emerald-700",
    OUT: "bg-rose-100 text-rose-700",
    ADJUSTMENT: "bg-amber-100 text-amber-700",
    RETURN: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="relative min-h-full space-y-6 p-4 md:p-8 bg-slate-50/30 dark:bg-slate-950/50">
      <div className={cn("absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] dark:opacity-[0.03] pointer-events-none", colors.primary)} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Inventory Analytics</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">Live Ledger</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight">Movement Ledger</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em]">Trace every item lifecycle across your supply chain.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-[1000] text-slate-900 dark:text-white">{movements.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <Card className="flex-1 border-none shadow-sm bg-white dark:bg-slate-900 p-2 rounded-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search by product, SKU, or reason..."
              className="pl-11 h-11 rounded-xl border-none bg-slate-50 dark:bg-slate-800/50 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest">
            <Filter className="h-3.5 w-3.5 mr-2 text-slate-400" />
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="IN">Stock In</SelectItem>
            <SelectItem value="OUT">Stock Out</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
            <SelectItem value="RETURN">Returns</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2rem] border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800/50">
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em] pl-6">Timestamp</TableHead>
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Product</TableHead>
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Type</TableHead>
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Movement</TableHead>
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Source</TableHead>
                <TableHead className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-[0.2em] pr-6 text-right">Logged By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4,5,6].map(i => (
                  <TableRow key={i} className="border-slate-100 dark:border-slate-800/50">
                    {[1,2,3,4,5,6].map(j => (
                      <TableCell key={j} className="h-16">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-16 w-16 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <History className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Records Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredMovements.map((m, idx) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                      key={m.id}
                      className="border-slate-100 dark:border-slate-800/50 group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{format(new Date(m.createdAt), "MMM dd, yyyy")}</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="h-3 w-3" /> {format(new Date(m.createdAt), "hh:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-black text-slate-900 dark:text-white text-sm">{m.product?.name ?? "Unknown Product"}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {m.product?.sku ?? "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-0", TYPE_BADGES[m.type] || "bg-slate-100 text-slate-600")}>
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shadow-inner",
                            m.type === "IN" || m.type === "RETURN" ? "bg-emerald-500/10" : m.type === "OUT" ? "bg-rose-500/10" : "bg-amber-500/10"
                          )}>
                            {getMovementIcon(m.type)}
                          </div>
                          <span className={cn("font-[1000] text-lg leading-none tracking-tighter", getQtyColor(m.type))}>
                            {getSignedQty(m.type, m.quantity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 w-fit">
                          <div className="text-slate-400">{getSourceIcon(m.reason)}</div>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{m.reason || "System"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{m.user?.name ?? "System"}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified</span>
                          </div>
                          <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg", colors.primary)}>
                            {(m.user?.name ?? "S").charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && filteredMovements.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {filteredMovements.length} of {movements.length} records
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
