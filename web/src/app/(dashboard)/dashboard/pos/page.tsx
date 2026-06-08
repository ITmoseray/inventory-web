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
  Package,
  ShieldCheck,
  User,
  Banknote,
  Receipt,
  TrendingUp,
  Wallet,
  Smartphone,
  CreditCard as CardIcon,
  ArrowRight,
  ChevronDown,
  Activity,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { cn, getIndustryColor } from "@/lib/utils";
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
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

// Elite Product Card
const ProductCard = React.memo(({ p, addItem }: { p: any, addItem: any }) => {
  const isLowStock = p.stockQuantity <= p.minStockLevel;
  const stockPercentage = Math.min((p.stockQuantity / (p.minStockLevel * 5)) * 100, 100);

  return (
    <motion.div 
      layout
      whileTap={{ scale: 0.97 }}
      onClick={() => addItem({ id: p.id, name: p.name, price: p.unitPrice, quantity: 1, imageUrl: p.imageUrl })}
      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex flex-col items-center hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden" 
    >
      <div className="relative aspect-square w-full rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden mb-3 sm:mb-4 shadow-inner border border-slate-100 dark:border-slate-800">
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
             <Package className="h-10 w-10 text-slate-100 dark:text-slate-800 group-hover:scale-110 transition-transform" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           {isLowStock && (
             <div className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Low Stock</div>
           )}
        </div>
        
        <div className="absolute bottom-3 right-3 flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
          <Plus size={24} />
        </div>
      </div>
      
      <div className="w-full space-y-3">
        <div className="flex flex-col gap-0.5">
           <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{p.name}</span>
           <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{p.category?.name || "CORE ASSET"}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
           <div className="flex flex-col">
              <span className="text-[12px] sm:text-sm font-[1000] text-primary tracking-tighter">Le {Math.round(p.unitPrice).toLocaleString()}</span>
           </div>
           <div className="flex-1 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                 <span className={cn("text-[10px] font-black tracking-tighter", isLowStock ? "text-rose-500" : "text-slate-700 dark:text-slate-300")}>{p.stockQuantity}</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nodes</span>
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stockPercentage}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000", isLowStock ? "bg-rose-500" : "bg-emerald-500")}
                 />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
});
ProductCard.displayName = "ProductCard";

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
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE_MONEY" | "CARD">("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

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
        paymentStatus: "PAID",
        customerId: selectedCustomer === "WALKIN" ? undefined : selectedCustomer,
        amountPaid: grandTotal,
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
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 shadow-2xl relative z-10 xl:rounded-r-[4rem] overflow-hidden border-r border-slate-100 dark:border-slate-800">
        <header className="p-6 sm:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shrink-0 relative bg-white dark:bg-slate-900/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
             <div className="relative group">
                <div className="h-16 w-16 rounded-[2rem] bg-slate-900 dark:bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 animate-pulse" />
             </div>
             <div>
                <h1 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Commerce <span className="text-primary underline decoration-indigo-500/30 underline-offset-8">Hub</span></h1>
                <div className="flex items-center gap-2 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{isOnline ? "Neural Network Linked" : "Local Engine Mode"}</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <Button variant="outline" size="lg" onClick={initialSync} disabled={isSyncing} className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-[1000] uppercase tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin text-primary")} />
                African Trade Sync
             </Button>
             <Button onClick={() => router.back()} variant="ghost" className="h-14 w-14 p-0 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-300 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                <X size={24} />
             </Button>
          </div>
        </header>

        <div className="p-6 sm:p-10 space-y-6 shrink-0 bg-white dark:bg-slate-900 z-20">
           <div className="relative group max-w-4xl mx-auto w-full">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                 <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              </div>
              <Input 
                placeholder="Scan identification or search assets by name/SKU..." 
                className="h-16 pl-16 pr-8 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 font-black text-sm uppercase tracking-widest shadow-inner focus:ring-4 focus:ring-primary/5 transition-all" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                 <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scanner Ready</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
              <Button 
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shrink-0 transition-all gap-2", 
                  selectedCategory === null ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <LayoutGrid size={16} /> All Channels
              </Button>
              {categories?.map((cat) => (
                <Button 
                  key={cat.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shrink-0 transition-all", 
                    selectedCategory === cat.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-48 xl:pb-10 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
           {filteredProducts?.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
                <div className="h-32 w-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-50 dark:border-slate-800 relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                   <Package className="h-12 w-12 text-slate-100 dark:text-slate-800 animate-pulse relative z-10" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Deficit</h3>
                   <p className="text-[10px] text-slate-400 font-[1000] uppercase tracking-[0.3em] max-w-[280px] leading-relaxed">No asset signatures match your current query in the Africa trade vault.</p>
                </div>
             </div>
           ) : (
             <motion.div 
               initial={false}
               className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-8 mt-4 pb-20"
             >
                <AnimatePresence mode="popLayout">
                  {filteredProducts?.map((p) => (
                      <ProductCard key={p.id} p={p} addItem={addItem} />
                  ))}
                </AnimatePresence>
             </motion.div>
           )}
        </div>
      </div>

      {/* The Intelligence Ledger (Cart) */}
      <div className={cn(
        "fixed xl:relative bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 xl:w-[550px] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] xl:shadow-none border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isCartVisible ? "h-[90vh] xl:h-full translate-y-0" : "h-[90px] xl:h-full translate-y-0"
      )}>
        {/* Cart Header (Mobile Toggle) */}
        <div 
          className="h-[90px] px-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0 cursor-pointer xl:cursor-default bg-white dark:bg-slate-900 z-10"
          onClick={() => !isCartVisible && setIsCartVisible(true)}
        >
           <div className="flex items-center gap-5">
              <div className="relative group">
                 <div className={cn("h-14 w-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500", cart.length > 0 ? "bg-primary text-white scale-110" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                   <Receipt className="h-7 w-7" />
                 </div>
                 {cart.length > 0 && (
                   <span className="absolute -top-2 -right-2 h-7 w-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-[1000] flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl animate-in zoom-in duration-300">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
                 )}
              </div>
              <div>
                 <h2 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Intelligence <span className="text-primary">Ledger</span></h2>
                 <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Settlement Stream</p>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right mr-2 hidden sm:block">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Accumulated Yield</p>
                 <p className="text-2xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(total).toLocaleString()}</p>
              </div>
              <Button 
                variant="ghost" 
                className="xl:hidden h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartVisible(!isCartVisible);
                }}
              >
                <ChevronDown className={cn("transition-transform duration-500", isCartVisible ? "" : "rotate-180")} size={24} />
              </Button>
              <Button 
                variant="ghost" 
                className="hidden xl:flex h-12 w-12 rounded-2xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all border border-transparent hover:border-rose-100"
                onClick={() => clearCart()}
                title="Purge Active Ledger"
              >
                <Trash2 size={24} />
              </Button>
           </div>
        </div>

        {/* Ledger Items (Receipt Style) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar relative">
           <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
           
           <AnimatePresence mode="popLayout" initial={false}>
             {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6 opacity-30">
                  <Activity className="h-16 w-16 text-slate-400 animate-pulse" />
                  <div className="space-y-2">
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Listening for trade inputs...</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">Initialize terminal to begin ledger sync</p>
                  </div>
               </div>
             ) : (
               cart.map((item, idx) => (
                 <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, x: 30, scale: 0.95 }}
                   animate={{ opacity: 1, x: 0, scale: 1 }}
                   exit={{ opacity: 0, x: -30, scale: 0.95 }}
                   transition={{ type: "spring", stiffness: 300, damping: 25 }}
                   className="flex items-center gap-6 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-xl shadow-black/[0.02] border border-slate-50 dark:border-slate-800 relative group"
                 >
                    <div className="relative h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized /> : <Package size={28} className="text-slate-100 dark:text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-col gap-0.5">
                           <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase truncate tracking-tight group-hover:text-primary transition-colors">{item.name}</div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Node: {item.id.toString().slice(-6)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl p-1 shadow-inner border border-slate-100 dark:border-slate-800">
                              <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm active:scale-75"
                              >
                                  <Minus size={16} />
                              </button>
                              <span className="text-[12px] font-black w-10 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                              <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-indigo-50 transition-all shadow-sm active:scale-75"
                              >
                                  <Plus size={16} />
                              </button>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[12px] font-black text-slate-900 dark:text-white tracking-tighter">Le {Math.round(item.price * item.quantity).toLocaleString()}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Le {Math.round(item.price).toLocaleString()} / UNIT</span>
                           </div>
                        </div>
                    </div>
                    <button 
                       onClick={() => removeItem(item.id)} 
                       className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                    >
                       <X size={20} />
                    </button>
                 </motion.div>
               ))
             )}
           </AnimatePresence>
        </div>

        {/* Professional Settlement Summary */}
        <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-10 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] xl:rounded-bl-[4rem]">
           <div className="space-y-4">
              <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">Subtotal Settlement</span>
                 <span className="text-sm font-[1000] text-slate-700 dark:text-slate-300 tracking-tighter">Le {Math.round(total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">Assessed Tax (15%)</span>
                 <span className="text-sm font-[1000] text-slate-700 dark:text-slate-300 tracking-tighter">Le {Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-50 dark:bg-slate-800 w-full my-6" />
              <div className="flex justify-between items-end relative">
                 <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full hidden sm:block" />
                 <div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-3">Grand Terminal Total</p>
                    <p className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none">Le {Math.round(grandTotal).toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Valid Transaction</span>
                 </div>
              </div>
           </div>

           <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-20 sm:h-24 rounded-[2.5rem] bg-slate-900 text-white dark:bg-primary font-[1000] text-xs sm:text-sm uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all group gap-6 border-b-8 border-slate-950 dark:border-indigo-700"
           >
              Execute Settlement Node <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500" />
           </Button>
        </div>
      </div>
      
      {/* SECURE CHECKOUT MODAL */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] rounded-[4rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
            <div className="bg-slate-950 p-10 sm:p-14 text-white relative overflow-hidden shrink-0">
               <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] rotate-12">
                  <ShieldCheck size={400} />
               </div>
               <div className="absolute inset-0 bg-grid-pattern opacity-5" />
               <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                     <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-[10px] font-black rounded-xl h-8 px-5 uppercase tracking-[0.3em]">Secure Terminal</Badge>
                     <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-[1000] tracking-tighter uppercase italic leading-none">Global <span className="text-indigo-500 underline underline-offset-8 decoration-white/10">Settlement</span></h3>
                  <div className="flex items-center gap-4 pt-6">
                     <div className="flex -space-x-4">
                        {cart.slice(0, 3).map((item, i) => (
                           <div key={i} className="h-12 w-12 rounded-2xl border-4 border-slate-950 bg-slate-900 overflow-hidden shadow-2xl relative">
                              {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized /> : <Package className="h-5 w-5 text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                           </div>
                        ))}
                        {cart.length > 3 && (
                           <div className="h-12 w-12 rounded-2xl border-4 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black z-10 shadow-2xl">+{cart.length - 3}</div>
                        )}
                     </div>
                     <div className="h-8 w-px bg-slate-800" />
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-white tracking-widest uppercase">{cart.length} Asset Clusters</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ready for cryptographic commitment</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 sm:p-14 space-y-12 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {/* Customer Node Selection */}
               <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                           <User size={18} />
                        </div>
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Entity Resolution</Label>
                     </div>
                     <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ New Intelligence Node</button>
                  </div>
                  <Select value={selectedCustomer} onValueChange={(val) => setSelectedCustomer(val || "WALKIN")}>
                    <SelectTrigger className="h-20 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-black text-sm uppercase tracking-widest shadow-inner px-8 focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Identify Transacting Node" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-2xl p-2">
                      <SelectItem value="WALKIN" className="font-black uppercase tracking-widest py-4 text-xs rounded-xl focus:bg-primary/5">Anonymous Retail Node</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-black uppercase tracking-widest py-4 text-xs rounded-xl focus:bg-primary/5">{c.name} ({c.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               {/* Settlement Vector Matrix */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                     <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                        <Banknote size={18} />
                     </div>
                     <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Settlement Matrix</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                     {[
                       { id: 'CASH', label: 'Paper Currency', icon: Banknote, color: 'text-emerald-500', bg: 'hover:bg-emerald-50' },
                       { id: 'MOBILE_MONEY', label: 'Neural Digital', icon: Smartphone, color: 'text-blue-500', bg: 'hover:bg-blue-50' },
                       { id: 'CARD', label: 'Asset Card', icon: CardIcon, color: 'text-indigo-500', bg: 'hover:bg-indigo-50' }
                     ].map((m) => (
                       <button
                         key={m.id}
                         onClick={() => setPaymentMethod(m.id as any)}
                         className={cn(
                           "flex flex-col items-center justify-center gap-5 p-8 rounded-[2.5rem] border-2 transition-all active:scale-90 shadow-sm relative group overflow-hidden",
                           paymentMethod === m.id 
                             ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xl scale-105 z-10" 
                             : "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-400 " + m.bg
                         )}
                       >
                         <m.icon size={32} className={cn("transition-transform group-hover:scale-110", paymentMethod === m.id ? "" : m.color)} />
                         <span className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-center leading-tight">{m.label}</span>
                         {paymentMethod === m.id && (
                           <motion.div layoutId="paymentActive" className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                         )}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Settlement Stats Analytics */}
               <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                     <TrendingUp size={150} />
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Settlement Debt</span>
                        <span className="text-3xl font-[1000] tracking-tighter">Le {Math.round(grandTotal).toLocaleString()}</span>
                     </div>
                     <div className="h-px bg-white/10 w-full" />
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em]">Resolved Balance</span>
                        </div>
                        <span className="text-3xl font-[1000] text-emerald-500 tracking-tighter">Le 0</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 sm:p-14 pt-0 flex flex-col sm:flex-row gap-5 bg-white dark:bg-slate-950 relative z-10">
               <Button 
                  variant="outline" 
                  className="flex-1 h-20 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" 
                  onClick={() => setIsCheckoutOpen(false)}
               >
                  Purge Session
               </Button>
               <Button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="flex-[2] h-20 rounded-[2rem] bg-slate-900 dark:bg-primary text-white font-[1000] uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.03] transition-all group gap-4 active:scale-95"
               >
                  {loading ? <RefreshCw className="animate-spin" /> : (
                    <>Commit Neural Settlement <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>
                  )}
               </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
