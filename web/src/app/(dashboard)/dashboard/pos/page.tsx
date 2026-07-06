"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Clock,
  HandCoins,
  CheckCircle2,
  Save,
  History,
  FileText,
  Printer,
  Download,
  ScanLine,
  Share2,
  MessageSquare,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import domtoimage from "dom-to-image-more";
import { toast } from "sonner";
import { cn, getIndustryColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createSale } from "@/lib/actions/sale";
import { getCustomers } from "@/lib/actions/customer";
import { getCurrentBusiness } from "@/lib/actions/business";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { UnitSelectorModal } from "@/components/pos/UnitSelectorModal";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import { CameraScanner } from "@/components/shared/camera-scanner";

// Elite Product Card
const ProductCard = React.memo(({ p, addItem }: { p: any, addItem: (item: any) => void }) => {
  const isLowStock = p.stockQuantity <= p.minStockLevel;
  const stockPercentage = Math.min((p.stockQuantity / (p.minStockLevel * 5)) * 100, 100);

  return (
    <motion.div 
      layout
      whileTap={{ scale: 0.97 }}
      onClick={() => addItem({ ...p, quantity: 1, price: p.unitPrice })}
      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex flex-col items-center hover:border-primary/40 transition-all cursor-pointer shadow-lg"
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
        
        <div className="absolute bottom-3 right-3 flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
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
  const searchParams = useSearchParams();
  const isHappyHour = searchParams.get("mode") === "happyhour";
  const { cart, addItem, removeItem, updateQuantity, clearCart, total, tax, grandTotal, heldCarts, holdCart, restoreCart, removeHeldCart } = usePOSStore();
  const { isOnline, isSyncing, initialSync } = useOfflineSync();

  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleCameraScan = async (result: string) => {
    if (!result) return;
    try {
      const matched = await db.products
        .filter(p => p.sku === result || p.id === result || (p.metadata && p.metadata.barcode === result))
        .first();

      if (matched) {
        addItem({
          id: matched.id,
          name: matched.name,
          price: matched.unitPrice,
          stock: matched.stockQuantity,
          ratio: 1,
          isExternal: false,
        });
        toast.success(`Scanned: ${matched.name} added to cart!`);
      } else {
        setSearchQuery(result);
        toast.info(`Scanned code: "${result}". Search filters applied.`);
      }
    } catch (e) {
      console.error("Failed to process scan:", e);
      setSearchQuery(result);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | "WALKIN">("WALKIN");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE_MONEY" | "CARD" | "CREDIT">("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID" | "PARTIAL">("PAID");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [creditAmountPaid, setCreditAmountPaid] = useState<string>(""); // partial payment on credit
  const [momoProvider, setMomoProvider] = useState<"ORANGE_MONEY" | "AFRIMONEY">("ORANGE_MONEY");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoRefCode, setMomoRefCode] = useState("");
  const [momoSmsPaste, setMomoSmsPaste] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);

  // Localized SMS Parser Hook
  useEffect(() => {
    if (!momoSmsPaste) return;
    
    // Parse Orange Money / AfriMoney Ref & Amount
    const refMatch = momoSmsPaste.match(/(?:Reference|Ref|TxID|TxId)\s*[:\-]?\s*([A-Za-z0-9\.]+)/i);
    const amountMatch = momoSmsPaste.match(/(?:Le|NLE|Le\s*|NLE\s*)([0-9,]+(?:\.[0-9]{2})?)/i);
    
    if (refMatch && refMatch[1]) {
      setMomoRefCode(refMatch[1]);
      toast.success("Parsed Reference: " + refMatch[1]);
    }
    
    if (amountMatch && amountMatch[1]) {
      const parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
      toast.info(`Parsed Amount from SMS: Le ${parsedAmount.toLocaleString()}`);
    }
  }, [momoSmsPaste]);
  const [loading, setLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
    initialSync();
    fetchBusinessInfo();
  }, []);

  async function fetchBusinessInfo() {
    try {
      const data = await getCurrentBusiness();
      if (data) {
        setBusinessInfo(data);
        localStorage.setItem("offline_business_info", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to load business info:", e);
      const cached = localStorage.getItem("offline_business_info");
      if (cached) {
        try {
          setBusinessInfo(JSON.parse(cached));
        } catch (err) {}
      } else if (session?.user?.businessName) {
        setBusinessInfo({ name: session.user.businessName });
      } else {
        setBusinessInfo({ name: "Protech Assist SL Limited" });
      }
    }
  }

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

  const handleSaveReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const scale = 3;
      const blob = await domtoimage.toBlob(receiptRef.current, {
        width: receiptRef.current.clientWidth * scale,
        height: receiptRef.current.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${receiptRef.current.clientWidth}px`,
          height: `${receiptRef.current.clientHeight}px`,
        },
        quality: 1,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${receiptData?.transactionId || "001"}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Receipt saved as image!");
    } catch(e) {
      toast.error("Failed to save receipt image");
    }
  };

  const handleWhatsAppShare = () => {
    if (!receiptData) return;

    const savedTemplates = localStorage.getItem("comm_templates");
    let template = "Thank you for shopping at {business_name}! Your invoice {invoice_number} of Le {total_amount} is complete. View receipt: {receipt_url}.";
    if (savedTemplates) {
      try {
        template = JSON.parse(savedTemplates).receipt;
      } catch (e) {}
    }

    const receiptUrl = `https://receipt.protech.sl/r/${receiptData.id}`;
    const formattedMessage = template
      .replaceAll("{business_name}", receiptData.businessName || "Our Shop")
      .replaceAll("{invoice_number}", receiptData.id || "INV-NEW")
      .replaceAll("{total_amount}", Math.round(receiptData.total).toLocaleString())
      .replaceAll("{receipt_url}", receiptUrl);

    const phoneInput = prompt("Enter customer phone number (with country code, e.g. 23277123456):");
    if (phoneInput === null) return; 

    const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
    const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone || ""}&text=${encodeURIComponent(formattedMessage)}`;
    window.open(waLink, "_blank");
    toast.success("Redirection to WhatsApp opened!");
  };

  async function handleCheckout() {
    if (cart.length === 0) {
       toast.error("Cart is empty");
       return;
    }
    
    setLoading(true);
    try {
      const isCredit = paymentMethod === "CREDIT";

      if (isCredit && selectedCustomer === "WALKIN") {
         toast.error("A registered customer profile is required for credit sales.");
         setLoading(false);
         return;
      }

      const partialPaid = isCredit ? (parseFloat(creditAmountPaid) || 0) : grandTotal;
      const creditPayStatus: "PAID" | "UNPAID" | "PARTIAL" = isCredit
        ? (partialPaid <= 0 ? "UNPAID" : partialPaid >= grandTotal ? "PAID" : "PARTIAL")
        : "PAID";

      const saleData = {
        items: cart.map(item => ({
          productId: item.isExternal ? undefined : item.id,
          productName: item.name,
          quantity: item.quantity,
          unitId: item.unitId,
          ratio: item.ratio,
          unitPrice: item.price,
          total: item.price * item.quantity,
          isExternalSourced: item.isExternal || false,
          externalSourceName: item.isExternal ? "Network" : undefined,
          externalCostPrice: item.isExternal ? item.price * 0.8 : undefined,
        })),
        totalAmount: grandTotal,
        paymentMethod: isCredit ? "CREDIT" : paymentMethod,
        paymentStatus: isCredit ? creditPayStatus : "PAID",
        customerId: selectedCustomer === "WALKIN" ? undefined : selectedCustomer,
        amountPaid: isCredit ? partialPaid : grandTotal,
        saleNote: isHappyHour ? "HAPPY HOUR SALE" : undefined,
      };

      let result;
      if (isOnline) {
        result = await createSale(saleData);
      } else {
        // Offline Flow: cache locally in IndexedDB
        const localSaleId = `INV-LOCAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        await db.pendingSales.add({
          items: saleData.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            isExternalSourced: item.isExternalSourced,
            externalSourceName: item.externalSourceName,
            externalCostPrice: item.externalCostPrice,
          })),
          totalAmount: saleData.totalAmount,
          paymentMethod: saleData.paymentMethod,
          paymentStatus: saleData.paymentStatus,
          amountPaid: saleData.amountPaid,
          customerId: saleData.customerId,
          createdAt: Date.now(),
          synced: 0 as any, // 0 is synced status in Dexie query
        });

        // Deduct local Dexie quantities
        for (const item of saleData.items) {
          if (item.productId) {
            const localProd = await db.products.get(item.productId);
            if (localProd) {
              const newQty = Math.max(0, localProd.stockQuantity - item.quantity);
              await db.products.update(item.productId, { stockQuantity: newQty });
            }
          }
        }

        result = {
          success: true,
          saleId: localSaleId,
        };
        
        toast.warning("Offline mode: Transaction saved locally.", {
          description: "This sale will automatically sync when internet connection is restored."
        });
      }

      if (result.success) {
        const msg = isCredit && creditPayStatus !== "PAID"
          ? `Credit sale recorded. Outstanding: Le ${Math.round(grandTotal - partialPaid).toLocaleString()}`
          : isOnline ? "Transaction finalized." : "Offline transaction finalized.";
        toast.success(msg);
        
        // Prepare Receipt
        const customerObj = customers.find(c => c.id === selectedCustomer);
        setReceiptData({
          id: result.saleId,
          items: cart,
          total: grandTotal,
          paid: isCredit ? partialPaid : grandTotal,
          paymentMethod: isCredit ? "CREDIT" : paymentMethod,
          cashierName: session?.user?.name,
          customerName: customerObj?.name || "WALKIN",
          transactionId: result.saleId || undefined,
          businessName: businessInfo?.name || session?.user?.businessName || "Protech Assist SL Limited",
          businessAddress: businessInfo?.address || undefined,
          businessPhone: businessInfo?.phone || undefined
        });

        clearCart();
        setIsCheckoutOpen(false);
        setIsCartVisible(false);
        setCreditAmountPaid("");
        setMomoRefCode("");
        setMomoPhone("");
        setMomoSmsPaste("");
        setPaymentMethod("CASH");

        // Open professional receipt modal after a tiny delay
        setTimeout(() => {
          setIsReceiptModalOpen(true);
        }, 300);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Printable Receipt (Rendered off-screen for accurate snapshotting and printing) */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none print:opacity-100 print:z-[9999]">
        {receiptData && (
          <ThermalReceipt 
            id={receiptData.id}
            ref={receiptRef}
            items={receiptData.items}
            total={receiptData.total}
            paid={receiptData.paid}
            paymentMethod={receiptData.paymentMethod}
            cashierName={receiptData.cashierName}
            customerName={receiptData.customerName}
            transactionId={receiptData.transactionId}
            businessName={receiptData.businessName}
            businessAddress={receiptData.businessAddress}
            businessPhone={receiptData.businessPhone}
          />
        )}
      </div>

      {/* Main App (Hidden from print) */}
      <div className="flex flex-col xl:flex-row h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans print:hidden">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 shadow-2xl relative z-10 xl:rounded-r-[4rem] overflow-hidden border-r border-slate-100 dark:border-slate-800">
        <header className="p-4 sm:p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 relative bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
             <div className="relative group">
                <div className="h-12 w-12 rounded-[1.5rem] bg-slate-900 dark:bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 animate-pulse" />
             </div>
             <div>
                <h1 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Commerce <span className="text-primary underline decoration-indigo-50">Hub</span></h1>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">{isOnline ? "Neural Network Linked" : "Local Engine Mode"}</p>
                </div>
             </div>
          </div>
          {/* Happy Hour Banner */}
          {isHappyHour && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 animate-pulse">
              <Sparkles className="h-4 w-4 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-[1000] uppercase tracking-[0.3em]">Happy Hour</span>
                <span className="text-[8px] font-bold opacity-80">Special pricing active</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 w-full lg:w-auto">
             <Button variant="outline" size="sm" onClick={initialSync} disabled={isSyncing} className="flex-1 lg:flex-none h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest gap-2">
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin text-primary")} />
                African Trade Sync
             </Button>
             <Button onClick={() => router.back()} variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-300 hover:text-rose-500 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50">
                <X size={20} />
             </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-4 shrink-0 bg-white dark:bg-slate-900 z-20">
           <div className="relative group max-w-4xl mx-auto w-full">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                 <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              </div>
              <Input 
                placeholder="Scan identification or search assets by name/SKU..." 
                className="h-16 pl-16 pr-8 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 font-black text-sm uppercase tracking-widest shadow-sm focus:shadow-md transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div 
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md"
                onClick={() => setShowScanner(true)}
              >
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:block" />
                 <ScanLine className="h-4 w-4 text-indigo-500 sm:hidden" />
                 <span className="hidden sm:inline text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Tap to Scan</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
              <Button 
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shrink-0 transition-all gap-2", 
                   selectedCategory === null ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xl" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                     selectedCategory === cat.id ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xl" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-48 xl:pb-10 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
           {filteredProducts?.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
                <div className="h-32 w-32 bg-white dark:bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-50 dark:border-slate-800 relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                   <Package className="h-12 w-12 text-slate-100 dark:text-slate-800 animate-pulse relative z-10" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Deficit</h3>
                   <p className="text-[10px] text-slate-400 font-[1000] uppercase tracking-[0.3em] max-w-[280px] leading-relaxed">No asset signatures match your current query in the Africa trade vault</p>
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
        "fixed xl:relative bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 xl:w-[550px] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] xl:shadow-none border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 transition-all duration-300 xl:overflow-hidden flex flex-col",
        isCartVisible ? "h-[90vh] xl:h-full translate-y-0" : "h-[90px] xl:h-full translate-y-0"
      )}>
        {/* Cart Header (Mobile Toggle) */}
        <div 
          className="h-[90px] px-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0 cursor-pointer xl:cursor-default bg-white dark:bg-slate-900 z-10"
          onClick={() => !isCartVisible && setIsCartVisible(true)}
        >
           <div className="flex items-center gap-5">
              <div className="relative group">
                 <div className={cn("h-14 w-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500", cart.length > 0 ? "bg-primary text-white dark:text-primary-foreground scale-110" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500")}>
                   <Receipt className="h-7 w-7" />
                 </div>
                 {cart.length > 0 && (
                   <span className="absolute -top-2 -right-2 h-7 w-7 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white dark:text-white text-[11px] font-[1000] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
                 )}
              </div>
              <div>
                 <h2 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Current <span className="text-primary">Sale</span></h2>
                 <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Cart Items</p>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right mr-2 hidden sm:block">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Total</p>
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
                className="hidden xl:flex h-12 w-12 rounded-2xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all relative"
                onClick={() => setIsHeldCartsOpen(true)}
                title="View Held Carts"
              >
                <History size={24} />
                {heldCarts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                    {heldCarts.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="hidden xl:flex h-12 w-12 rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                onClick={() => holdCart("")}
                disabled={cart.length === 0}
                title="Hold Active Cart"
              >
                <Save size={24} />
              </Button>
              <Button 
                variant="ghost" 
                className="hidden xl:flex h-12 w-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                onClick={() => clearCart()}
                title="Clear Active Cart"
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
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Your cart is empty.</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">Add products to begin checkout</p>
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
                    <div className="relative h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
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
                                  className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shadow-sm"
                              >
                                  <Minus size={16} />
                              </button>
                              <span className="text-[12px] font-black w-10 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                              <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all shadow-sm"
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
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">Subtotal</span>
                 <span className="text-sm font-[1000] text-slate-700 dark:text-slate-300 tracking-tighter">Le {Math.round(total).toLocaleString()}</span>
              </div>
            
              <div className="h-px bg-slate-50 dark:bg-slate-800 w-full my-6" />
              <div className="flex justify-between items-end relative">
                 <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full hidden sm:block" />
                 <div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-3">Grand Total</p>
                    <p className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none">Le {Math.round(grandTotal).toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ready to Checkout</span>
                 </div>
              </div>
           </div>

           <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
               className="w-full h-20 sm:h-24 rounded-[2.5rem] bg-slate-900 text-white dark:bg-indigo-600 dark:text-white font-[1000] text-xs sm:text-sm uppercase tracking-[0.4em] shadow-2xl hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
              Proceed to Checkout <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500" />
           </Button>
        </div>
      </div>
      
      {/* SECURE CHECKOUT MODAL */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] rounded-[2rem] sm:rounded-[4rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 max-h-[95vh] flex flex-col">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-black p-6 sm:p-10 text-white relative overflow-hidden shrink-0 border-b border-white/5">
               <div className="absolute -top-20 -right-20 h-64 w-64 bg-indigo-500/20 rounded-full blur-[80px]" />
               <div className="absolute top-10 left-10 h-32 w-32 bg-blue-500/10 rounded-full blur-[50px]" />
               <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
               
               <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                     <Badge variant="outline" className="bg-white/5 border-white/10 text-indigo-300 text-[10px] font-black rounded-xl h-7 px-4 uppercase tracking-[0.3em] backdrop-blur-md">Secure Checkout</Badge>
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-[1000] tracking-tighter uppercase italic leading-none drop-shadow-xl">
                     Final <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Checkout</span>
                  </h3>
                  <div className="flex items-center gap-4 pt-4 sm:pt-6">
                     <div className="flex -space-x-4 drop-shadow-2xl">
                        {cart.slice(0, 3).map((item, i) => (
                           <div key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl relative ring-2 ring-white/10">
                              {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized /> : <Package className="h-5 w-5 text-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                           </div>
                        ))}
                        {cart.length > 3 && (
                           <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[10px] font-black z-10 shadow-2xl ring-2 ring-white/10">+{cart.length - 3}</div>
                        )}
                     </div>
                     <div className="h-8 w-px bg-white/10" />
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-white tracking-widest uppercase">{cart.length} Items in Cart</span>
                        <span className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest mt-1">Ready for payment processing</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8 sm:space-y-12 bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar flex-1">
               {/* Customer Node Selection */}
               <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                           <User size={18} />
                        </div>
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Customer Details</Label>
                     </div>
                     <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ New Customer</button>
                  </div>
                  <Select value={selectedCustomer} onValueChange={(val) => setSelectedCustomer(val || "WALKIN")}>
                    <SelectTrigger className="h-16 sm:h-20 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-black text-sm uppercase tracking-widest shadow-sm">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-2xl p-2">
                      <SelectItem value="WALKIN" className="font-black uppercase tracking-widest py-4 text-xs rounded-xl focus:bg-primary/5">Walk-in Customer</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-black uppercase tracking-widest py-4 text-xs rounded-xl focus:bg-primary/5">{c.name} ({c.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               {/* Settlement Vector Matrix */}
               <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 px-2">
                     <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                        <Banknote size={18} />
                     </div>
                     <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Payment Method</Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                     {[
                       { id: 'CASH', label: 'CASH', icon: Banknote, color: 'text-emerald-500', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800', active: 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-transparent text-white shadow-[0_10px_30px_rgba(52,211,153,0.4)]' },
                       { id: 'MOBILE_MONEY', label: 'MOBILE MONEY', icon: Smartphone, color: 'text-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800', active: 'bg-gradient-to-br from-blue-400 to-blue-600 border-transparent text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)]' },
                       { id: 'CARD', label: 'CARD', icon: CardIcon, color: 'text-indigo-500', bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 dark:hover:border-indigo-800', active: 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-transparent text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)]' },
                       { id: 'CREDIT', label: 'CREDIT', icon: HandCoins, color: 'text-amber-500', bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-800', active: 'bg-gradient-to-br from-amber-400 to-amber-600 border-transparent text-white shadow-[0_10px_30px_rgba(245,158,11,0.4)]' },
                     ].map((m) => (
                       <button
                         key={m.id}
                         onClick={() => {
                           setPaymentMethod(m.id as any);
                           if (m.id !== 'CREDIT') setCreditAmountPaid("");
                         }}
                         className={cn(
                           "flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all duration-300 active:scale-95 relative group overflow-hidden",
                           paymentMethod === m.id 
                             ? m.active + " scale-105 z-10" 
                             : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 " + m.bg
                         )}
                       >
                         {paymentMethod !== m.id && (
                            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                         )}
                         <m.icon className={cn("h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-500 group-hover:scale-125 relative z-10", paymentMethod === m.id ? "text-white" : m.color)} />
                         <span className={cn("text-[10px] font-[1000] uppercase tracking-[0.2em] text-center leading-tight relative z-10", paymentMethod === m.id ? "text-white" : "text-slate-600 dark:text-slate-400")}>{m.label}</span>
                         {paymentMethod === m.id && (
                           <motion.div layoutId="paymentActiveIndicator" className="absolute top-3 right-3 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                         )}
                       </button>
                     ))}
                  </div>

                  {/* Mobile Money Verification Panel */}
                  {paymentMethod === 'MOBILE_MONEY' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[2rem] border-2 border-blue-150 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/10 p-6 sm:p-8 space-y-5"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-blue-500 shrink-0" />
                        <p className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Mobile Money Reconciliation</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMomoProvider("ORANGE_MONEY")}
                          className={cn(
                            "py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all",
                            momoProvider === "ORANGE_MONEY"
                              ? "bg-orange-500 border-transparent text-white shadow-lg shadow-orange-500/20"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500"
                          )}
                        >
                          Orange Money
                        </button>
                        <button
                          type="button"
                          onClick={() => setMomoProvider("AFRIMONEY")}
                          className={cn(
                            "py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all",
                            momoProvider === "AFRIMONEY"
                              ? "bg-blue-600 border-transparent text-white shadow-lg shadow-blue-600/20"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500"
                          )}
                        >
                          AfriMoney
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Code / Ref</Label>
                          <Input
                            placeholder="e.g. CO260623.1301.A102"
                            value={momoRefCode}
                            onChange={(e) => setMomoRefCode(e.target.value)}
                            className="h-12 rounded-xl border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-900 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payer Phone (Optional)</Label>
                          <Input
                            placeholder="+232 77 123456"
                            value={momoPhone}
                            onChange={(e) => setMomoPhone(e.target.value)}
                            className="h-12 rounded-xl border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-blue-100/50 dark:border-blue-900/20">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between">
                          <span>Quick-Parse SMS Confirmation</span>
                          <span className="text-[9px] text-blue-500 font-black lowercase">Paste SMS text here</span>
                        </Label>
                        <Textarea
                          placeholder="Paste Orange Money or AfriMoney confirmation message here..."
                          value={momoSmsPaste}
                          onChange={(e) => setMomoSmsPaste(e.target.value)}
                          className="rounded-xl border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-900 text-[11px] p-3 min-h-[60px]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Credit Panel */}
                  {paymentMethod === 'CREDIT' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[2rem] border-2 border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-6 sm:p-8 space-y-5"
                    >
                      {selectedCustomer === 'WALKIN' ? (
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={18} className="shrink-0" />
                          <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                            A registered customer is required to issue credit. Select a customer above.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                            <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Credit Sale — Debt will be recorded</p>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Upfront Payment (optional)</Label>
                            <div className="relative">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">Le</span>
                              <Input
                                type="number"
                                min="0"
                                max={grandTotal}
                                placeholder="0"
                                value={creditAmountPaid}
                                onChange={(e) => setCreditAmountPaid(e.target.value)}
                                className="pl-10 h-14 rounded-2xl border-amber-100 dark:border-amber-900/40 bg-white dark:bg-slate-900 font-black text-sm text-right tracking-widest"
                              />
                            </div>
                          </div>
                          <div className="pt-2 space-y-3 border-t border-amber-100 dark:border-amber-900/30">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Owed</span>
                              <span className="text-sm font-[1000] text-slate-800 dark:text-white tracking-tighter">Le {Math.round(grandTotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upfront Paid</span>
                              <span className="text-sm font-[1000] text-emerald-600 tracking-tighter">Le {Math.round(parseFloat(creditAmountPaid) || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-amber-200 dark:border-amber-900/40">
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Outstanding Debt</span>
                              <span className="text-lg font-[1000] text-amber-600 dark:text-amber-400 tracking-tighter">
                                Le {Math.round(Math.max(0, grandTotal - (parseFloat(creditAmountPaid) || 0))).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
               </div>

               {/* Settlement Stats Analytics */}
               <div className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-slate-900 to-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                     <TrendingUp size={180} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="space-y-4 sm:space-y-6 relative z-10">
                     <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] drop-shadow-md">Total Amount Due</span>
                        <span className="text-3xl sm:text-5xl font-[1000] tracking-tighter drop-shadow-2xl">Le {Math.round(grandTotal).toLocaleString()}</span>
                     </div>
                     <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse shadow-lg", paymentMethod === 'CREDIT' && selectedCustomer !== 'WALKIN' && (parseFloat(creditAmountPaid) || 0) < grandTotal ? "bg-amber-400 shadow-amber-400/50" : "bg-emerald-400 shadow-emerald-400/50")} />
                           <span className={cn("text-[11px] font-black uppercase tracking-[0.4em]", paymentMethod === 'CREDIT' && selectedCustomer !== 'WALKIN' && (parseFloat(creditAmountPaid) || 0) < grandTotal ? "text-amber-400" : "text-emerald-400")}>
                             {paymentMethod === 'CREDIT' ? 'Credit Outstanding' : 'Resolved Balance'}
                           </span>
                        </div>
                        <span className={cn("text-2xl sm:text-3xl font-[1000] tracking-tighter drop-shadow-xl", paymentMethod === 'CREDIT' ? "text-amber-400" : "text-emerald-400")}>
                          {paymentMethod === 'CREDIT'
                            ? `Le ${Math.round(Math.max(0, grandTotal - (parseFloat(creditAmountPaid) || 0))).toLocaleString()}`
                            : 'Le 0'
                          }
                        </span>
                     </div>
                     {paymentMethod === 'CREDIT' && (parseFloat(creditAmountPaid) || 0) > 0 && (
                       <div className="flex justify-between items-center pt-3 border-t border-white/10">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Upfront Collected</span>
                         <span className="text-xl font-[1000] text-emerald-400 tracking-tighter drop-shadow-md">Le {Math.round(parseFloat(creditAmountPaid) || 0).toLocaleString()}</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col sm:flex-row gap-4 sm:gap-5 bg-white dark:bg-slate-950 relative z-10 shrink-0 border-t border-slate-100 dark:border-slate-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
               <Button 
                  variant="outline" 
                  className="flex-1 h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  onClick={() => setIsCheckoutOpen(false)}
               >
                  Cancel
               </Button>
               <Button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="flex-[2] h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white font-[1000] uppercase text-[10px] sm:text-[11px] tracking-[0.4em] shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.6)] hover:scale-[1.02] disabled:opacity-50 transition-all duration-300 bg-[length:200%_auto] animate-gradient"
               >
                  {loading ? <RefreshCw className="animate-spin" /> : (
                    <span className="flex items-center gap-3 drop-shadow-md">Complete Checkout <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500" /></span>
                  )}
               </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* HELD CARTS MODAL */}
      <Dialog open={isHeldCartsOpen} onOpenChange={setIsHeldCartsOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-10 bg-white dark:bg-slate-950 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Held Carts</h3>
            <Badge variant="outline" className="text-indigo-500 border-indigo-500/30">{heldCarts.length} Paused</Badge>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {heldCarts.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No ledgers on hold</p>
              </div>
            ) : (
              heldCarts.map((hc) => (
                <div key={hc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{hc.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(hc.timestamp).toLocaleTimeString()} - {hc.items.length} Assets</p>
                    </div>
                    <span className="text-sm font-[1000] text-primary">Le {Math.round(hc.total).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        restoreCart(hc.id);
                        setIsHeldCartsOpen(false);
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] tracking-widest uppercase rounded-xl"
                    >
                      Restore Session
                    </Button>
                    <Button 
                      onClick={() => removeHeldCart(hc.id)}
                      variant="outline"
                      className="text-rose-500 hover:bg-rose-50 border-rose-100 hover:text-rose-600 font-black text-[10px] tracking-widest uppercase rounded-xl"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PROFESSIONAL RECEIPT MODAL */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-[450px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-10 bg-slate-100 dark:bg-slate-900 flex flex-col items-center gap-6 print:hidden">
          <div className="text-center space-y-2">
            <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Success</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction has been finalized</p>
          </div>
          
          <div className="w-full max-h-[40vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 text-black dark:text-slate-100 p-4 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800">
             {/* Render a visual preview of the receipt component without refs */}
             {receiptData && (
               <ThermalReceipt 
                 id={receiptData.id}
                 items={receiptData.items}
                 total={receiptData.total}
                 paid={receiptData.paid}
                 paymentMethod={receiptData.paymentMethod}
                 cashierName={receiptData.cashierName}
                 customerName={receiptData.customerName}
                 transactionId={receiptData.transactionId}
                 businessName={receiptData.businessName}
                 businessAddress={receiptData.businessAddress}
                 businessPhone={receiptData.businessPhone}
               />
             )}
          </div>

          <div className="flex w-full gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
             <Button 
               variant="outline"
               onClick={() => setIsReceiptModalOpen(false)}
               className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase border-slate-300 dark:border-slate-700"
             >
               Dismiss
             </Button>
             <Button 
               variant="outline"
               onClick={handleSaveReceipt}
               className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
             >
               <Download className="mr-2 h-4 w-4" /> Save
             </Button>
             <Button 
               variant="outline"
               onClick={handleWhatsAppShare}
               className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
             >
               <Share2 className="mr-2 h-4 w-4" /> Share
             </Button>
             <Button 
               onClick={() => window.print()}
               className="flex-[1.2] h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xl hover:scale-105 transition-transform"
             >
               <Printer className="mr-2 h-4 w-4" /> Print
             </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      <CameraScanner 
        open={showScanner} 
        onOpenChange={setShowScanner} 
        onScan={handleCameraScan} 
      />
    </>
  );
}
