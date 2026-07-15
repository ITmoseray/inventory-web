"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, ArrowLeft, Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoice } from "@/lib/actions/invoices";
import { getCustomers } from "@/lib/actions/customer";
import { getProducts } from "@/lib/actions/product";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Form State
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')); // 14 days default
  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState("Please pay within 14 days of receiving this invoice.");
  const [taxRate, setTaxRate] = useState(0); // Optional GST/VAT %
  
  const [items, setItems] = useState([
    { productId: "", description: "", quantity: 1, unitPrice: 0, total: 0, id: Date.now().toString() }
  ]);

  useEffect(() => {
    // Load customers and products for the selectors
    const loadData = async () => {
      try {
        const [custs, prods] = await Promise.all([
          getCustomers(),
          getProducts()
        ]);
        setCustomers(custs);
        setProducts(prods);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = [...items];
    newItems[index].productId = product.id;
    newItems[index].description = product.name;
    newItems[index].unitPrice = Number(product.sellingPrice) || 0;
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unitPrice") {
       newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", description: "", quantity: 1, unitPrice: 0, total: 0, id: Date.now().toString() }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subTotal * (taxRate / 100));
  const totalAmount = subTotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Please add at least one item.");
    
    // Validate items
    for (const item of items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
        return toast.error("Please fill out all item details correctly.");
      }
    }

    setLoading(true);
    try {
      const res = await createInvoice({
        customerId: customerId || undefined,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subTotal,
        taxRate,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        notes,
        terms,
        items: items.map(item => ({
          productId: item.productId || undefined,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total)
        }))
      });

      if (res.success) {
        toast.success("Invoice created successfully!");
        router.push(`/dashboard/sales/invoices/${res.id}`);
      } else {
        toast.error(res.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/sales/invoices')}
            className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Invoice</h1>
            <p className="text-slate-500 text-sm">Generate a new professional invoice for your client.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">Client Details</h2>
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-500"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Walk-in Client (No Account) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
               <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">Invoice Details</h2>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Issue Date</Label>
                   <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="rounded-xl" />
                 </div>
                 <div className="space-y-2">
                   <Label>Due Date</Label>
                   <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="rounded-xl" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Line Items</h2>
          
          <div className="space-y-4">
            {/* Table Header (Hidden on small screens) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-sm font-semibold text-slate-500">
              <div className="col-span-4">Item & Description</div>
              <div className="col-span-2">Product Lookup</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-4 md:p-2 rounded-xl relative group">
                <div className="md:col-span-4 space-y-2 md:space-y-0">
                  <span className="md:hidden text-xs font-semibold text-slate-500 uppercase">Description</span>
                  <Input 
                    placeholder="Enter item description..." 
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    required
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 md:space-y-0">
                  <span className="md:hidden text-xs font-semibold text-slate-500 uppercase">Product Lookup (Optional)</span>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-500"
                    value={item.productId}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                  >
                    <option value="">Custom Item</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2 md:space-y-0">
                  <span className="md:hidden text-xs font-semibold text-slate-500 uppercase">Qty</span>
                  <Input 
                    type="number" 
                    min="1" 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 md:space-y-0">
                  <span className="md:hidden text-xs font-semibold text-slate-500 uppercase">Unit Price</span>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="md:col-span-1 text-right font-bold text-slate-800 dark:text-slate-200 flex justify-between md:block items-center">
                   <span className="md:hidden text-xs font-semibold text-slate-500 uppercase">Total</span>
                   Le {item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
                <div className="md:col-span-1 text-right">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(index)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    disabled={items.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" onClick={addItem} variant="outline" className="mt-4 rounded-xl border-dashed border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30 w-full py-6">
            <Plus className="h-4 w-4 mr-2" /> Add Another Line Item
          </Button>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                 <Label>Tax Rate (%)</Label>
                 <Input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-1/3 rounded-xl" />
              </div>
              <div className="space-y-2">
                 <Label>Notes to Customer</Label>
                 <textarea 
                   className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-500"
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                 />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4">
               <div className="flex justify-between text-slate-500">
                 <span>Subtotal</span>
                 <span>Le {subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               {taxRate > 0 && (
                 <div className="flex justify-between text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-4">
                   <span>Tax ({taxRate}%)</span>
                   <span>Le {taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
               )}
               <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2">
                 <span>Grand Total</span>
                 <span>Le {totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
           <Button type="button" variant="outline" className="h-12 px-8 rounded-xl" onClick={() => router.push('/dashboard/sales/invoices')}>
             Cancel
           </Button>
           <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20">
             {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
             Create Invoice
           </Button>
        </div>
      </form>
    </div>
  );
}
