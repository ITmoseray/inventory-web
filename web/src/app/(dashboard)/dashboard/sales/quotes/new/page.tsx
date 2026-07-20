"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Plus, Trash2, User, Hash, Calendar,
  FileText, ChevronDown, Package, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuote } from "@/lib/actions/quotes";
import { getCustomers } from "@/lib/actions/customer";
import { getProducts } from "@/lib/actions/product";
import { toast } from "sonner";
import { format } from "date-fns";

type LineItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

const inputCls =
  "w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow";

const selectCls =
  "w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-shadow";

function FieldWrapper({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    </div>
  );
}

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [reference, setReference] = useState(`QT-${Date.now().toString().slice(-6)}`);
  const [validUntil, setValidUntil] = useState(
    format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState("This quote is valid for 14 days. Prices may vary after expiry.");

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [custs, prods] = await Promise.all([getCustomers(), getProducts()]);
        setCustomers(custs ?? []);
        setProducts(prods ?? []);
      } catch (err) {
        toast.error("Failed to load products/customers");
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: product?.id ?? "",
        productName: product?.name ?? "",
        unitPrice: Number(product?.sellingPrice ?? 0),
        total: next[index].quantity * Number(product?.sellingPrice ?? 0),
      };
      return next;
    });
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        next[index].total = Number(next[index].quantity) * Number(next[index].unitPrice);
      }
      return next;
    });
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        return toast.error("Please select a valid product for every line item.");
      }
    }
    setLoading(true);
    const res = await createQuote({
      reference,
      customerId: customerId || undefined,
      validUntil: new Date(validUntil),
      notes,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });
    setLoading(false);
    if (res.success) {
      toast.success("Quote created successfully!");
      router.push("/dashboard/sales/quotes");
    } else {
      toast.error(res.error || "Failed to create quote");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => router.push("/dashboard/sales/quotes")}
          className="rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Sales</span>
            <span>/</span>
            <span>Quotes & Estimates</span>
            <span>/</span>
            <span className="text-indigo-500 font-semibold">New Quote</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Quote</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Draft</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top grid: Client + Meta */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

          {/* Client Section */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Bill To</h2>
            </div>

            <FieldWrapper label="Customer">
              <SelectWrapper>
                <select
                  className={selectCls}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Walk-in / One-time Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
                  ))}
                </select>
              </SelectWrapper>
            </FieldWrapper>

            {selectedCustomer && (
              <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</p>
                  {selectedCustomer.email && <p className="text-slate-500 text-xs">{selectedCustomer.email}</p>}
                  {selectedCustomer.phone && <p className="text-slate-500 text-xs">{selectedCustomer.phone}</p>}
                </div>
              </div>
            )}

            <FieldWrapper label="Notes / Payment Terms" hint="Appears at the bottom of the quote document.">
              <textarea
                className={`${inputCls} h-auto py-3 resize-none`}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. This quote is valid for 14 days..."
              />
            </FieldWrapper>
          </div>

          {/* Meta Section */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <Hash className="h-4 w-4 text-slate-500" />
              </div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Quote Details</h2>
            </div>

            <FieldWrapper label="Quote Reference #">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Issue Date">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="date"
                  value={format(new Date(), "yyyy-MM-dd")}
                  disabled
                  className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed"
                />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Valid Until" hint="Quote expires after this date.">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </FieldWrapper>

            <div className="pt-2 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                This quote will be saved as a <strong>Draft</strong>. Change its status to <em>Sent</em> once you&apos;ve shared it with your client.
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Line Items</h2>
              <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">
                {items.length}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="h-8 rounded-xl gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </div>

          {/* Column Headers */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <div className="col-span-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</div>
            <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</div>
            <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (Le)</div>
            <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</div>
            <div className="col-span-1" />
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center px-6 py-4">
                {/* Product selector */}
                <div className="col-span-12 sm:col-span-5">
                  <SelectWrapper>
                    <select
                      className={selectCls}
                      value={item.productId}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      disabled={dataLoading}
                      required
                    >
                      <option value="">
                        {dataLoading ? "Loading products..." : "Select a product..."}
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    className="h-11 rounded-xl text-center tabular-nums"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-8 sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Le</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl pl-9 tabular-nums"
                      required
                    />
                  </div>
                </div>

                {/* Line Total */}
                <div className="col-span-11 sm:col-span-1 text-right">
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                    {item.total.toLocaleString()}
                  </span>
                </div>

                {/* Remove */}
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Footer */}
          <div className="flex justify-end px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">Le {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tax / Discount</span>
                <span className="font-semibold text-slate-400 tabular-nums">Le 0</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-base text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  Le {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/sales/quotes")}
            className="h-11 px-6 rounded-xl text-slate-600"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              <span>{items.length} item{items.length !== 1 ? "s" : ""} · Le {subtotal.toLocaleString()}</span>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><FileText className="h-4 w-4" /> Save Quote</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
