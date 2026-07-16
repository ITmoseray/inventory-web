"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuote } from "@/lib/actions/quotes";
import { getCustomers } from "@/lib/actions/customer";
import { getProducts } from "@/lib/actions/product";
import { toast } from "sonner";
import { format } from "date-fns";

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Form State
  const [customerId, setCustomerId] = useState("");
  const [reference, setReference] = useState(`QT-${Date.now().toString().slice(-6)}`);
  const [validUntil, setValidUntil] = useState(format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState("This quote is valid for 14 days.");
  
  const [items, setItems] = useState([
    { productId: "", description: "", quantity: 1, unitPrice: 0, total: 0, id: Date.now().toString() }
  ]);

  useEffect(() => {
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

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Please add at least one item.");
    
    for (const item of items) {
      if (!item.productId || item.quantity <= 0 || item.unitPrice < 0) {
        return toast.error("Please fill out all item details correctly. A valid product must be selected.");
      }
    }

    setLoading(true);
    try {
      const res = await createQuote({
        reference,
        customerId: customerId || undefined,
        validUntil: new Date(validUntil),
        notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }))
      });

      if (res.success) {
        toast.success("Quote created successfully!");
        router.push('/dashboard/sales/quotes');
      } else {
        toast.error(res.error || "Failed to create quote");
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
            onClick={() => router.push('/dashboard/sales/quotes')}
            className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Quote</h1>
            <p className="text-slate-500 text-sm">Generate a new price estimate for your client.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Client Details</h2>
            
            <div className="space-y-2">
              <Label>Customer (Optional)</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Quote Reference #</Label>
              <Input value={reference} onChange={e => setReference(e.target.value)} required />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dates & Terms</h2>
            
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label>Notes / Terms</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Quote Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8">Add Item</Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 w-full space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Product</Label>
                  <select 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    value={item.productId}
                    onChange={e => handleProductSelect(index, e.target.value)}
                    required
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - Le {Number(p.sellingPrice).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-24 space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Qty</Label>
                  <Input 
                    type="number" min="1" 
                    value={item.quantity || ""} 
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="h-9 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                
                <div className="w-full sm:w-32 space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Unit Price</Label>
                  <Input 
                    type="number" min="0" step="0.01"
                    value={item.unitPrice || ""} 
                    onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="h-9 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                
                <div className="w-full sm:w-32 space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500">Total</Label>
                  <div className="h-9 flex items-center px-3 font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {item.total.toLocaleString()}
                  </div>
                </div>

                <div className="pt-5">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-rose-500 hover:bg-rose-50 h-9 w-9">
                    &times;
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="w-64 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-indigo-600 dark:text-indigo-400">Le {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/sales/quotes')} className="h-12 px-8 rounded-xl">Cancel</Button>
          <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Save & Create Quote"}
          </Button>
        </div>
      </form>
    </div>
  );
}
