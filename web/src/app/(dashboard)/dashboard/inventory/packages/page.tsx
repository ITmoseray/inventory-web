"use client";

import { useState, useEffect } from "react";
import {
  Box, ArrowRight, ShoppingCart, Truck, CheckCircle2,
  Package, Search, FileText, Clock, RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";
import { getSales } from "@/lib/actions/sale";
import { toast } from "sonner";
import { format } from "date-fns";

type Sale = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  customerName: string;
  items: { id: string; name: string; quantity: number; unitPrice: number; total: number }[];
};

const STATUS_BADGES: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  PROCESSING:"bg-blue-100 text-blue-700",
  SHIPPED:   "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const PACKAGE_CYCLE = [
  { title: "Confirmed Order", icon: FileText, desc: "A package can only be created from a Confirmed sales order." },
  { title: "Pack Items",      icon: Box,      desc: "Select items and quantities to pack for the specific shipment." },
  { title: "Create Package",  icon: Package,  desc: "Generate a unique package slip and assign tracking information." },
  { title: "Ship & Track",    icon: Truck,    desc: "Hand over to carrier and monitor delivery status in real-time." },
];

export default function PackagesPage() {
  const router = useRouter();
  const [sales, setSales]         = useState<Sale[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [activeCycle, setActiveCycle] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data as Sale[]);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  const confirmed = sales.filter(s => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(s.status));
  const pending   = sales.filter(s => s.status === "PENDING" || s.status === "PENDING_APPROVAL");

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.invoiceNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || 
                        s.status === statusFilter || 
                        (statusFilter === "PENDING" && s.status === "PENDING_APPROVAL");
    return matchSearch && matchStatus;
  });

  const hasOrders = sales.length > 0;

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic">
              Order <span className="text-indigo-600">Packages</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              Pack and ship confirmed sales orders.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Life Cycle Steps */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-6">Life Cycle of a Package</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block" />
            {PACKAGE_CYCLE.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setActiveCycle(i)}
                  onClick={() => setActiveCycle(i)}
                  className={cn(
                    "relative z-10 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                    activeCycle === i ? "bg-white dark:bg-slate-800 border-indigo-600 shadow-lg" : "bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all",
                    activeCycle === i ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", activeCycle === i ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCycle}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="font-black text-indigo-600">Step {activeCycle + 1}:</span> {PACKAGE_CYCLE[activeCycle].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders",   value: sales.length,     color: "text-slate-800 dark:text-white", bg: "bg-slate-50 dark:bg-slate-800", icon: <ShoppingCart className="h-5 w-5 text-slate-600" /> },
          { label: "Ready to Pack",  value: confirmed.length, color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
          { label: "Awaiting Confirm", value: pending.length, color: "text-amber-700",   bg: "bg-amber-50 dark:bg-amber-900/20",   icon: <Clock className="h-5 w-5 text-amber-600" /> },
        ].map((card) => (
          <Card key={card.label} className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", card.bg)}>{card.icon}</div>
              <div>
                <p className={cn("text-2xl font-black", card.color)}>{loading ? "—" : card.value}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.label}</p>
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
            placeholder="Search by invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-12 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                statusFilter === s ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 shadow-sm"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest">Loading orders...</p>
        </div>
      ) : !hasOrders ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Box className="h-10 w-10 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No orders available</p>
            <p className="text-slate-400 text-xs mt-2">Create a sale order to begin packaging.</p>
          </div>
          <Button onClick={() => router.push("/dashboard/sales/orders")} className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest">
            <ArrowRight className="mr-2 h-4 w-4" /> Go to Sales Orders
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((sale, i) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col">
                  <CardHeader className="p-6 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-0", STATUS_BADGES[sale.status] || "bg-slate-100 text-slate-600")}>
                        {sale.status}
                      </Badge>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {format(new Date(sale.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors">
                      {sale.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-500">{sale.customerName}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 flex-1">
                    <div className="space-y-1.5 mb-4">
                      {sale.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[150px]">{item.name}</span>
                          <span className="font-black text-slate-800 dark:text-slate-200">x{item.quantity}</span>
                        </div>
                      ))}
                      {sale.items.length > 3 && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">+{sale.items.length - 3} more items</p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        <p className="text-lg font-[1000] text-slate-900 dark:text-white italic tracking-tighter">Le {Math.round(sale.totalAmount).toLocaleString()}</p>
                      </div>
                      <Button
                        onClick={() => router.push(`/dashboard/sales/orders`)}
                        size="sm"
                        className={cn(
                          "rounded-xl font-black text-[9px] uppercase tracking-widest transition-all group-hover:scale-105",
                          ["CONFIRMED", "PROCESSING"].includes(sale.status)
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {["CONFIRMED", "PROCESSING"].includes(sale.status) ? (
                          <><Package className="h-3 w-3 mr-1" /> Pack</>  
                        ) : sale.status === "SHIPPED" ? (
                          <><Truck className="h-3 w-3 mr-1" /> Track</>
                        ) : (
                          <>View <ArrowRight className="h-3 w-3 ml-1" /></>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Package className="h-10 w-10 opacity-30" />
              <p className="text-sm font-black uppercase tracking-widest">No orders match your filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
