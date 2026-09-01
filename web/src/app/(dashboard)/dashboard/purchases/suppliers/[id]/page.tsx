"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, Wallet, TrendingUp,
  FileText, Clock, CheckCircle2, AlertTriangle, Plus, Printer,
  CreditCard, Banknote, Smartphone, RefreshCw, Package, Boxes,
  Trash2, Calendar, Sparkles, Receipt, ChevronRight, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupplierDetails, recordSupplierGood, deleteSupplierGood } from "@/lib/actions/supplier";
import { recordSupplierPayment } from "@/lib/actions/supplier-payment";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["goods", "statement", "payments", "purchases"] as const;
type Tab = typeof TABS[number];

const UNIT_PRESETS = [
  "Cartons", "Bags", "Boxes", "Crates", "Pieces", "Bottles", 
  "Dozens", "Kg", "Litres", "Rolls", "Bundles", "Packs", "Units"
];

const CATEGORY_PRESETS = [
  "Beverages & Drinks", "Food & Provisions", "Raw Materials", 
  "Packaging & Supplies", "Electronics & Accessories", "Hardware & Building", "General Goods"
];

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("goods");
  
  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  // Standalone Goods Intake Modal State (Pure record keeping - NOT connected to products)
  const [isGoodsOpen, setIsGoodsOpen] = useState(false);
  const [isSavingGoods, setIsSavingGoods] = useState(false);
  const [goodsForm, setGoodsForm] = useState({
    itemName: "",
    category: "Beverages & Drinks",
    unit: "Cartons",
    quantity: 1,
    unitCost: 0,
    invoiceNumber: "",
    deliveryDate: new Date().toISOString().slice(0, 10),
    paymentStatus: "PAID" as "PAID" | "PARTIAL" | "UNPAID",
    paidAmount: 0,
    dueDate: "",
    notes: "",
  });

  useEffect(() => { 
    fetchDetails(); 
  }, [id]);

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

  const openGoodsIntakeModal = (presetItemName?: string) => {
    setGoodsForm({
      itemName: presetItemName || "",
      category: "Beverages & Drinks",
      unit: "Cartons",
      quantity: 1,
      unitCost: 0,
      invoiceNumber: `DN-${Date.now().toString().slice(-6)}`,
      deliveryDate: new Date().toISOString().slice(0, 10),
      paymentStatus: "PAID",
      paidAmount: 0,
      dueDate: "",
      notes: "",
    });
    setIsGoodsOpen(true);
  };

  const handleQuantityChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    setGoodsForm(prev => {
      const tot = prev.unitCost * validQty;
      return {
        ...prev,
        quantity: validQty,
        paidAmount: prev.paymentStatus === "PAID" ? tot : prev.paidAmount
      };
    });
  };

  const handleUnitCostChange = (cost: number) => {
    const validCost = Math.max(0, cost);
    setGoodsForm(prev => {
      const tot = validCost * prev.quantity;
      return {
        ...prev,
        unitCost: validCost,
        paidAmount: prev.paymentStatus === "PAID" ? tot : prev.paidAmount
      };
    });
  };

  async function handleRecordGoods(e: React.FormEvent) {
    e.preventDefault();
    if (!goodsForm.itemName.trim()) return toast.error("Please enter the goods / item name");
    if (goodsForm.quantity <= 0) return toast.error("Quantity must be at least 1");
    if (goodsForm.unitCost < 0) return toast.error("Unit cost cannot be negative");

    setIsSavingGoods(true);
    try {
      const totalAmount = goodsForm.quantity * goodsForm.unitCost;
      const paidAmt = goodsForm.paymentStatus === "PAID" 
        ? totalAmount 
        : goodsForm.paymentStatus === "PARTIAL" 
          ? Number(goodsForm.paidAmount) 
          : 0;

      await recordSupplierGood({
        supplierId: id,
        itemName: goodsForm.itemName,
        category: goodsForm.category || undefined,
        unit: goodsForm.unit || "pcs",
        quantity: Number(goodsForm.quantity),
        unitCost: Number(goodsForm.unitCost),
        invoiceNumber: goodsForm.invoiceNumber || `DN-${Date.now().toString().slice(-6)}`,
        deliveryDate: goodsForm.deliveryDate || undefined,
        paymentStatus: goodsForm.paymentStatus,
        paidAmount: paidAmt,
        dueDate: goodsForm.dueDate || undefined,
        notes: goodsForm.notes || undefined,
      });

      toast.success(`Goods recorded under ${supplier?.name} successfully!`);
      setIsGoodsOpen(false);
      fetchDetails();
    } catch (e: any) {
      toast.error(e.message || "Failed to record goods delivery");
    } finally {
      setIsSavingGoods(false);
    }
  }

  async function handleDeleteGood(goodId: string, itemName: string) {
    if (!confirm(`Are you sure you want to remove the record for "${itemName}"?`)) return;
    try {
      await deleteSupplierGood(goodId);
      toast.success("Goods record removed");
      fetchDetails();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete record");
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

  const goodsRecords = supplier.goods || [];

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{supplier.name}</h1>
              <Badge variant="outline" className="text-[9px] font-mono border-indigo-200 text-indigo-600">Supplier Ledger</Badge>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{supplier.paymentTerms || "No Payment Terms"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Button
            onClick={() => openGoodsIntakeModal()}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg cursor-pointer"
          >
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Record Goods Intake
          </Button>
          <Button
            onClick={() => setIsPaymentOpen(true)}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer"
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
          { label: "Total Goods Supplied", value: `Le ${Math.round(supplier.totalPurchased).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "Total Paid Out", value: `Le ${Math.round(supplier.totalPaid).toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding Balance", value: `Le ${Math.round(supplier.outstandingBalance).toLocaleString()}`, icon: AlertTriangle, color: supplier.outstandingBalance > 0 ? "text-rose-500" : "text-slate-400", bg: supplier.outstandingBalance > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-slate-50 dark:bg-slate-800" },
          { label: "Goods Deliveries", value: `${goodsRecords.length} Deliveries`, icon: Boxes, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
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
                "flex-1 min-w-[120px] py-4 px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer",
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {tab === "goods" ? `Goods Record (${goodsRecords.length})` : tab === "statement" ? "Ledger Statement" : tab === "payments" ? `Payments (${supplier.payments?.length || 0})` : `PO Purchases (${supplier.purchases?.length || 0})`}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* TAB 1: STANDALONE SUPPLIED GOODS RECORD KEEPING */}
          {activeTab === "goods" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Goods Brought by {supplier.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Pure record keeping &amp; delivery log for this supplier (standalone register)
                  </p>
                </div>
                <Button 
                  onClick={() => openGoodsIntakeModal()}
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Package className="h-3.5 w-3.5" /> Record New Delivery
                </Button>
              </div>

              {goodsRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                    <Boxes className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">No Goods Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">Record the first items or delivery brought by {supplier.name} to track goods and payments under their name.</p>
                  </div>
                  <Button 
                    onClick={() => openGoodsIntakeModal()} 
                    className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg cursor-pointer"
                  >
                    <Package className="h-4 w-4" /> Record First Goods Delivery
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {["Date", "Goods / Item Name", "Quantity & Unit", "Unit Cost", "Total Amount", "Delivery Ref", "Payment Status", "Action"].map(h => (
                          <th key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {goodsRecords.map((good: any) => (
                        <tr key={good.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 pr-4 font-mono text-slate-500">
                            {new Date(good.deliveryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-slate-900 dark:text-white">{good.itemName}</div>
                            {good.category && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                {good.category}
                              </span>
                            )}
                            {good.notes && (
                              <p className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">{good.notes}</p>
                            )}
                          </td>
                          <td className="py-3.5 pr-4 font-black text-slate-700 dark:text-slate-300">
                            {Number(good.quantity).toLocaleString()} {good.unit || "pcs"}
                          </td>
                          <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-white">
                            Le {Math.round(Number(good.unitCost)).toLocaleString()}
                          </td>
                          <td className="py-3.5 pr-4 font-mono font-black text-indigo-600 dark:text-indigo-400">
                            Le {Math.round(Number(good.totalCost)).toLocaleString()}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-slate-500">
                            {good.invoiceNumber || "—"}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-lg", statusColor(good.paymentStatus))}>
                              {good.paymentStatus}
                            </span>
                            {good.paymentStatus === "PARTIAL" && (
                              <p className="text-[9px] text-amber-500 font-bold mt-0.5">
                                Paid: Le {Math.round(Number(good.paidAmount)).toLocaleString()}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openGoodsIntakeModal(good.itemName)}
                                title="Record another batch of this item"
                                className="h-8 px-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[10px] font-bold cursor-pointer"
                              >
                                + Record
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteGood(good.id, good.itemName)}
                                title="Delete record"
                                className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATEMENT TAB */}
          {activeTab === "statement" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Date", "Type", "Description / Ref", "Debit (Goods / PO)", "Credit (Payment)", "Balance"].map(h => (
                      <th key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(supplier.statement || []).map((txn: any, i: number) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4 font-mono text-slate-500">{new Date(txn.date).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase",
                          txn.type === "PAYMENT" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                        )}>
                          {txn.type === "GOODS_DELIVERY" ? "GOODS INTAKE" : txn.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-bold text-slate-900 dark:text-white">{txn.description || txn.reference}</span>
                        {txn.reference && <span className="text-[9px] font-mono text-slate-400 block">{txn.reference}</span>}
                      </td>
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
                <p className="text-center text-slate-400 font-bold py-12 uppercase tracking-widest text-sm">No transactions recorded yet</p>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="space-y-3">
              {(supplier.payments || []).length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Wallet className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No payments recorded</p>
                  <Button onClick={() => setIsPaymentOpen(true)} className="rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-indigo-600 text-white cursor-pointer">
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
                      {p.notes && <p className="text-[9px] text-slate-500 italic mt-0.5">{p.notes}</p>}
                    </div>
                  </div>
                  <p className="font-black text-sm text-emerald-600">Le {Math.round(p.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PURCHASES (PO) TAB */}
          {activeTab === "purchases" && (
            <div className="space-y-3">
              {(supplier.purchases || []).length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-12 uppercase tracking-widest text-sm">No purchase orders recorded</p>
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
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)} className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                {isSaving ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Standalone Record Goods Delivery Modal (NOT connected to products) */}
      <Dialog open={isGoodsOpen} onOpenChange={setIsGoodsOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Package className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Supplier Goods Register</span>
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Record Goods Brought / Supplied</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Supplier: <span className="text-slate-900 dark:text-white font-black">{supplier.name}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordGoods} className="space-y-4 pt-2">
            {/* Goods / Item Name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Goods / Item Name *</Label>
              <Input
                type="text"
                value={goodsForm.itemName}
                onChange={(e) => setGoodsForm({ ...goodsForm, itemName: e.target.value })}
                placeholder="e.g. Coca Cola 500ml, Cement 50kg, Red Wine Boxes, Rice 50kg Bags..."
                className="h-12 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                required
                autoFocus
              />
            </div>

            {/* Category & Packaging Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category (Optional)</Label>
                <select
                  value={goodsForm.category}
                  onChange={(e) => setGoodsForm({ ...goodsForm, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit / Packaging</Label>
                <select
                  value={goodsForm.unit}
                  onChange={(e) => setGoodsForm({ ...goodsForm, unit: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                >
                  {UNIT_PRESETS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Unit Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quantity Brought *</Label>
                <Input
                  type="number"
                  min="1"
                  value={goodsForm.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="h-12 rounded-xl text-base font-bold font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Cost (Le) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={goodsForm.unitCost}
                  onChange={(e) => handleUnitCostChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-12 rounded-xl text-base font-bold font-mono"
                  required
                />
              </div>
            </div>

            {/* Calculated Total Display Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Total Goods Cost</p>
                <p className="text-lg font-[1000] text-slate-900 dark:text-white font-mono mt-0.5">
                  Le {Math.round(goodsForm.quantity * goodsForm.unitCost).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-indigo-600 text-white text-[9px] font-black uppercase">
                {goodsForm.quantity} {goodsForm.unit} recorded
              </Badge>
            </div>

            {/* Delivery Date & Invoice Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Date</Label>
                <Input
                  type="date"
                  value={goodsForm.deliveryDate}
                  onChange={(e) => setGoodsForm({ ...goodsForm, deliveryDate: e.target.value })}
                  className="h-11 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Note / Invoice Ref</Label>
                <Input
                  type="text"
                  value={goodsForm.invoiceNumber}
                  onChange={(e) => setGoodsForm({ ...goodsForm, invoiceNumber: e.target.value })}
                  placeholder="e.g. DN-2026-0012"
                  className="h-11 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Payment Status & Terms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Status</Label>
                <select
                  value={goodsForm.paymentStatus}
                  onChange={(e) => {
                    const status = e.target.value as "PAID" | "PARTIAL" | "UNPAID";
                    const tot = goodsForm.quantity * goodsForm.unitCost;
                    setGoodsForm({
                      ...goodsForm,
                      paymentStatus: status,
                      paidAmount: status === "PAID" ? tot : status === "PARTIAL" ? Math.round(tot / 2) : 0
                    });
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                >
                  <option value="PAID">Fully Paid (Settled)</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="UNPAID">Credit / On Account (Unpaid)</option>
                </select>
              </div>

              {goodsForm.paymentStatus === "PARTIAL" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paid Amount (Le)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={goodsForm.quantity * goodsForm.unitCost}
                    value={goodsForm.paidAmount}
                    onChange={(e) => setGoodsForm({ ...goodsForm, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="h-11 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              )}

              {(goodsForm.paymentStatus === "UNPAID" || goodsForm.paymentStatus === "PARTIAL") && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Due Date</Label>
                  <Input
                    type="date"
                    value={goodsForm.dueDate}
                    onChange={(e) => setGoodsForm({ ...goodsForm, dueDate: e.target.value })}
                    className="h-11 rounded-xl text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Notes / Remarks</Label>
              <Textarea
                rows={2}
                value={goodsForm.notes}
                onChange={(e) => setGoodsForm({ ...goodsForm, notes: e.target.value })}
                placeholder="Driver name, vehicle plate, batch condition, etc."
                className="rounded-xl text-xs resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGoodsOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingGoods}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg cursor-pointer"
              >
                {isSavingGoods ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Package className="h-4 w-4" /> Save Goods Record
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
