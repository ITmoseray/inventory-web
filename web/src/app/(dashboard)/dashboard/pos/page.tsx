"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/store/use-pos-store";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Trash2, 
  X,
  Plus, 
  Minus, 
  Search, 
  RefreshCw,
  LayoutGrid,
  List,
  Package,
  CheckCircle2,
  Printer,
  Download,
  Zap,
  ChevronRight,
  Info,
  TrendingUp,
  BarChart3,
  Calculator,
  ShieldCheck,
  User,
  Banknote,
  Receipt,
  AlertCircle,
  Clock,
  Store,
  Wallet,
  Smartphone,
  CreditCard as CardIcon,
  ArrowRight,
  ChevronDown,
  History,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createSale } from "@/lib/actions/sale";
import { getCustomers } from "@/lib/actions/customer";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  Tooltip as ChartTooltip,
  CartesianGrid
} from "recharts";
import { Badge } from "@/components/ui/badge";

// Memoized Product Card (Touch-Optimized)
const ProductCard = React.memo(({ p, addItem }: { p: any, addItem: any }) => (
  <motion.div 
    whileTap={{ scale: 0.95 }}
    onClick={() => addItem({ id: p.id, name: p.name, price: p.unitPrice, quantity: 1, imageUrl: p.imageUrl })}
    className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-2 sm:p-3 flex flex-col items-center hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl group" 
  >
    <div className="relative aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden mb-2 sm:mb-3">
      {p.imageUrl ? (
        <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
      ) : (
        <Package className="h-8 w-8 text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-2 right-2 flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-white shadow-lg opacity-0 sm:group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        <Plus size={20} />
      </div>
    </div>
    <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase text-center line-clamp-1 w-full tracking-tight">{p.name}</span>
    <div className="flex items-center justify-between w-full mt-2 border-t border-slate-50 dark:border-slate-800 pt-2">
      <span className="text-[10px] sm:text-xs font-[1000] text-primary">Le {Math.round(p.unitPrice).toLocaleString()}</span>
      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.stockQuantity} UNIT</span>
    </div>
  </motion.div>
));
ProductCard.displayName = "ProductCard";

import { useSession } from "next-auth/react";
// ...
export default function POSPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const cart = usePOSStore((state) => state.cart);
  const addItem = usePOSStore((state) => state.addItem);
  const removeItem = usePOSStore((state) => state.removeItem);
  const updateQuantity = usePOSStore((state) => state.updateQuantity);
  const clearCart = usePOSStore((state) => state.clearCart);
  
  const total = usePOSStore((state) => state.total);
  const tax = usePOSStore((state) => state.tax);
  const grandTotal = usePOSStore((state) => state.grandTotal);
  
  const { isOnline, isSyncing, initialSync } = useOfflineSync();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | "WALKIN">("WALKIN");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID" | "PARTIAL">("PAID");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE_MONEY" | "CARD">("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);

  useEffect(() => {
    fetchCustomers();
    initialSync();
  }, []);

  async function fetchCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }

  const products = useLiveQuery(
    () => {
      let collection = db.products;
      if (selectedCategory) {
        return collection.where("categoryId").equals(selectedCategory).toArray();
      }
      return collection.toArray();
    },
    [selectedCategory]
  );

  const categories = useLiveQuery(() => db.categories.toArray());

  const filteredProducts = useMemo(() => products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [products, searchQuery]);

  async function handleCheckout() {
    if (cart.length === 0) {
       toast.error("Cart is empty");
       return;
    }
    
    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.isExternal ? undefined : item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
        })),
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus,
        customerId: selectedCustomer === "WALKIN" ? undefined : selectedCustomer,
        amountPaid: paymentStatus === "PAID" ? grandTotal : amountPaid,
      };

      const result = await createSale(saleData);
      if (result.success) {
        toast.success("Transaction finalized.");
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartVisible(false);
      }
    } catch (error) {
      toast.error("Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col xl:flex-row h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 shadow-xl relative z-10 xl:rounded-r-[3rem] overflow-hidden">
        <header className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
               <ShoppingCart className="h-6 w-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Commerce <span className="text-primary">Hub</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isOnline ? "Neural Network Linked" : "Local Sync Mode"}</p>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" size="sm" onClick={initialSync} disabled={isSyncing} className="flex-1 sm:flex-none h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest gap-2">
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                Force Sync
             </Button>
             <Button onClick={() => router.back()} variant="ghost" className="h-11 w-11 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} className="text-slate-400" />
             </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-4 shrink-0 bg-white dark:bg-slate-900 z-20">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Scan barcode or search assets..." 
                className="h-14 pl-12 pr-6 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 font-bold text-sm shadow-inner transition-all" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={cn("h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shrink-0 transition-all", selectedCategory === null ? "bg-slate-900" : "border-slate-200")}
              >
                All Assets
              </Button>
              {categories?.map((cat) => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn("h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shrink-0 transition-all", selectedCategory === cat.id ? "bg-slate-900" : "border-slate-200")}
                >
                  {cat.name}
                </Button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-40 xl:pb-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
           {filteredProducts?.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="h-24 w-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-700">
                   <Package className="h-10 w-10 text-slate-200 dark:text-slate-600" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Matches Found</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-[200px]">Asset signature not found in local vault.</p>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-6 mt-4 pb-12">
                {filteredProducts?.map((p) => (
                    <ProductCard key={p.id} p={p} addItem={addItem} />
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Cart Area */}
      <div className={cn(
        "fixed xl:relative bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 xl:w-[450px] shadow-2xl xl:shadow-none border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-500 ease-in-out",
        isCartVisible ? "h-[85vh] xl:h-full" : "h-[80px] xl:h-full"
      )}>
        {/* Cart Header (Mobile Toggle) */}
        <div 
          className="h-[80px] px-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0 cursor-pointer xl:cursor-default"
          onClick={() => !isCartVisible && setIsCartVisible(true)}
        >
           <div className="flex items-center gap-4">
              <div className="relative">
                 <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-xl">
                   <ShoppingCart className="h-6 w-6 text-white dark:text-slate-900" />
                 </div>
                 {cart.length > 0 && (
                   <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
                 )}
              </div>
              <div className="xl:block">
                 <h2 className="text-lg font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Intelligence <span className="text-primary">Ledger</span></h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Settlement</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="text-right mr-2 sm:mr-4">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Running Total</p>
                 <p className="text-xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(total).toLocaleString()}</p>
              </div>
              <Button 
                variant="ghost" 
                className="xl:hidden h-10 w-10 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartVisible(!isCartVisible);
                }}
              >
                {isCartVisible ? <ChevronDown size={24} /> : <ChevronDown className="rotate-180" size={24} />}
              </Button>
              <Button 
                variant="ghost" 
                className="hidden xl:flex h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                onClick={() => clearCart()}
                title="Purge Ledger"
              >
                <Trash2 size={20} />
              </Button>
           </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-900/30 custom-scrollbar">
           <AnimatePresence mode="popLayout">
             {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <Activity className="h-12 w-12 text-slate-200 dark:text-slate-800 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting for Intelligence Inputs...</p>
               </div>
             ) : (
               cart.map((item) => (
                 <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 group"
                 >
                    <div className="relative h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-50 dark:border-slate-700 shadow-inner">
                        {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized /> : <Package size={20} className="text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase truncate tracking-tight">{item.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shadow-inner">
                              <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-all shadow-sm active:scale-90"
                              >
                                  <Minus size={14} />
                              </button>
                              <span className="text-xs font-black w-8 text-center">{item.quantity}</span>
                              <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-all shadow-sm active:scale-90"
                              >
                                  <Plus size={14} />
                              </button>
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 ml-1">x Le {Math.round(item.price).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <X size={18} />
                       </button>
                       <div className="font-[1000] text-sm sm:text-base text-slate-900 dark:text-white tracking-tighter">Le {Math.round(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                 </motion.div>
               ))
             )}
           </AnimatePresence>
        </div>

        {/* Settlement Summary */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-6 shrink-0">
           <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Subtotal Settlement</span>
                 <span className="text-slate-600 dark:text-slate-300">Le {Math.round(total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Tax Assessment (15%)</span>
                 <span className="text-slate-600 dark:text-slate-300">Le {Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-50 dark:bg-slate-800 w-full my-4" />
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-2">Grand Terminal Total</p>
                    <p className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(grandTotal).toLocaleString()}</p>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] mb-1" />
              </div>
           </div>

           <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-16 sm:h-20 rounded-[2rem] bg-slate-900 text-white dark:bg-primary font-[1000] text-xs sm:text-sm uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group gap-4"
           >
              Deploy Transaction <ArrowRight className="group-hover:translate-x-2 transition-transform" />
           </Button>
        </div>
      </div>
      
      {/* Checkout Terminal Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <ShieldCheck size={180} />
               </div>
               <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Secure Settlement</p>
                  <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">Final <span className="text-indigo-500">Node</span> Checkout</h3>
                  <div className="flex items-center gap-3 pt-3">
                     <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 text-[10px] font-black rounded-lg h-6 px-3">{cart.length} LINE ITEMS</Badge>
                     <div className="h-1 w-1 rounded-full bg-slate-700" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth: {session?.user?.name}</span>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-8 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {/* Customer Selection */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <User size={14} className="text-primary" />
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Attribution</Label>
                  </div>
                  <Select value={selectedCustomer} onValueChange={(val) => setSelectedCustomer(val || "WALKIN")}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold shadow-inner">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="WALKIN" className="font-bold py-3">Anonymous Walk-in</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-bold py-3">{c.name} ({c.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               {/* Payment Method */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <Banknote size={14} className="text-primary" />
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Vector</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                     {[
                       { id: 'CASH', label: 'Cash', icon: Banknote },
                       { id: 'MOBILE_MONEY', label: 'Mobile', icon: Smartphone },
                       { id: 'CARD', label: 'Card', icon: CardIcon }
                     ].map((m) => (
                       <button
                         key={m.id}
                         onClick={() => setPaymentMethod(m.id as any)}
                         className={cn(
                           "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 shadow-sm",
                           paymentMethod === m.id 
                             ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                             : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                         )}
                       >
                         <m.icon size={24} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               {/* Settlement Stats */}
               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Resolve</span>
                     <span className="text-2xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(grandTotal).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Assessed Balance</span>
                     <span className="text-2xl font-[1000] text-emerald-500 tracking-tighter">Le 0</span>
                  </div>
               </div>
            </div>

            <div className="p-8 pt-0 flex gap-4 bg-white dark:bg-slate-950 relative z-10">
               <Button 
                  variant="outline" 
                  className="flex-1 h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-400 border-slate-200 dark:border-slate-800" 
                  onClick={() => setIsCheckoutOpen(false)}
               >
                  Abort Session
               </Button>
               <Button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="flex-1 h-16 rounded-[1.5rem] bg-slate-900 dark:bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all"
               >
                  {loading ? <RefreshCw className="animate-spin" /> : "Commit & Finalize"}
               </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
