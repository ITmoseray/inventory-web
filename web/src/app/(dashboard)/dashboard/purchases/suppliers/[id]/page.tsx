"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, Wallet, TrendingUp,
  FileText, Clock, CheckCircle2, AlertTriangle, Plus, Printer,
  CreditCard, Banknote, Smartphone, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupplierDetails } from "@/lib/actions/supplier";
import { recordSupplierPayment } from "@/lib/actions/supplier-payment";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = ["statement", "purchases", "payments"] as const;
type Tab = typeof TABS[number];

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("statement");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  useEffect(() => { fetchDetails(); }, [id]);

  async function fetchDetails() {
    try {
      setLoading(true);
      const data = await getSupplierDetails(id);
      setSupplier(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load supplier");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return toast.error("Enter a valid amount");
    setIsSaving(true);
    try {
      await recordSupplierPayment({
        supplierId: id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber || undefined,
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes || undefined,
      });
      toast.success("Payment recorded successfully");
      setIsPaymentOpen(false);
      setPaymentForm({ amount: "", paymentMethod: "CASH", referenceNumber: "", paymentDate: new Date().toISOString().slice(0, 10), notes: "" });
      fetchDetails();
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
      </div>
    );
  }

  if (!supplier) return null;

  const statusColor = (status: string) => {
    if (status === "PAID") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
    if (status === "PARTIAL") return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
    return "text-rose-600 bg-rose-50 dark:bg-rose-950/30";
  };

  const payMethodIcon = (method: string) => {
    if (method === "MOBILE_MONEY") return <Smartphone className="h-3.5 w-3.5" />;
    if (method === "BANK_TRANSFER" || method === "CHEQUE") return <CreditCard className="h-3.5 w-3.5" />;
    return <Banknote className="h-3.5 w-3.5" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{supplier.name}</h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{supplier.paymentTerms || "No Payment Terms"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsPaymentOpen(true)}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Record Payment
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="hidden sm:flex h-12 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 print:hidden shrink-0">
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Purchased", value: `Le ${Math.round(supplier.totalPurchased).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "Total Paid", value: `Le ${Math.round(supplier.totalPaid).toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding Balance", value: `Le ${Math.round(supplier.outstandingBalance).toLocaleString()}`, icon: AlertTriangle, color: supplier.outstandingBalance > 0 ? "text-rose-500" : "text-slate-400", bg: supplier.outstandingBalance > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-slate-50 dark:bg-slate-800" },
          { label: "Transactions", value: (supplier.purchases?.length || 0) + (supplier.payments?.length || 0), icon: FileText, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
            <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0", kpi.bg)}>
              <kpi.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", kpi.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate mt-0.5">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 grid sm:grid-cols-3 gap-4 shadow-sm">
        {supplier.contact && <div className="flex items-start gap-3"><Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Person</p><p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.contact}</p></div></div>}
        {supplier.phone && <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p><p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.phone}</p></div></div>}
        {supplier.email && <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p><p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.email}</p></div></div>}
        {supplier.address && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p><p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.address}</p></div></div>}
        {supplier.taxId && <div className="flex items-start gap-3"><FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax ID</p><p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.taxId}</p></div></div>}
        {supplier.notes && <div className="flex items-start gap-3 sm:col-span-3"><FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes</p><p className="text-sm text-slate-600 dark:text-slate-300">{supplier.notes}</p></div></div>}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 min-w-[120px] py-4 px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {tab === "statement" ? "Ledger Statement" : tab === "purchases" ? `Purchases (${supplier.purchases?.length || 0})` : `Payments (${supplier.payments?.length || 0})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* STATEMENT TAB */}
          {activeTab === "statement" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Date", "Type", "Reference", "Debit (Purchase)", "Credit (Payment)", "Balance"].map(h => (
                      <th key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(supplier.statement || []).map((txn: any, i: number) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4 font-mono text-slate-500">{new Date(txn.date).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">
                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase", txn.type === "PURCHASE" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30")}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-500">{txn.reference}</td>
                      <td className="py-3 pr-4 font-bold text-rose-600">{txn.debit > 0 ? `Le ${Math.round(txn.debit).toLocaleString()}` : "—"}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-600">{txn.credit > 0 ? `Le ${Math.round(txn.credit).toLocaleString()}` : "—"}</td>
                      <td className={cn("py-3 pr-4 font-black", txn.balance > 0 ? "text-rose-600" : "text-emerald-600")}>
                        Le {Math.round(Math.abs(txn.balance)).toLocaleString()} {txn.balance > 0 ? "DR" : "CR"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={5} className="pt-4 font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest">Closing Balance</td>
                    <td className={cn("pt-4 font-black text-sm", supplier.outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600")}>
                      Le {Math.round(supplier.outstandingBalance).toLocaleString()} {supplier.outstandingBalance > 0 ? "DR" : "CR"}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {(!supplier.statement || supplier.statement.length === 0) && (
                <p className="text-center text-slate-400 font-bold py-12 uppercase tracking-widest text-sm">No transactions yet</p>
              )}
            </div>
          )}

          {/* PURCHASES TAB */}
          {activeTab === "purchases" && (
            <div className="space-y-3">
              {(supplier.purchases || []).length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-12 uppercase tracking-widest text-sm">No purchases yet</p>
              ) : (supplier.purchases || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">{p.invoiceNumber || `PO-${p.id.slice(-8)}`}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" /> {new Date(p.createdAt).toLocaleDateString()}
                      {p.dueDate && ` · Due: ${new Date(p.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-slate-900 dark:text-white">Le {Math.round(p.totalAmount).toLocaleString()}</p>
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-lg", statusColor(p.paymentStatus))}>{p.paymentStatus}</span>
                    {p.paymentStatus === "PARTIAL" && (
                      <p className="text-[9px] text-amber-500 font-bold mt-0.5">Paid: Le {Math.round(p.paidAmount).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="space-y-3">
              {(supplier.payments || []).length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Wallet className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No payments recorded</p>
                  <Button onClick={() => setIsPaymentOpen(true)} className="rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-indigo-600 text-white">
                    <Plus className="h-4 w-4" /> Record First Payment
                  </Button>
                </div>
              ) : (supplier.payments || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                      {payMethodIcon(p.paymentMethod)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white">{p.paymentMethod.replace("_", " ")}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(p.paymentDate).toLocaleDateString()}
                        {p.referenceNumber && ` · Ref: ${p.referenceNumber}`}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-sm text-emerald-600">Le {Math.round(p.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Record Payment</DialogTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">To: {supplier.name}</p>
          </DialogHeader>
          {supplier.outstandingBalance > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Outstanding Balance</p>
              <p className="text-2xl font-black text-rose-600">Le {Math.round(supplier.outstandingBalance).toLocaleString()}</p>
            </div>
          )}
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500">Amount (Le) *</Label>
              <Input type="number" min="1" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0.00" className="h-14 text-lg font-mono rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Payment Method</Label>
                <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold">
                  {["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHEQUE"].map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Payment Date</Label>
                <Input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500">Reference / Cheque No.</Label>
              <Input value={paymentForm.referenceNumber} onChange={e => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })} placeholder="Optional" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500">Notes</Label>
              <Textarea value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Optional notes..." className="rounded-xl resize-none" rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)} className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
