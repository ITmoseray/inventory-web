"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  subDays,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subMonths,
  startOfDay, endOfDay,
  startOfYear, endOfYear,
} from "date-fns";
import { toast } from "sonner";
import {
  ShoppingCart, Plus, Search, Star, CheckCircle2, Box,
  Truck, FileText, Clock, ChevronDown, X, Activity,
  ArrowUpDown, Filter, Pencil, FileDown, Package2,
  TrendingUp, AlertCircle, CheckCheck, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getSalesOrders, getSalesOrderStats } from "@/lib/actions/sales-order";

// ── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:      { label: "Draft",      color: "text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800"   },
  PENDING:    { label: "Pending",    color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"  },
  CONFIRMED:  { label: "Confirmed",  color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"   },
  PROCESSING: { label: "Processing", color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40"},
  SHIPPED:    { label: "Shipped",    color: "text-cyan-600",    bg: "bg-cyan-50 dark:bg-cyan-950/40"   },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40"},
  COMPLETED:  { label: "Completed",  color: "text-emerald-700", bg: "bg-emerald-100 dark:bg-emerald-900/40"},
  CANCELLED:  { label: "Cancelled",  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/40"   },
};

const VIEWS = [
  { id: "all",        label: "All Sales Orders",     empty: "No sales orders found." },
  { id: "DRAFT",      label: "Draft",                empty: "No draft orders." },
  { id: "PENDING",    label: "Pending Approval",     empty: "No orders pending approval." },
  { id: "CONFIRMED",  label: "Confirmed",            empty: "No confirmed orders." },
  { id: "PROCESSING", label: "Processing",           empty: "No orders in processing." },
  { id: "SHIPPED",    label: "Shipped",              empty: "No shipped orders." },
  { id: "DELIVERED",  label: "Delivered",            empty: "No delivered orders." },
  { id: "COMPLETED",  label: "Completed",            empty: "No completed orders." },
  { id: "CANCELLED",  label: "Cancelled",            empty: "No cancelled orders." },
];

const RANGES = [
  { label: "Today",         value: "TODAY" },
  { label: "This Week",     value: "THIS_WEEK" },
  { label: "This Month",    value: "THIS_MONTH" },
  { label: "Last 3 Months", value: "LAST_3M" },
  { label: "This Year",     value: "THIS_YEAR" },
  { label: "All Time",      value: "ALL_TIME" },
];

function getRange(value: string) {
  const now = new Date();
  switch (value) {
    case "TODAY":     return { start: startOfDay(now),          end: endOfDay(now) };
    case "THIS_WEEK": return { start: startOfWeek(now),         end: endOfWeek(now) };
    case "THIS_MONTH":return { start: startOfMonth(now),        end: endOfMonth(now) };
    case "LAST_3M":   return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(now) };
    case "THIS_YEAR": return { start: startOfYear(now),         end: endOfYear(now) };
    default:          return undefined;
  }
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState("all");
  const [viewSearch, setViewSearch] = useState("");
  const [starredViews, setStarredViews] = useState<string[]>(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRange, setFilterRange] = useState("THIS_MONTH");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterSoNum, setFilterSoNum] = useState("");
  const [filterMinAmt, setFilterMinAmt] = useState("");
  const [filterMaxAmt, setFilterMaxAmt] = useState("");

  useEffect(() => { fetchData(); }, [filterRange]);

  async function fetchData() {
    try {
      setLoading(true);
      const range = getRange(filterRange);
      const [ordersData, statsData] = await Promise.all([
        getSalesOrders(range),
        getSalesOrderStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      toast.error("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredViews((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filteredViews = VIEWS.filter((v) =>
    v.label.toLowerCase().includes(viewSearch.toLowerCase())
  );

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (viewFilter !== "all" && o.status !== viewFilter) return false;
        const q = searchQuery.toLowerCase();
        if (q && !o.soNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
        if (filterSoNum && !o.soNumber.toLowerCase().includes(filterSoNum.toLowerCase())) return false;
        if (filterCustomer && !o.customerName.toLowerCase().includes(filterCustomer.toLowerCase())) return false;
        const amt = Number(o.totalAmount) || 0;
        if (filterMinAmt && amt < Number(filterMinAmt)) return false;
        if (filterMaxAmt && amt > Number(filterMaxAmt)) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_desc":  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "date_asc":   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "amount_desc":return Number(b.totalAmount) - Number(a.totalAmount);
          case "amount_asc": return Number(a.totalAmount) - Number(b.totalAmount);
          case "customer_az":return a.customerName.localeCompare(b.customerName);
          default:           return 0;
        }
      });
  }, [orders, viewFilter, searchQuery, filterSoNum, filterCustomer, filterMinAmt, filterMaxAmt, sortBy]);

  const activeView = VIEWS.find((v) => v.id === viewFilter) ?? VIEWS[0];
  const hasAdvancedFilters = !!(filterSoNum || filterCustomer || filterMinAmt || filterMaxAmt);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans pb-20">

      {/* ── Header ── */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-[50] backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-4 sm:gap-8 flex-1">
          <DropdownMenu onOpenChange={(open) => !open && setViewSearch("")}>
            <DropdownMenuTrigger
              render={
                <button className="group flex items-center gap-3 outline-none focus:outline-none text-left">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none flex items-center gap-3">
                      {activeView.label}
                      <ChevronDown className="h-5 w-5 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
                    </h1>
                  </div>
                </button>
              }
            />
            <DropdownMenuContent className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-2xl p-4 w-[calc(100vw-2rem)] sm:min-w-[320px] sm:w-auto bg-white dark:bg-slate-950 animate-in zoom-in-95 duration-200" sideOffset={20}>
              <div className="relative mb-4 px-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 dark:text-slate-500" />
                <Input
                  placeholder="Search views..."
                  value={viewSearch}
                  onChange={(e) => setViewSearch(e.target.value)}
                  className="h-10 pl-10 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest"
                />
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto px-1">
                {filteredViews.map((view) => (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => setViewFilter(view.id)}
                    className={cn(
                      "rounded-xl h-12 font-black uppercase tracking-widest text-[10px] px-4 cursor-pointer transition-all flex items-center justify-between group",
                      viewFilter === view.id
                        ? "bg-indigo-600 text-white shadow-xl"
                        : "text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => toggleStar(e, view.id)}
                        className={cn(
                          "transition-all",
                          starredViews.includes(view.id) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400"
                        )}
                      >
                        <Star className={cn("h-4 w-4", starredViews.includes(view.id) && "fill-current")} />
                      </button>
                      <span>{view.label}</span>
                    </div>
                    {viewFilter === view.id && <CheckCircle2 className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={() => router.push("/dashboard/sales/orders/new")}
          className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" /> New Order
        </Button>
      </header>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="px-4 sm:px-8 pt-4 sm:pt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Orders", value: stats.total,     icon: ShoppingCart, color: "text-slate-600 dark:text-slate-300",   bg: "bg-slate-50 dark:bg-slate-900" },
            { label: "Pending",      value: stats.pending,   icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Confirmed",    value: stats.confirmed + stats.processing, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Shipped",      value: stats.shipped + stats.delivered,    icon: Truck,        color: "text-cyan-600",  bg: "bg-cyan-50 dark:bg-cyan-950/30" },
            { label: "Total Value",  value: `NLe ${Math.round(stats.totalValue).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          ].map((card, i) => (
            <div key={i} className={cn("rounded-2xl p-5 flex flex-col gap-2 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all", card.bg)}>
              <card.icon className={cn("h-5 w-5", card.color)} />
              <span className="text-2xl font-[1000] tracking-tighter text-slate-900 dark:text-white">{card.value}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Table ── */}
      <div className="flex-1 px-4 sm:px-8 pb-8 space-y-5 mt-4">

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={filterRange} onValueChange={setFilterRange}>
              <SelectTrigger className="h-11 rounded-xl w-[160px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest text-slate-500 shadow-sm dark:text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="font-bold py-3 uppercase tracking-widest text-[10px] dark:text-slate-200 focus:dark:bg-slate-800 cursor-pointer">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
              <input
                placeholder="Search by SO# or customer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full sm:w-72 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-none text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
              />
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className={cn("h-11 w-11 p-0 rounded-xl flex-shrink-0", sortBy !== "date_desc" ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100" : "text-slate-400 hover:text-indigo-600")}>
                    <ArrowUpDown className="h-5 w-5" />
                  </Button>
                }
              />
              <DropdownMenuContent className="w-52 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Date</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy("date_desc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer dark:text-slate-200", sortBy === "date_desc" && "bg-slate-100 dark:bg-slate-800")}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("date_asc")}  className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer dark:text-slate-200", sortBy === "date_asc"  && "bg-slate-100 dark:bg-slate-800")}>Oldest First</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Amount</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy("amount_desc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer dark:text-slate-200", sortBy === "amount_desc" && "bg-slate-100 dark:bg-slate-800")}>Highest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("amount_asc")}  className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer dark:text-slate-200", sortBy === "amount_asc"  && "bg-slate-100 dark:bg-slate-800")}>Lowest First</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Customer</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy("customer_az")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer dark:text-slate-200", sortBy === "customer_az" && "bg-slate-100 dark:bg-slate-800")}>Name (A–Z)</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Advanced Filter */}
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(true)}
              className={cn("h-11 w-11 p-0 rounded-xl flex-shrink-0", hasAdvancedFilters ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100" : "text-slate-400 hover:text-indigo-600")}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[2rem] sm:rounded-[3rem] border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-x-auto w-full">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 h-16">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="w-[60px] pl-8"><Checkbox className="rounded-md border-slate-300" /></TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Date</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Sales Order #</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Customer</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Items</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Payment Terms</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Delivery</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-900 dark:text-white">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i} className="h-20 border-none">
                    {Array(9).fill(0).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-300 italic font-black uppercase text-[11px] tracking-[0.5em]">
                      <Box className="h-10 w-10 opacity-20" />
                      {activeView.empty}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => router.push(`/dashboard/sales/orders/${order.id}`)}
                      className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 border-none group transition-all cursor-pointer"
                    >
                      <TableCell className="pl-8" onClick={(e) => e.stopPropagation()}>
                        <Checkbox className="rounded-md border-slate-300" />
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="text-[11px] font-black text-slate-400 uppercase">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-[11px] tracking-widest uppercase italic">
                          {order.soNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white uppercase italic text-[11px] tracking-tight">
                            {order.customerName}
                          </span>
                          {order.customerEmail && (
                            <span className="text-[9px] text-slate-400 font-medium">{order.customerEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest", sc.bg, sc.color)}>
                          {sc.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {order.paymentTerms ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic">
                          {order.deliveryMethod ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span className="font-[1000] text-slate-900 dark:text-white tracking-tighter italic">
                          NLe {Math.round(Number(order.totalAmount)).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Count */}
        {!loading && filteredOrders.length > 0 && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
            Showing {filteredOrders.length} of {orders.length} sales orders
          </p>
        )}
      </div>

      {/* ── Advanced Search Dialog ── */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={120} /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Advanced</div>
                <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">Search Filter</h3>
              </div>
              <button onClick={() => setShowAdvanced(false)} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Sales Order #</Label>
                <Input value={filterSoNum} onChange={(e) => setFilterSoNum(e.target.value)} placeholder="e.g. SO-000001" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white" />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Customer Name</Label>
                <Input value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} placeholder="e.g. John Trading" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white" />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Min Amount (NLe)</Label>
                <Input type="number" value={filterMinAmt} onChange={(e) => setFilterMinAmt(e.target.value)} placeholder="0" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white" />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Max Amount (NLe)</Label>
                <Input type="number" value={filterMaxAmt} onChange={(e) => setFilterMaxAmt(e.target.value)} placeholder="999999" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white" />
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 flex gap-4 bg-white dark:bg-slate-950">
            <Button
              onClick={() => { setShowAdvanced(false); toast.success("Filters applied"); }}
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[11px] tracking-widest"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => { setFilterSoNum(""); setFilterCustomer(""); setFilterMinAmt(""); setFilterMaxAmt(""); setShowAdvanced(false); }}
              className="flex-1 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
