"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ArrowLeft,
  User,
  MapPin,
  ShoppingCart,
  Package,
  Calculator,
  Truck,
  FileText,
  Calendar,
  CreditCard,
  Search,
  ChevronDown,
  X,
  Save,
  SendHorizonal,
} from "lucide-react";
import { createSalesOrder } from "@/lib/actions/sales-order";
import { getProducts } from "@/lib/actions/product";
import { getCustomers } from "@/lib/actions/customer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LineItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const PAYMENT_TERMS = [
  "Due on Receipt",
  "Net 15",
  "Net 30",
  "Net 60",
  "COD (Cash on Delivery)",
  "50% Upfront",
  "Custom",
];

const DELIVERY_METHODS = [
  "Pickup",
  "Standard Delivery",
  "Express Delivery",
  "Freight",
];

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Customer section
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const customerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  // Delivery section
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Standard Delivery");
  const [expectedDate, setExpectedDate] = useState("");

  // Payment section
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [notes, setNotes] = useState("");

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Financials
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"));
    getCustomers()
      .then(setCustomers)
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  // getProducts returns all active products — no need to filter by status string
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectProduct = (p: any) => {
    setSelectedProduct(p);
    setNewPrice(Number(p.unitPrice));
    setProductSearch(p.name);
    setShowProductDropdown(false);
  };

  const selectCustomer = (c: any) => {
    setCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerEmail(c.email ?? "");
    setCustomerPhone(c.phone ?? "");
    setDeliveryAddress(c.address ?? "");
    setCustomerSearch(c.name);
    setShowCustomerDropdown(false);
  };

  const addItem = () => {
    if (!selectedProduct && !productSearch.trim()) {
      toast.error("Please select or enter a product");
      return;
    }
    if (newQty <= 0 || newPrice <= 0) {
      toast.error("Quantity and price must be greater than 0");
      return;
    }
    const newItem: LineItem = {
      productId: selectedProduct?.id,
      productName: selectedProduct?.name ?? productSearch.trim(),
      quantity: newQty,
      unitPrice: newPrice,
      total: newQty * newPrice,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setProductSearch("");
    setNewQty(1);
    setNewPrice(0);
    toast.success("Item added");
  };

  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof LineItem, val: number | string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: val };
        updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        return updated;
      })
    );
  };

  const validate = () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return false; }
    if (items.length === 0) { toast.error("Add at least one product"); return false; }
    return true;
  };

  const handleSubmit = async (status: "DRAFT" | "PENDING") => {
    if (!validate()) return;
    if (status === "DRAFT") setSavingDraft(true);
    else setLoading(true);
    try {
      await createSalesOrder({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerId,
        deliveryAddress: deliveryAddress || undefined,
        billingAddress: billingAddress || undefined,
        paymentTerms,
        deliveryMethod,
        expectedDate: expectedDate || undefined,
        notes: notes || undefined,
        discount,
        tax: taxAmount,
        status,
        items,
      });
      toast.success(
        status === "DRAFT"
          ? "Sales order saved as draft"
          : "Sales order submitted for approval"
      );
      router.push("/dashboard/sales/orders");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create sales order");
    } finally {
      setSavingDraft(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 md:px-10 h-20 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales/orders">
            <button className="h-10 w-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              Sales Orders
            </p>
            <h1 className="text-2xl font-[1000] tracking-tight italic text-slate-900 dark:text-white uppercase leading-none">
              New Sales Order
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            disabled={savingDraft || loading}
            className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {savingDraft ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSubmit("PENDING")}
            disabled={loading || savingDraft}
            className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 gap-2"
          >
            <SendHorizonal className="h-4 w-4" />
            {loading ? "Submitting…" : "Submit for Approval"}
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">
        {/* ── Row 1: Customer + Delivery ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Card */}
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative z-50">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                  Customer Details
                </h2>
              </div>

              {/* Customer Search / Autofill */}
              <div className="relative" ref={customerRef}>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Search Existing Customer
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Type to search customers…"
                    className="w-full h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
                <AnimatePresence>
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-30 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-52 overflow-y-auto"
                    >
                      {filteredCustomers.slice(0, 8).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectCustomer(c)}
                          className="w-full text-left px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                          <p className="font-black text-sm text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.email} · {c.phone}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Customer Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Trading"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Email
                    </Label>
                    <Input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Phone
                    </Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+232 …"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Terms Card */}
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                  Delivery & Terms
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Payment Terms
                  </Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl">
                      {PAYMENT_TERMS.map((t) => (
                        <SelectItem key={t} value={t} className="font-medium dark:text-slate-200 cursor-pointer">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Delivery Method
                  </Label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl">
                      {DELIVERY_METHODS.map((m) => (
                        <SelectItem key={m} value={m} className="font-medium dark:text-slate-200 cursor-pointer">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Expected Delivery Date
                </Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white dark:[color-scheme:dark]"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Delivery Address
                </Label>
                <Textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  rows={2}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white resize-none"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Billing Address <span className="text-slate-300 font-normal normal-case tracking-normal">(if different)</span>
                </Label>
                <Textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  rows={2}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Products Section ── */}
        <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative z-40">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                Order Items
              </h2>
              <Badge variant="outline" className="ml-auto text-[10px] font-black uppercase tracking-widest">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Add Item Row */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Add Product
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_auto] gap-4 items-end">
                {/* Product Search */}
                <div className="relative" ref={productRef}>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Product
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProduct(null);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Search products…"
                      className="w-full h-11 pl-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                  <AnimatePresence>
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-30 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-52 overflow-y-auto"
                      >
                        {filteredProducts.slice(0, 10).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => selectProduct(p)}
                            className="w-full text-left px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <p className="font-black text-sm text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-400">
                              NLe {Number(p.unitPrice).toLocaleString()} · Stock: {Number(p.stockQuantity)}
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Qty
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 font-medium dark:text-white"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Unit Price
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 font-medium dark:text-white"
                  />
                </div>

                <Button
                  onClick={addItem}
                  className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-[10px] tracking-widest mt-6 md:mt-0 gap-2"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="text-left px-5 py-4">Product</th>
                      <th className="text-center px-4 py-4 w-24">Qty</th>
                      <th className="text-right px-4 py-4 w-32">Unit Price</th>
                      <th className="text-right px-4 py-4 w-32">Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    <AnimatePresence>
                      {items.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          className="group"
                        >
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-900 dark:text-white">{item.productName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                              className="h-9 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 w-20 mx-auto font-bold dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                              className="h-9 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 w-28 ml-auto font-bold dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-4 text-right font-black text-slate-900 dark:text-white">
                            NLe {item.total.toLocaleString()}
                          </td>
                          <td className="pr-4 py-4">
                            <button
                              onClick={() => removeItem(idx)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Bottom Row: Notes + Summary ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes */}
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative z-30">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                  Notes & Remarks
                </h2>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes, special instructions, or remarks…"
                rows={5}
                className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-medium dark:text-white resize-none"
              />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative z-30">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-[1000] uppercase tracking-tight italic text-slate-900 dark:text-white">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    NLe {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-slate-500 font-medium">Discount (NLe)</label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="h-9 w-28 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold dark:text-white"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-slate-500 font-medium">Tax (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="h-9 w-28 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold dark:text-white"
                  />
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs">Tax Amount</span>
                    <span className="font-bold">NLe {taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                <div className="flex justify-between items-center">
                  <span className="font-[1000] text-lg uppercase italic tracking-tight text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="font-[1000] text-2xl text-indigo-600 dark:text-indigo-400 tracking-tighter">
                    NLe {total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
