"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet, Search, Filter, Building2, ArrowLeft,
  CreditCard, Banknote, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSupplierPayments } from "@/lib/actions/supplier-payment";
import { getSuppliers } from "@/lib/actions/supplier";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SupplierPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [pays, supps] = await Promise.all([getSupplierPayments(), getSuppliers()]);
      setPayments(pays);
      setSuppliers(supps);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters() {
    try {
      setLoading(true);
      const pays = await getSupplierPayments({
        supplierId: filterSupplier || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setPayments(pays);
    } catch {
      toast.error("Failed to filter payments");
    } finally {
      setLoading(false);
    }
  }

  const filtered = payments.filter(p =>
    (p.supplier?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.referenceNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = filtered.reduce((sum, p) => sum + p.amount, 0);

  const methodIcon = (method: string) => {
    if (method === "MOBILE_MONEY") return <Smartphone className="h-4 w-4" />;
    if (method === "BANK_TRANSFER" || method === "CHEQUE") return <CreditCard className="h-4 w-4" />;
    return <Banknote className="h-4 w-4" />;
  };

  const methodColor = (method: string) => {
    if (method === "MOBILE_MONEY") return "bg-orange-50 text-orange-600 dark:bg-orange-950/30";
    if (method === "BANK_TRANSFER") return "bg-blue-50 text-blue-600 dark:bg-blue-950/30";
    if (method === "CHEQUE") return "bg-purple-50 text-purple-600 dark:bg-purple-950/30";
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases/suppliers">
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Supplier Payments</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} disbursements</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Disbursed", value: `Le ${Math.round(totalPaid).toLocaleString()}`, color: "text-emerald-600" },
          { label: "This Month", value: `Le ${Math.round(filtered.filter(p => new Date(p.paymentDate) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).reduce((s, p) => s + p.amount, 0)).toLocaleString()}`, color: "text-indigo-600" },
          { label: "Records", value: filtered.length, color: "text-slate-900 dark:text-white" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
            <p className={cn("text-xl font-black tracking-tight mt-1", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search supplier or reference..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-11 pl-10 rounded-xl" />
          </div>
          <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold min-w-[160px]">
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-11 rounded-xl w-40" placeholder="From" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-11 rounded-xl w-40" placeholder="To" />
          <Button onClick={applyFilters} disabled={loading} className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Wallet className="h-16 w-16 text-slate-200 dark:text-slate-700" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No payments found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3">
              {["Supplier", "Date", "Method", "Reference", "Amount"].map(h => (
                <p key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</p>
              ))}
            </div>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid sm:grid-cols-5 gap-2 sm:gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/purchases/suppliers/${p.supplierId}`} className="font-black text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                    {p.supplier?.name || "Unknown"}
                  </Link>
                </div>
                <p className="text-xs font-mono text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase", methodColor(p.paymentMethod))}>
                    {methodIcon(p.paymentMethod)} {p.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500">{p.referenceNumber || "—"}</p>
                <p className="font-black text-sm text-emerald-600">Le {Math.round(p.amount).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
