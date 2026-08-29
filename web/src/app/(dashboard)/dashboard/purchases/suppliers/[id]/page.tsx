"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, Wallet, TrendingUp,
  FileText, Clock, CheckCircle2, AlertTriangle, Plus, Printer,
  CreditCard, Banknote, Smartphone, RefreshCw, Package, Boxes,
  ShoppingCart, Tag, Calendar, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupplierDetails } from "@/lib/actions/supplier";
import { recordSupplierPayment } from "@/lib/actions/supplier-payment";
import { createPurchase } from "@/lib/actions/purchase";
import { getProducts } from "@/lib/actions/product";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = ["goods", "statement", "purchases", "payments"] as const;
type Tab = typeof TABS[number];

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
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

  // Goods Intake Modal State
  const [isGoodsOpen, setIsGoodsOpen] = useState(false);
  const [isSavingGoods, setIsSavingGoods] = useState(false);
  const [goodsForm, setGoodsForm] = useState({
    productId: "",
    unitId: "",
    quantity: 1,
    unitCost: 0,
    invoiceNumber: "",
    paymentStatus: "PAID" as "PAID" | "PARTIAL" | "UNPAID",
    paidAmount: 0,
    dueDate: "",
    notes: "",
  });

  useEffect(() => { 
    fetchDetails(); 
    fetchProductsList();
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

  async function fetchProductsList() {
    try {
      const list = await getProducts();
      setProducts(list || []);
    } catch (e) {
      console.error("Failed to load products", e);
    }
  }

  const openGoodsIntakeModal = (preselectedProductId?: string) => {
    const selectedProd = products.find(p => p.id === preselectedProductId) || products[0];
    setGoodsForm({
      productId: selectedProd ? selectedProd.id : "",
      unitId: selectedProd?.units?.[0]?.id || "",
      quantity: 1,
      unitCost: selectedProd ? (selectedProd.costPrice || selectedProd.unitPrice || 0) : 0,
      invoiceNumber: `DN-${Date.now().toString().slice(-6)}`,
      paymentStatus: "PAID",
      paidAmount: selectedProd ? (selectedProd.costPrice || selectedProd.unitPrice || 0) : 0,
      dueDate: "",
      notes: "",
    });
    setIsGoodsOpen(true);
  };

  const handleProductChange = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    const cost = prod ? (prod.costPrice || prod.unitPrice || 0) : 0;
    setGoodsForm(prev => ({
      ...prev,
      productId: prodId,
      unitId: prod?.units?.[0]?.id || "",
      unitCost: cost,
      paidAmount: prev.paymentStatus === "PAID" ? (cost * prev.quantity) : prev.paidAmount
    }));
  };

  const handleQuantityChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    setGoodsForm(prev => ({
      ...prev,
      quantity: validQty,
      paidAmount: prev.paymentStatus === "PAID" ? (prev.unitCost * validQty) : prev.paidAmount
    }));
  };

  const handleUnitCostChange = (cost: number) => {
    const validCost = Math.max(0, cost);
    setGoodsForm(prev => ({
      ...prev,
      unitCost: validCost,
      paidAmount: prev.paymentStatus === "PAID" ? (validCost * prev.quantity) : prev.paidAmount
    }));
  };

  async function handleRecordGoods(e: React.FormEvent) {
    e.preventDefault();
    if (!goodsForm.productId) return toast.error("Please select a product/goods item");
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

      await createPurchase({
        supplierId: id,
        items: [{
          productId: goodsForm.productId,
          unitId: goodsForm.unitId || undefined,
          quantity: Number(goodsForm.quantity),
          unitCost: Number(goodsForm.unitCost),
          total: totalAmount,
        }],
        totalAmount,
        paidAmount: paidAmt,
        paymentStatus: goodsForm.paymentStatus,
        invoiceNumber: goodsForm.invoiceNumber || `PUR-${Date.now()}`,
        dueDate: goodsForm.dueDate || undefined,
        notes: goodsForm.notes || `Goods intake under ${supplier?.name}`,
      });

      toast.success(`Goods recorded under ${supplier?.name} and inventory updated!`);
      setIsGoodsOpen(false);
      fetchDetails();
    } catch (e: any) {
      toast.error(e.message || "Failed to record goods intake");
    } finally {
      setIsSavingGoods(false);
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

  // Aggregate all unique goods recorded under this supplier
  const suppliedGoods = useMemo(() => {
    if (!supplier?.purchases) return [];
    const map = new Map<string, {
      productId: string;
      name: string;
      sku: string | null;
      stockQuantity: number;
      baseUnit: string | null;
      totalQuantity: number;
      totalSpent: number;
      latestUnitCost: number;
      lastDeliveryDate: string;
      deliveryCount: number;
    }>();

    for (const p of supplier.purchases) {
      for (const item of p.items || []) {
        const pId = item.productId || item.product?.id || item.product?.name;
        if (!pId) continue;
        const existing = map.get(pId);
        const pName = item.product?.name || "Goods Item";
        const pSku = item.product?.sku || null;
        const stock = item.product?.stockQuantity ?? 0;
        const unit = item.product?.baseUnit || "pcs";
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        const total = Number(item.total) || (qty * cost);
        const date = p.createdAt;

        if (!existing) {
          map.set(pId, {
            productId: pId,
            name: pName,
            sku: pSku,
            stockQuantity: stock,
            baseUnit: unit,
            totalQuantity: qty,
            totalSpent: total,
            latestUnitCost: cost,
            lastDeliveryDate: date,
            deliveryCount: 1,
          });
        } else {
          existing.totalQuantity += qty;
          existing.totalSpent += total;
          existing.deliveryCount += 1;
          if (new Date(date) > new Date(existing.lastDeliveryDate)) {
            existing.lastDeliveryDate = date;
            existing.latestUnitCost = cost;
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.lastDeliveryDate).getTime() - new Date(a.lastDeliveryDate).getTime());
  }, [supplier]);

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
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Button
            onClick={() => openGoodsIntakeModal()}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg cursor-pointer"
          >
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Receive Goods
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
          { label: "Total Purchased", value: `Le ${Math.round(supplier.totalPurchased).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "Total Paid", value: `Le ${Math.round(supplier.totalPaid).toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding Balance", value: `Le ${Math.round(supplier.outstandingBalance).toLocaleString()}`, icon: AlertTriangle, color: supplier.outstandingBalance > 0 ? "text-rose-500" : "text-slate-400", bg: supplier.outstandingBalance > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-slate-50 dark:bg-slate-800" },
          { label: "Supplied Goods Items", value: `${suppliedGoods.length} Products`, icon: Boxes, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
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
              {tab === "goods" ? `Supplied Goods (${suppliedGoods.length})` : tab === "statement" ? "Ledger Statement" : tab === "purchases" ? `Purchases (${supplier.purchases?.length || 0})` : `Payments (${supplier.payments?.length || 0})`}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* SUPPLIED GOODS CATALOGUE TAB */}
          {activeTab === "goods" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 pb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Recorded Goods under {supplier.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All inventory stock items and products delivered by this supplier</p>
                </div>
                <Button 
                  onClick={() => openGoodsIntakeModal()}
                  className="h-9 px-3 sm:px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Package className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Record Goods Intake</span><span className="sm:hidden">Intake</span>
                </Button>
              </div>

              {suppliedGoods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                    <Boxes className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">No Goods Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">Record the first delivery or batch of goods received under {supplier.name} to start tracking stock.</p>
                  </div>
                  <Button 
                    onClick={() => openGoodsIntakeModal()} 
                    className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg cursor-pointer"
                  >
                    <Package className="h-4 w-4" /> Record First Goods Intake
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {["Goods / Product", "Total Supplied", "Latest Unit Cost", "Total Spend", "Last Delivered", "Action"].map(h => (
                          <th key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {suppliedGoods.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                In Stock: {item.stockQuantity} {item.baseUnit}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 font-black text-slate-700 dark:text-slate-300">
                            {item.totalQuantity.toLocaleString()} {item.baseUnit}
                            <span className="text-[9px] font-medium text-slate-400 block">{item.deliveryCount} {item.deliveryCount === 1 ? "Delivery" : "Deliveries"}</span>
                          </td>
                          <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-white">
                            Le {Math.round(item.latestUnitCost).toLocaleString()}
                          </td>
                          <td className="py-3.5 pr-4 font-mono font-black text-indigo-600 dark:text-indigo-400">
                            Le {Math.round(item.totalSpent).toLocaleString()}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-slate-500">
                            {new Date(item.lastDeliveryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 pr-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGoodsIntakeModal(item.productId)}
                              className="h-8 px-3 rounded-xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" /> Receive Stock
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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

      {/* Record Goods Intake Modal */}
      <Dialog open={isGoodsOpen} onOpenChange={setIsGoodsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Package className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Stock &amp; Delivery Intake</span>
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Record Goods Received</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Supplier: <span className="text-slate-900 dark:text-white font-black">{supplier.name}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordGoods} className="space-y-4 pt-2">
            {/* Product Selection */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Goods / Product Item *</Label>
              <select
                value={goodsForm.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                required
              >
                <option value="">-- Choose Product to Receive --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(${p.sku})` : ""} — In Stock: {p.stockQuantity} {p.baseUnit || "pcs"}
                  </option>
                ))}
              </select>
            </div>

            {/* Packaging Unit (if available) */}
            {(() => {
              const selectedProduct = products.find(p => p.id === goodsForm.productId);
              if (selectedProduct?.units && selectedProduct.units.length > 0) {
                return (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Type / Packaging</Label>
                    <select
                      value={goodsForm.unitId}
                      onChange={(e) => setGoodsForm({ ...goodsForm, unitId: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="">Base Unit ({selectedProduct.baseUnit || "pcs"})</option>
                      {selectedProduct.units.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (Contains {u.ratio} {selectedProduct.baseUnit || "pcs"})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            {/* Quantity & Unit Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quantity Received *</Label>
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
                  className="h-12 rounded-xl text-base font-bold font-mono"
                  required
                />
              </div>
            </div>

            {/* Calculated Total Display Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Total Goods Value</p>
                <p className="text-lg font-[1000] text-slate-900 dark:text-white font-mono mt-0.5">
                  Le {Math.round(goodsForm.quantity * goodsForm.unitCost).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-indigo-600 text-white text-[9px] font-black uppercase">
                +{goodsForm.quantity} units to stock
              </Badge>
            </div>

            {/* Delivery Note / Invoice Number */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Note / Invoice Ref</Label>
              <Input
                type="text"
                value={goodsForm.invoiceNumber}
                onChange={(e) => setGoodsForm({ ...goodsForm, invoiceNumber: e.target.value })}
                placeholder="e.g. DN-2026-0012 or INV-9842"
                className="h-11 rounded-xl text-xs font-mono font-bold"
              />
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
                placeholder="Batch number, condition of goods, delivery driver, etc."
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
                    <Package className="h-4 w-4" /> Save Goods Intake
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
