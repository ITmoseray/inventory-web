"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileText, Plus, Search, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Send, Ban, ArrowRightLeft, MoreHorizontal, FileCheck, X
} from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getQuotes, updateQuoteStatus } from "@/lib/actions/quotes";
import { format, isAfter } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const STATUS_FILTERS = ["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_CONFIG: Record<string, { label: string; icon: any; cls: string; dot: string }> = {
  DRAFT:     { label: "Draft",     icon: FileText,       cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",               dot: "bg-slate-400" },
  SENT:      { label: "Sent",      icon: Send,           cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",            dot: "bg-amber-400" },
  ACCEPTED:  { label: "Accepted",  icon: CheckCircle2,   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",    dot: "bg-emerald-500" },
  REJECTED:  { label: "Rejected",  icon: Ban,            cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",               dot: "bg-rose-500" },
  CONVERTED: { label: "Converted", icon: ArrowRightLeft, cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",       dot: "bg-indigo-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  useEffect(() => { loadQuotes(); }, []);

  async function loadQuotes() {
    try {
      setLoading(true);
      const res = await getQuotes();
      if (res.success) setQuotes(res.quotes);
      else toast.error(res.error || "Failed to load quotes");
    } catch { toast.error("Failed to load quotes"); }
    finally { setLoading(false); }
  }

  async function handleStatusUpdate(id: string, newStatus: string) {
    const res = await updateQuoteStatus(id, newStatus as any);
    if (res.success) {
      toast.success(`Quote marked as ${newStatus.toLowerCase()}`);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    } else {
      toast.error(res.error || "Failed to update status");
    }
  }

  const stats = useMemo(() => ({
    total: quotes.length,
    draft: quotes.filter(q => q.status === "DRAFT").length,
    sent: quotes.filter(q => q.status === "SENT").length,
    accepted: quotes.filter(q => q.status === "ACCEPTED").length,
    converted: quotes.filter(q => q.status === "CONVERTED").length,
    totalValue: quotes.reduce((s, q) => s + Number(q.totalAmount), 0),
    acceptedValue: quotes.filter(q => q.status === "ACCEPTED" || q.status === "CONVERTED")
      .reduce((s, q) => s + Number(q.totalAmount), 0),
    conversionRate: quotes.length
      ? Math.round(quotes.filter(q => q.status === "CONVERTED" || q.status === "ACCEPTED").length / quotes.length * 100)
      : 0,
  }), [quotes]);

  const filtered = useMemo(() =>
    quotes.filter(q => {
      const matchesSearch =
        q.reference.toLowerCase().includes(search.toLowerCase()) ||
        (q.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeFilter === "ALL" || q.status === activeFilter;
      return matchesSearch && matchesStatus;
    }),
    [quotes, search, activeFilter]
  );

  const isExpired = (q: any) =>
    q.validUntil && !["ACCEPTED","CONVERTED","REJECTED"].includes(q.status) &&
    isAfter(new Date(), new Date(q.validUntil));

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quotes & Proposals"
        description="Manage customer quotes, proposals, and pricing estimates."
        icon={FileText}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Quotes"      value={stats.total}                color="text-slate-900 dark:text-white" />
        <StatCard label="Pipeline Value"    value={`Le ${stats.totalValue.toLocaleString()}`}  color="text-indigo-600 dark:text-indigo-400" sub={`${stats.sent} awaiting response`} />
        <StatCard label="Accepted Value"    value={`Le ${stats.acceptedValue.toLocaleString()}`} color="text-emerald-600 dark:text-emerald-400" sub={`${stats.accepted} accepted`} />
        <StatCard label="Conversion Rate"   value={`${stats.conversionRate}%`} color="text-amber-600 dark:text-amber-400" sub={`${stats.converted} converted`} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by quote # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <Link
          href="/dashboard/sales/quotes/new"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Quote
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map(f => {
          const count = f === "ALL" ? quotes.length : quotes.filter(q => q.status === f).length;
          const isActive = activeFilter === f;
          const cfg = f === "ALL" ? null : STATUS_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
              }`}
            >
              {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
              {f === "ALL" ? "All Quotes" : cfg!.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 pl-5">Quote Ref</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Customer</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Items</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Issued</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Expires</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Amount</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="h-8 w-8 opacity-40" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">No quotes found</p>
                      <p className="text-sm mt-0.5">
                        {search ? "Try adjusting your search term." : "Create your first quote to get started."}
                      </p>
                    </div>
                    {!search && (
                      <Link href="/dashboard/sales/quotes/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">
                        <Plus className="h-4 w-4" /> Create First Quote
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(quote => {
                const expired = isExpired(quote);
                return (
                  <TableRow key={quote.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    {/* Reference */}
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                          {quote.reference}
                        </span>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      {quote.customer ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{quote.customer.name}</p>
                          {quote.customer.email && (
                            <p className="text-xs text-slate-400">{quote.customer.email}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Walk-in</span>
                      )}
                    </TableCell>

                    {/* Items count */}
                    <TableCell>
                      <span className="text-sm text-slate-500">{quote.items?.length ?? 0} item{quote.items?.length !== 1 ? "s" : ""}</span>
                    </TableCell>

                    {/* Issued */}
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(quote.createdAt), "MMM d, yyyy")}
                    </TableCell>

                    {/* Expires */}
                    <TableCell>
                      {quote.validUntil ? (
                        <span className={`text-sm font-medium ${expired ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                          {expired && "⚠ "}{format(new Date(quote.validUntil), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        Le {Number(quote.totalAmount).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={quote.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1">
                          <DropdownMenuLabel className="text-xs text-slate-500 px-2">Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {quote.status === "DRAFT" && (
                            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2" onClick={() => handleStatusUpdate(quote.id, "SENT")}>
                              <Send className="h-4 w-4 text-amber-500" /> Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {quote.status === "SENT" && (<>
                            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2" onClick={() => handleStatusUpdate(quote.id, "ACCEPTED")}>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mark Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50" onClick={() => handleStatusUpdate(quote.id, "REJECTED")}>
                              <Ban className="h-4 w-4" /> Mark Rejected
                            </DropdownMenuItem>
                          </>)}
                          {quote.status === "ACCEPTED" && (
                            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 text-indigo-600" onClick={() => handleStatusUpdate(quote.id, "CONVERTED")}>
                              <FileCheck className="h-4 w-4" /> Convert to Sale
                            </DropdownMenuItem>
                          )}
                          {["REJECTED", "CONVERTED"].includes(quote.status) && (
                            <DropdownMenuItem disabled className="rounded-lg text-slate-400 text-xs">
                              No further actions available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">{filtered.length} quote{filtered.length !== 1 ? "s" : ""} shown</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Total: Le {filtered.reduce((s, q) => s + Number(q.totalAmount), 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
