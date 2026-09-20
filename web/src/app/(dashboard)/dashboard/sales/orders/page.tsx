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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
            <ShoppingCart size={20} />
          </div>
          <div>
            <DropdownMenu onOpenChange={(open) => !open && setViewSearch("")}>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 outline-none text-left">
                  <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-2">
                    {activeView.label}
                    <ChevronDown size={18} className="text-[#2563EB] group-hover:translate-y-0.5 transition-transform" />
                  </h1>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border border-[var(--border)] shadow-xl p-3 w-[calc(100vw-2rem)] sm:min-w-[280px] sm:w-auto bg-[var(--card)]" sideOffset={12}>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <input
                    placeholder="Search views..."
                    value={viewSearch}
                    onChange={(e) => setViewSearch(e.target.value)}
                    className="input-field pl-9 h-9 w-full text-xs"
                  />
                </div>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {filteredViews.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onClick={() => setViewFilter(view.id)}
                      className={cn(
                        "rounded-lg h-9 text-xs font-semibold px-3 cursor-pointer flex items-center justify-between",
                        viewFilter === view.id
                          ? "bg-[#2563EB] text-white"
                          : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleStar(e, view.id)}
                          className={cn(
                            "transition-all",
                            starredViews.includes(view.id) ? "text-amber-400" : "text-[var(--muted-foreground)]"
                          )}
                        >
                          <Star size={13} className={cn(starredViews.includes(view.id) && "fill-current")} />
                        </button>
                        <span>{view.label}</span>
                      </div>
                      {viewFilter === view.id && <CheckCircle2 size={14} />}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-xs text-[var(--muted-foreground)]">Track and manage customer orders through fulfillment</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/sales/orders/new")}
          className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-5"
        >
          <Plus size={15} /> New Order
        </button>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { label: "Total Orders", value: stats.total, icon: ShoppingCart, color: "#2563EB" },
            { label: "Pending Approval", value: stats.pending, icon: Clock, color: "#F59E0B" },
            { label: "Confirmed", value: stats.confirmed + stats.processing, icon: CheckCircle2, color: "#10B981" },
            { label: "Shipped", value: stats.shipped + stats.delivered, icon: Truck, color: "#0EA5E9" },
            { label: "Total Order Value", value: `NLe ${Math.round(stats.totalValue).toLocaleString()}`, icon: TrendingUp, color: "#8B5CF6" },
          ].map((card, i) => (
            <div key={i} className="kpi-card">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs text-[var(--muted-foreground)] font-medium">{card.label}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: card.color + "15", color: card.color }}
                >
                  <card.icon size={16} />
                </div>
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Bar & Filters ── */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <select
            value={filterRange}
            onChange={(e) => setFilterRange(e.target.value)}
            className="h-10 px-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5 flex-1 sm:flex-none justify-end">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              placeholder="Search by SO# or customer…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full text-xs font-medium"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center border transition-all shrink-0",
                  sortBy !== "date_desc"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[#2563EB]"
                )}
              >
                <ArrowUpDown size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-xl p-2 shadow-xl border border-[var(--border)] bg-[var(--card)]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">Date</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("date_desc")} className={cn("rounded-md text-xs font-medium cursor-pointer", sortBy === "date_desc" && "bg-[var(--muted)]")}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date_asc")} className={cn("rounded-md text-xs font-medium cursor-pointer", sortBy === "date_asc" && "bg-[var(--muted)]")}>Oldest First</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">Amount</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("amount_desc")} className={cn("rounded-md text-xs font-medium cursor-pointer", sortBy === "amount_desc" && "bg-[var(--muted)]")}>Highest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("amount_asc")} className={cn("rounded-md text-xs font-medium cursor-pointer", sortBy === "amount_asc" && "bg-[var(--muted)]")}>Lowest First</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">Customer</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("customer_az")} className={cn("rounded-md text-xs font-medium cursor-pointer", sortBy === "customer_az" && "bg-[var(--muted)]")}>Name (A–Z)</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filter */}
          <button
            onClick={() => setShowAdvanced(true)}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center border transition-all shrink-0",
              hasAdvancedFilters
                ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[#2563EB]"
            )}
          >
            <Filter size={15} />
          </button>
        </div>
      </div>

      {/* ── Main Orders Table ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3"><Checkbox className="rounded" /></th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Date</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Sales Order #</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Customer</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Items</th>
                <th className="text-center text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Payment Terms</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Delivery</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={9} className="px-4 py-6 text-center">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[var(--muted-foreground)]">
                    <Box size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">{activeView.empty}</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dashboard/sales/orders/${order.id}`)}
                      className="table-row-hover border-b border-[var(--border)] cursor-pointer text-xs"
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox className="rounded" />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                        {format(new Date(order.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                        {order.soNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[var(--foreground)]">{order.customerName}</div>
                        {order.customerEmail && (
                          <div className="text-[10px] text-[var(--muted-foreground)]">{order.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[var(--foreground)]">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn("status-badge", sc.bg, sc.color)}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                        {order.paymentTerms ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                        {order.deliveryMethod ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm text-[var(--foreground)]">
                        NLe {Math.round(Number(order.totalAmount)).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Count */}
        {!loading && filteredOrders.length > 0 && (
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
            Showing {filteredOrders.length} of {orders.length} sales orders
          </p>
        )}

      {/* ── Advanced Search Dialog ── */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-2xl border border-[var(--border)] shadow-2xl p-0 overflow-hidden bg-[var(--card)] text-[var(--foreground)]">
          <div className="bg-[#0B1629] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={100} /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Filter Options</div>
                <h3 className="text-xl font-extrabold font-display">Advanced Search</h3>
              </div>
              <button onClick={() => setShowAdvanced(false)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 bg-[var(--card)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 block">Sales Order #</label>
                <input value={filterSoNum} onChange={(e) => setFilterSoNum(e.target.value)} placeholder="e.g. SO-000001" className="input-field w-full text-xs font-medium" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 block">Customer Name</label>
                <input value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} placeholder="e.g. John Trading" className="input-field w-full text-xs font-medium" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 block">Min Amount (NLe)</label>
                <input type="number" value={filterMinAmt} onChange={(e) => setFilterMinAmt(e.target.value)} placeholder="0" className="input-field w-full text-xs font-medium font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 block">Max Amount (NLe)</label>
                <input type="number" value={filterMaxAmt} onChange={(e) => setFilterMaxAmt(e.target.value)} placeholder="999999" className="input-field w-full text-xs font-medium font-mono" />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3 bg-[var(--card)]">
            <button
              onClick={() => { setShowAdvanced(false); toast.success("Filters applied"); }}
              className="btn-primary flex-1 py-2.5 text-xs font-semibold"
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setFilterSoNum(""); setFilterCustomer(""); setFilterMinAmt(""); setFilterMaxAmt(""); setShowAdvanced(false); }}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
            >
              Reset
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
