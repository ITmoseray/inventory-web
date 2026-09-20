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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Quotes & Proposals
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Manage customer quotes, proposals, and pricing estimates
          </p>
        </div>

        <Link href="/dashboard/sales/quotes/new">
          <button className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-5">
            <Plus size={15} /> New Quote
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Total Quotes</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2563EB]/10 text-[#2563EB]">
              <FileText size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            {stats.total}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Pipeline Value</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#8B5CF6]/10 text-[#8B5CF6]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#8B5CF6] tracking-tight">
            Le {stats.totalValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">{stats.sent} awaiting response</span>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Accepted Value</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#10B981]/10 text-[#10B981]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#10B981] tracking-tight">
            Le {stats.acceptedValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">{stats.accepted} accepted</span>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F59E0B]/10 text-[#F59E0B]">
              <ArrowRightLeft size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#F59E0B] tracking-tight">
            {stats.conversionRate}%
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">{stats.converted} converted</span>
        </div>
      </div>

      {/* Toolbar & Filter Pills */}
      <div className="card p-4 space-y-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder="Search by quote # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-full text-xs font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(f => {
            const count = f === "ALL" ? quotes.length : quotes.filter(q => q.status === f).length;
            const isActive = activeFilter === f;
            const cfg = f === "ALL" ? null : STATUS_CONFIG[f];
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-[#2563EB]/40"
                )}
              >
                {cfg && <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />}
                {f === "ALL" ? "All Quotes" : cfg!.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Quote Ref</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Customer</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Items</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Issued</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Expires</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Amount</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={8} className="px-4 py-6 text-center">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[var(--muted-foreground)]">
                    <FileText size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No quotes found</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {search ? "Try adjusting your search term." : "Create your first quote to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(quote => {
                  const expired = isExpired(quote);
                  return (
                    <tr key={quote.id} className="table-row-hover border-b border-[var(--border)] text-xs group">
                      {/* Reference */}
                      <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                        {quote.reference}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        {quote.customer ? (
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{quote.customer.name}</p>
                            {quote.customer.email && (
                              <p className="text-[10px] text-[var(--muted-foreground)]">{quote.customer.email}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--muted-foreground)] italic">Walk-in</span>
                        )}
                      </td>

                      {/* Items count */}
                      <td className="px-4 py-3.5 font-mono text-[var(--foreground)]">
                        {quote.items?.length ?? 0} item{quote.items?.length !== 1 ? "s" : ""}
                      </td>

                      {/* Issued */}
                      <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                        {format(new Date(quote.createdAt), "MMM d, yyyy")}
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5 font-mono">
                        {quote.validUntil ? (
                          <span className={expired ? "text-[#EF4444] font-semibold" : "text-[var(--muted-foreground)]"}>
                            {expired && "⚠ "}{format(new Date(quote.validUntil), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm text-[var(--foreground)]">
                        Le {Number(quote.totalAmount).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={quote.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[#2563EB] hover:bg-[var(--muted)] transition-all">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-[var(--border)] shadow-xl p-1 bg-[var(--card)]">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {quote.status === "DRAFT" && (
                              <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium gap-2" onClick={() => handleStatusUpdate(quote.id, "SENT")}>
                                <Send size={14} className="text-[#F59E0B]" /> Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {quote.status === "SENT" && (<>
                              <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium gap-2" onClick={() => handleStatusUpdate(quote.id, "ACCEPTED")}>
                                <CheckCircle2 size={14} className="text-[#10B981]" /> Mark Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium gap-2 text-rose-600 focus:text-rose-700" onClick={() => handleStatusUpdate(quote.id, "REJECTED")}>
                                <Ban size={14} /> Mark Rejected
                              </DropdownMenuItem>
                            </>)}
                            {quote.status === "ACCEPTED" && (
                              <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium gap-2 text-[#2563EB]" onClick={() => handleStatusUpdate(quote.id, "CONVERTED")}>
                                <FileCheck size={14} /> Convert to Sale
                              </DropdownMenuItem>
                            )}
                            {["REJECTED", "CONVERTED"].includes(quote.status) && (
                              <DropdownMenuItem disabled className="rounded-lg text-[var(--muted-foreground)] text-xs">
                                No further actions available
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
            <span className="text-[var(--muted-foreground)]">{filtered.length} quote{filtered.length !== 1 ? "s" : ""} shown</span>
            <span className="font-mono font-bold text-[var(--foreground)]">
              Total: Le {filtered.reduce((s, q) => s + Number(q.totalAmount), 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
