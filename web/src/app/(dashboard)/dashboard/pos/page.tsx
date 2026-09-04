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
  ShoppingBag,
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
import { createDraft, updateDraft, getDrafts, deleteDraft } from "@/lib/actions/drafts";
import { getCustomers, createCustomer } from "@/lib/actions/customer";
import { getCurrentBusiness } from "@/lib/actions/business";
import { getPendingPrescriptions } from "@/lib/actions/prescription";
import { getCurrentSession, openSession } from "@/lib/actions/cash-register";
import { getProducts } from "@/lib/actions/product";
import { getCategories } from "@/lib/actions/category";
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
import { MedicalBillsModal } from "@/components/pos/MedicalBillsModal";
import { CloseRegisterModal } from "@/components/pos/CloseRegisterModal";
import { CategorySidebar } from "@/components/pos/CategorySidebar";

// Elite Product Card
const ProductCard = React.memo(({ p, addItem }: { p: any, addItem: (item: any) => void }) => {
  const isOutOfStock = p.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && p.stockQuantity <= p.minStockLevel;
  const stockPercentage = isOutOfStock ? 0 : Math.min((p.stockQuantity / (p.minStockLevel * 5)) * 100, 100);

  const handleClick = () => {
    if (isOutOfStock) {
      toast.error(`"${p.name}" is OUT OF STOCK and cannot be added.`);
      return;
    }
    addItem({ ...p, quantity: 1, price: p.unitPrice });
  };

  return (
    <motion.div 
      layout
      whileTap={isOutOfStock ? {} : { scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex flex-col items-center transition-all shadow-lg",
        isOutOfStock 
          ? "opacity-60 grayscale cursor-not-allowed bg-slate-50/50 dark:bg-slate-950/40" 
          : "hover:border-primary/40 cursor-pointer"
      )}
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
           {isOutOfStock ? (
             <div className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">OUT OF STOCK</div>
           ) : isLowStock ? (
             <div className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Low Stock</div>
           ) : null}
           {p.requiresPrescription && (
             <div className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
               <ShieldCheck size={10} /> RX REQ
             </div>
           )}
           {p.genericAlternative && (
             <div className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg max-w-[100px] truncate" title={p.genericAlternative}>
               ALT: {p.genericAlternative}
             </div>
           )}
        </div>
        
        {!isOutOfStock && (
          <div className="absolute bottom-3 right-3 flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            <Plus size={24} />
          </div>
        )}
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
                 <span className={cn("text-[10px] font-black tracking-tighter", isOutOfStock ? "text-rose-600 font-bold" : isLowStock ? "text-rose-500" : "text-slate-700 dark:text-slate-300")}>{p.stockQuantity}</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nodes</span>
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stockPercentage}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000", isOutOfStock ? "bg-rose-600" : isLowStock ? "bg-rose-500" : "bg-emerald-500")}
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
  const { cart, addItem, removeItem, updateQuantity, clearCart, total, grandTotal, currentDraftId, setDraftId, setCart } = usePOSStore();
  const tax = 0;
  const totalDiscount = isHappyHour ? Math.round(total * 0.1) : 0;
  const { isOnline, isSyncing, initialSync } = useOfflineSync();

  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleCameraScan = async (result: string) => {
    if (!result) return;
    try {
      const matched = products?.find(p => p.barcode === result || p.sku === result || p.id === result || (p.metadata && p.metadata.barcode === result));

      if (matched) {
        if (matched.stockQuantity <= 0) {
          toast.error(`Scanned item "${matched.name}" is OUT OF STOCK.`);
          return;
        }
        handleAddItem({
          id: matched.id,
          name: matched.name,
          price: matched.unitPrice,
          stockQuantity: matched.stockQuantity,
          ratio: 1,
          isExternal: false,
        });
        toast.success(`Scanned: ${matched.name} added!`);
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
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE_MONEY" | "CARD" | "CREDIT" | "SPLIT">("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID" | "PARTIAL">("PAID");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<string>("");
  const [creditAmountPaid, setCreditAmountPaid] = useState<string>(""); // partial payment on credit
  const [splitPayments, setSplitPayments] = useState<{ method: "CASH" | "MOBILE_MONEY" | "CARD"; amount: number }[]>([]);
  const [momoProvider, setMomoProvider] = useState<"ORANGE_MONEY" | "AFRIMONEY">("ORANGE_MONEY");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoRefCode, setMomoRefCode] = useState("");
  const [momoSmsPaste, setMomoSmsPaste] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: "", phone: "", email: "", address: "" });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState("");

  // Fallback Server State in case IndexedDB fails or is blocked
  const [serverProducts, setServerProducts] = useState<any[]>([]);
  const [serverCategories, setServerCategories] = useState<any[]>([]);

  // Cash Register State
  const [registerSession, setRegisterSession] = useState<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("");
  const [isOpeningRegister, setIsOpeningRegister] = useState(false);

  // Drafts State
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [draftSearchQuery, setDraftSearchQuery] = useState("");
  const [isHolding, setIsHolding] = useState(false);
  const [holdCustomerName, setHoldCustomerName] = useState("");
  const [holdCustomerPhone, setHoldCustomerPhone] = useState("");
  const [isHoldSaleModalOpen, setIsHoldSaleModalOpen] = useState(false);

  const fetchDrafts = async () => {
    const res = await getDrafts();
    if (res.success && res.drafts) {
      setDrafts(res.drafts);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (currentDraftId && cart.length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        await updateDraft(currentDraftId, {
          items: cart,
          totalAmount: total,
        });
        fetchDrafts();
      }, 3000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [cart, total, currentDraftId]);

  const handleCreateDraft = async () => {
    if (cart.length === 0) return;
    setIsHolding(true);
    try {
      const res = await createDraft({
        customerName: holdCustomerName || undefined,
        customerPhone: holdCustomerPhone || undefined,
        items: cart,
        totalAmount: total,
      });
      if (res.success && res.draft) {
        toast.success(`Draft saved as ${res.draft.draftNumber}`);
        clearCart();
        setIsHoldSaleModalOpen(false);
        setHoldCustomerName("");
        setHoldCustomerPhone("");
        fetchDrafts();
      } else {
        toast.error(res.error || "Failed to hold sale");
      }
    } catch (e) {
      toast.error("An error occurred while saving draft.");
    } finally {
      setIsHolding(false);
    }
  };

  const handleResumeDraft = (draft: any) => {
    setCart(draft.items);
    setDraftId(draft.id);
    setIsDraftsModalOpen(false);
    toast.info(`Resumed ${draft.draftNumber}`);
  };

  const handleDeleteDraft = async (id: string) => {
    await deleteDraft(id);
    if (currentDraftId === id) {
      clearCart();
    }
    fetchDrafts();
    toast.success("Draft discarded");
  };

  const isPharmacy = session?.user?.businessType === "PHARMACY";
  const cartRequiresPrescription = isPharmacy && cart.some(item => item.requiresPrescription);

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

  const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppRecipientPhone, setWhatsAppRecipientPhone] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const [biz, custs, scripts, currentRegister] = await Promise.all([
          getCurrentBusiness(),
          getCustomers(),
          getPendingPrescriptions().catch(() => []), // Catch in case business is not pharmacy
          getCurrentSession().catch(() => null)
        ]);
        
        if (currentRegister) {
          setRegisterSession(currentRegister);
        } else {
          setIsRegisterModalOpen(true);
        }
        
        if (biz) {
          setBusinessInfo(biz);
          if (biz.businessType === "PHARMACY") {
            setPendingPrescriptions(scripts);
          }
        }
        if (custs) {
          setCustomers(custs);
        }

        // Fetch products & categories directly as server fallback
        const [directProds, directCats] = await Promise.all([
          getProducts().catch(() => []),
          getCategories().catch(() => [])
        ]);
        if (directProds) setServerProducts(directProds);
        if (directCats) setServerCategories(directCats);
      } catch (error) {
        console.error("Error fetching POS setup data:", error);
      }
    }
    init();
    initialSync();
  }, []);

  // Fetch prescriptions dynamically on checkout modal open to ensure they are up to date
  useEffect(() => {
    if (isCheckoutOpen && cartRequiresPrescription && isPharmacy) {
      getPendingPrescriptions()
        .then(setPendingPrescriptions)
        .catch((err) => console.error("Error updating prescriptions:", err));
    }
  }, [isCheckoutOpen, cartRequiresPrescription, isPharmacy]);

  async function fetchCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }

  const dexieProducts = useLiveQuery(
    async () => {
      try {
        let collection = db.products;
        if (selectedCategory) {
          return await collection.where("categoryId").equals(selectedCategory).toArray();
        }
        return await collection.toArray();
      } catch (err) {
        console.warn("Dexie products query error (using fallback):", err);
        return [];
      }
    },
    [selectedCategory],
    []
  );

  const dexieCategories = useLiveQuery(
    async () => {
      try {
        return await db.categories.toArray();
      } catch (err) {
        console.warn("Dexie categories query error (using fallback):", err);
        return [];
      }
    },
    [],
    []
  );

  const products = (dexieProducts && dexieProducts.length > 0) 
    ? dexieProducts 
    : (selectedCategory ? serverProducts.filter(p => p.categoryId === selectedCategory) : serverProducts);

  const categories = (dexieCategories && dexieCategories.length > 0) ? dexieCategories : serverCategories;

  const filteredProducts = useMemo(() => products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [products, searchQuery]);

  // Hardware Barcode Scanner Listener
  // Hardware scanners act as keyboards that type fast and press Enter.
  useEffect(() => {
    let barcodeBuffer = "";
    let timeout: NodeJS.Timeout | null = null;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (unless it's the main search bar itself)
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        // Only ignore if the active element is NOT our main search input.
        // If it is our main search input, let the normal input handle it or 
        // we can intercept Enter to auto-add.
        if (document.activeElement?.id !== "pos-search-input") {
           return;
        }
      }

      if (e.key === "Enter") {
        if (barcodeBuffer.length > 2) {
          // Scanner finished typing, process the barcode
          const result = barcodeBuffer;
          barcodeBuffer = ""; // Reset
          
          const matched = products?.find(p => p.barcode === result || p.sku === result || p.id === result || (p.metadata && p.metadata.barcode === result));
          
          if (matched) {
            if (matched.stockQuantity <= 0) {
              toast.error(`Scanned item "${matched.name}" is OUT OF STOCK.`);
            } else {
              handleAddItem({
                id: matched.id,
                name: matched.name,
                price: matched.unitPrice,
                stockQuantity: matched.stockQuantity,
                ratio: 1,
                isExternal: false,
              });
              toast.success(`Scanned: ${matched.name} added!`);
              setSearchQuery(""); // clear search if it was typed
            }
          } else {
             // If not found directly by barcode, just set search query
             setSearchQuery(result);
             toast.info(`Scanned: ${result} not found. Applying filter.`);
          }
        }
      } else {
        // Collect characters
        if (e.key.length === 1) { // Ignore shift, ctrl, etc.
          barcodeBuffer += e.key;
          if (timeout) clearTimeout(timeout);
          // If no new character comes in within 100ms, assume it was manual typing and clear buffer
          timeout = setTimeout(() => {
            barcodeBuffer = "";
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [products]);

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-thermal-container');
    if (!printContent) {
      toast.error("Receipt content not found.");
      return;
    }
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    if (!iframe.contentWindow) return;
    
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              font-family: monospace; 
              color: black;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .text-lg { font-size: 1.125rem; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[12px\\] { font-size: 12px; }
            .text-sm { font-size: 0.875rem; }
            .text-right { text-align: right; }
            .border-b { border-bottom: 1px dashed black; }
            .pb-2 { padding-bottom: 0.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mt-4 { margin-top: 1rem; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .w-full { width: 100%; }
            .w-1\\/2 { width: 50%; }
            .w-1\\/4 { width: 25%; }
            .align-top { vertical-align: top; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            th { border-bottom: 1px solid black; padding-bottom: 4px; }
            td { padding-top: 4px; }
            
            /* Remove all Tailwind specific display hacks that might break plain HTML rendering */
            .print\\:hidden { display: none !important; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .shop-name-brand, .text-indigo-600 {
              color: #4F46E5 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 80mm; margin: 0 auto; padding: 4mm;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    iframe.contentWindow.document.close();
    
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

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

  const generateWhatsAppReceiptText = () => {
    if (!receiptData) return "";
    const bName = receiptData.businessName || "Protech Enterprise";
    const inv = receiptData.transactionId || receiptData.id || "INV-REC";
    const cashier = receiptData.cashierName || "Cashier Counter";
    const cust = receiptData.customerName || "Valued Customer";
    const dateStr = new Date().toLocaleString();
    const rateDecimal = 0.15;
    const subtotal = receiptData.total / (1 + rateDecimal);
    const gst = receiptData.total - subtotal;
    
    const itemsText = (receiptData.items || []).map((it: any) => `▪️ ${it.quantity}x ${it.name} — Le ${Math.round(it.price * it.quantity).toLocaleString()}`).join("\n");

    return `🧾 *OFFICIAL RECEIPT — ${bName.toUpperCase()}*\n` +
      `-----------------------------------------\n` +
      `🆔 *Invoice #:* ${inv}\n` +
      `📅 *Date:* ${dateStr}\n` +
      `👤 *Cashier:* ${cashier}\n` +
      `🏷️ *Customer:* ${cust}\n\n` +
      `🛒 *ITEMS PURCHASED:*\n${itemsText}\n\n` +
      `-----------------------------------------\n` +
      `💵 *Subtotal:* Le ${Math.round(subtotal).toLocaleString()}\n` +
      `🏛️ *NRA GST (15%):* Le ${Math.round(gst).toLocaleString()}\n` +
      `💰 *TOTAL PAID:* Le ${Math.round(receiptData.total).toLocaleString()}\n` +
      `💳 *Tender:* ${(receiptData.paymentMethod || "CASH").replace('_', ' ')}\n` +
      `-----------------------------------------\n` +
      `✨ _Thank you for shopping at ${bName}!_\n` +
      `🌐 *Protech Assist Enterprise POS*`;
  };

  const handleWhatsAppShare = () => {
    if (!receiptData) return;
    const cust = customers.find(c => c.id === selectedCustomer);
    if (cust?.phone) {
      setWhatsAppRecipientPhone(cust.phone);
    }
    setIsWhatsAppModalOpen(true);
  };

  const executeSendWhatsAppReceipt = () => {
    if (!receiptData) return;
    const rawPhone = whatsAppRecipientPhone.trim();
    let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "232" + cleanPhone.slice(1);
    } else if (cleanPhone.length === 8) {
      cleanPhone = "232" + cleanPhone;
    }

    const message = generateWhatsAppReceiptText();
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
    setIsWhatsAppModalOpen(false);
    toast.success("WhatsApp receipt dispatch opened!");
  };

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustomerData.name) return toast.error("Name is required");
    setIsCreatingCustomer(true);
    try {
      const customer = await createCustomer(newCustomerData);
      setCustomers(prev => [customer, ...prev]);
      setSelectedCustomer(customer.id);
      setIsNewCustomerOpen(false);
      setNewCustomerData({ name: "", phone: "", email: "", address: "" });
      toast.success("Customer added successfully!");
    } catch (err) {
      toast.error("Failed to create customer");
    } finally {
      setIsCreatingCustomer(false);
    }
  }

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

      if (paymentMethod === "SPLIT") {
        const totalSplit = splitPayments.reduce((acc, curr) => acc + curr.amount, 0);
        if (totalSplit < grandTotal) {
           toast.error(`Split payments total (Le ${totalSplit}) is less than the grand total (Le ${grandTotal}).`);
           setLoading(false);
           return;
        }
      }

      const partialPaid = isCredit ? (parseFloat(creditAmountPaid) || 0) : grandTotal;
      const creditPayStatus: "PAID" | "UNPAID" | "PARTIAL" = isCredit
        ? (partialPaid <= 0 ? "UNPAID" : partialPaid >= grandTotal ? "PAID" : "PARTIAL")
        : "PAID";

      const baseNote = isHappyHour ? "HAPPY HOUR SALE" : undefined;
      const rxNote = (cartRequiresPrescription && prescriptionId) ? `Prescription ID: ${prescriptionId}` : undefined;
      let finalNote = undefined;
      if (baseNote && rxNote) finalNote = `${baseNote} | ${rxNote}`;
      else if (baseNote) finalNote = baseNote;
      else if (rxNote) finalNote = rxNote;

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
        splitPayments: paymentMethod === "SPLIT" ? splitPayments : undefined,
        paymentStatus: isCredit ? creditPayStatus : "PAID",
        customerId: selectedCustomer === "WALKIN" ? undefined : selectedCustomer,
        amountPaid: isCredit ? partialPaid : grandTotal,
        tax,
        momoRef: paymentMethod === "MOBILE_MONEY" ? momoRefCode : undefined,
        saleNote: finalNote,
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
          splitPayments: saleData.splitPayments,
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
          businessName: businessInfo?.name || session?.user?.businessName || "Enterprise OS",
          businessAddress: businessInfo?.address || undefined,
          businessPhone: businessInfo?.phone || undefined,
          businessSecondaryPhone: businessInfo?.secondaryPhone || undefined,
          businessWhatsappPhone: businessInfo?.whatsappPhone || undefined,
          businessEmail: businessInfo?.email || undefined,
          logoUrl: businessInfo?.logoUrl || undefined,
          receiptSettings: businessInfo?.receiptSettings || null,
        });

        if (currentDraftId) {
          deleteDraft(currentDraftId).then(() => fetchDrafts());
        }

        clearCart();
        setIsCheckoutOpen(false);
        setIsCartVisible(false);
        setCashTendered("");
        setCreditAmountPaid("");
        setMomoRefCode("");
        setMomoPhone("");
        setMomoSmsPaste("");
        setPaymentMethod("CASH");
        setSplitPayments([]);

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
            businessSecondaryPhone={receiptData.businessSecondaryPhone}
            businessWhatsappPhone={receiptData.businessWhatsappPhone}
            businessEmail={receiptData.businessEmail}
            logoUrl={receiptData.logoUrl}
            receiptSettings={receiptData.receiptSettings}
          />
        )}
      </div>

    <div className="flex flex-col lg:flex-row h-[calc(100dvh-4rem)] -mx-3 sm:-mx-6 md:-mx-8 -my-4 sm:-my-6 bg-slate-50 dark:bg-[#0F172A] overflow-hidden relative selection:bg-primary/30 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] md:w-[calc(100%+4rem)]">
      
      {/* Category Sidebar */}
      <CategorySidebar 
        categories={categories || serverCategories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {/* Central Asset Index (Left/Center Side) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 shadow-2xl relative z-10 lg:rounded-r-[4rem] overflow-hidden border-r border-slate-100 dark:border-slate-800">
        <header className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 relative overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Animated background layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Slow panning gradient shimmer */}
            <motion.div
              className="absolute -top-10 -left-10 w-72 h-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl"
              animate={{ x: [0, 40, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-10 right-20 w-48 h-24 rounded-full bg-indigo-400/5 dark:bg-indigo-400/10 blur-2xl"
              animate={{ x: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />
            {/* Floating neural dots */}
            {[
              { top: "20%", left: "60%", delay: 0 },
              { top: "70%", left: "75%", delay: 0.8 },
              { top: "40%", left: "85%", delay: 1.6 },
              { top: "15%", left: "92%", delay: 2.4 },
            ].map((dot, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary/30 dark:bg-primary/50"
                style={{ top: dot.top, left: dot.left }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
              />
            ))}
          </div>

          <div className="flex items-start sm:items-center justify-between w-full lg:w-auto gap-4 relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Animated icon */}
              <div className="relative group shrink-0">
                {/* Outer pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl sm:rounded-[1.5rem] bg-primary/20 dark:bg-primary/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
                {/* Second pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl sm:rounded-[1.5rem] bg-primary/10"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
                <motion.div
                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-[1.5rem] bg-slate-900 dark:bg-primary flex items-center justify-center shadow-2xl shadow-primary/30"
                  animate={{ rotate: [3, 0, 3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                </motion.div>
                {/* Live green dot */}
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500 border-[3px] sm:border-4 border-white dark:border-slate-900"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Title + status */}
              <div className="min-w-0">
                <motion.h1
                  className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none truncate"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Commerce{" "}
                  <motion.span
                    className="text-primary underline decoration-indigo-50"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Hub
                  </motion.span>
                </motion.h1>

                {/* Neural Network status badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5">
                  {/* Animated triple-dot indicator */}
                  <div className="flex items-center gap-0.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
                      />
                    ))}
                  </div>
                  <motion.p
                    className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] truncate"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {isOnline ? "Neural Network Linked" : "Local Engine Mode"}
                  </motion.p>
                  {/* Sync activity bar */}
                  {isOnline && (
                    <div className="hidden sm:flex items-end gap-px h-3 ml-1">
                      {[2, 4, 3, 5, 2, 4, 3].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-px bg-emerald-400 rounded-full"
                          animate={{ height: [`${h}px`, `${h * 2}px`, `${h}px`] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Back Button */}
            <Button onClick={() => router.back()} variant="ghost" className="lg:hidden h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-xl sm:rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-all border border-transparent shrink-0">
              <X size={20} />
            </Button>
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

          <div className="flex items-center gap-2 w-full lg:w-auto relative z-10">
            {(session?.user?.businessType === "CLINIC" || session?.user?.businessType === "HOSPITAL") && (
              <MedicalBillsModal onPaymentSuccess={(data) => {
                setReceiptData(data);
                setTimeout(() => setIsReceiptModalOpen(true), 300);
              }} />
            )}
            <Button variant="outline" size="sm" onClick={initialSync} disabled={isSyncing} className="flex-1 lg:flex-none h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2">
              <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", isSyncing && "animate-spin text-primary")} />
              <span className="truncate">{isSyncing ? "Syncing..." : "Trade Sync"}</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsCloseRegisterModalOpen(true)} className="flex-1 lg:flex-none h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 sm:gap-2">
              <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Close Shift</span>
            </Button>
            {/* Desktop Back Button */}
            <Button onClick={() => router.back()} variant="ghost" className="hidden lg:flex h-12 w-12 p-0 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-300 hover:text-rose-500 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 shrink-0">
              <X size={20} />
            </Button>
          </div>
        </header>


        {/* ACTIVE DRAFT BANNER */}
        {currentDraftId && (() => {
          const activeDraft = drafts.find(d => d.id === currentDraftId);
          return activeDraft ? (
            <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/10 border border-amber-300/40 dark:border-amber-600/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Save className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                    Draft Active — {activeDraft.customerName || "Walk-in Customer"}
                    {activeDraft.customerPhone && <span className="font-normal ml-2 opacity-70">{activeDraft.customerPhone}</span>}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{activeDraft.draftNumber} · Auto-saving changes</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-[10px] font-black uppercase tracking-widest rounded-xl h-8 px-3"
                onClick={() => {
                  clearCart();
                  toast.info("Draft kept in queue. Cart cleared.");
                }}
              >
                Close Draft
              </Button>
            </div>
          ) : null;
        })()}

        <div className="p-4 sm:p-6 space-y-4 shrink-0 bg-transparent z-20">
           <div className="relative group max-w-4xl mx-auto w-full">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                 <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              </div>
              <Input 
                id="pos-search-input"
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
           {/* Mobile / Tablet Horizontal Category Pills */}
           <div className="lg:hidden flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
                  selectedCategory === null
                    ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <LayoutGrid size={13} />
                <span>All Assets</span>
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
                    selectedCategory === cat.id
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Package size={13} />
                  <span>{cat.name}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 pb-36 lg:pb-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
           {filteredProducts?.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 space-y-6">
                <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-slate-50 dark:border-slate-800 relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                   <Package className="h-10 w-10 sm:h-12 sm:w-12 text-slate-100 dark:text-slate-800 animate-pulse relative z-10" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Deficit</h3>
                   <p className="text-[10px] text-slate-400 font-[1000] uppercase tracking-[0.3em] max-w-[280px] leading-relaxed">No asset signatures match your current query</p>
                </div>
             </div>
           ) : (
             <motion.div 
               initial={false}
               className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mt-2 pb-16"
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
        "absolute lg:relative bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl lg:w-[400px] xl:w-[460px] 2xl:w-[520px] shadow-2xl lg:shadow-[-20px_0_50px_rgba(0,0,0,0.05)] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/10 transition-all duration-300 flex flex-col shrink-0",
        isCartVisible ? "h-[90dvh] lg:h-full translate-y-0" : "h-[84px] lg:h-full translate-y-0"
      )}>
        {/* Cart Header (Mobile Toggle & Actions) */}
        <div 
          className="h-[76px] sm:h-[84px] px-2.5 sm:px-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 cursor-pointer lg:cursor-default bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md z-10 gap-1.5 sm:gap-2 overflow-x-hidden"
          onClick={() => !isCartVisible && setIsCartVisible(true)}
        >
           {/* Left: Cart Icon & Item Count */}
           <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative shrink-0">
                 <div className={cn(
                   "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shadow-md transition-all duration-300", 
                   cart.length > 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                 )}>
                   <ShoppingBag className="h-4 w-4 text-current" />
                 </div>
                 {cart.length > 0 && (
                   <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-0.5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-[7px] font-[1000] flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
                 )}
              </div>
              <div className="min-w-0 flex-1">
                 <h2 className="text-xs sm:text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight truncate">
                   Current <span className="text-indigo-600 dark:text-indigo-400">Sale</span>
                 </h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mt-0.5 truncate">
                   {cart.length} {cart.length === 1 ? "Item" : "Items"} • <span className="text-slate-700 dark:text-slate-300 font-bold">Le {Math.round(total).toLocaleString()}</span>
                 </p>
              </div>
           </div>
           
           {/* Right: Action Buttons Group */}
           <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Drafts Queue Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all relative cursor-pointer shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDraftsModalOpen(true);
                }}
                title="Drafts Queue"
              >
                <History className="h-3.5 w-3.5" />
                {drafts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 min-w-[12px] px-0.5 rounded-full bg-indigo-500 text-white text-[7px] font-black flex items-center justify-center">
                    {drafts.length}
                  </span>
                )}
              </Button>

              {/* Hold Cart Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all cursor-pointer shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentDraftId) {
                    toast.success("Draft is automatically saving.");
                  } else {
                    setIsHoldSaleModalOpen(true);
                  }
                }}
                disabled={cart.length === 0}
                title="Hold Active Cart"
              >
                <Save className="h-3.5 w-3.5" />
              </Button>

              {/* Clear Active Cart Button (Always 100% visible) */}
              <Button 
                variant="ghost" 
                className="h-8 px-2 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50/90 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 transition-all flex items-center gap-1 cursor-pointer font-bold text-xs shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentDraftId) deleteDraft(currentDraftId).then(() => fetchDrafts());
                  clearCart();
                  toast.success("Cart cleared.");
                }}
                disabled={cart.length === 0}
                title="Clear Cart"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase">Clear</span>
              </Button>

              {/* Mobile Drawer Open/Close Toggle (Always 100% visible on mobile) */}
              <Button 
                variant="outline" 
                className="lg:hidden h-8 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border-indigo-200/60 dark:border-indigo-800/40 cursor-pointer font-black text-xs gap-1 shrink-0 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartVisible(!isCartVisible);
                }}
                title={isCartVisible ? "Close Cart" : "Open Cart"}
              >
                <span className="text-[9px] uppercase font-bold">{isCartVisible ? "Close" : "Open"}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isCartVisible ? "" : "rotate-180")} />
              </Button>
           </div>
        </div>

        {/* Ledger Items (Receipt Style) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-transparent custom-scrollbar relative">
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
                   className="flex items-center gap-6 bg-white/50 dark:bg-slate-900/50 p-5 rounded-[2rem] shadow-xl shadow-black/[0.02] border border-slate-100/50 dark:border-white/10 relative group"
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
                                   onClick={() => {
                                      const matchedProd = products?.find(p => p.id === item.id);
                                      const maxStock = matchedProd?.stockQuantity ?? 99999;
                                      if (item.quantity + 1 > maxStock) {
                                         toast.error(`Cannot exceed available stock (${maxStock} available).`);
                                         return;
                                      }
                                      updateQuantity(item.id, item.quantity + 1);
                                   }}
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
                       type="button"
                       onClick={() => removeItem(item.id)} 
                       className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all opacity-100 flex items-center justify-center shadow-sm cursor-pointer z-10"
                       title="Remove this product"
                    >
                       <X size={18} />
                    </button>
                 </motion.div>
               ))
             )}
           </AnimatePresence>
        </div>

        {/* Professional Settlement Summary */}
        <div className="p-4 sm:p-8 xl:p-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 space-y-4 sm:space-y-6 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] xl:rounded-bl-[3rem]">
           <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                 <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                 <span className="text-xs sm:text-sm font-[1000] text-slate-700 dark:text-slate-300">Le {Math.round(total).toLocaleString()}</span>
              </div>
            
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
              <div className="flex justify-between items-end relative">
                 <div>
                    <p className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] leading-none mb-1.5 sm:mb-2">Grand Total</p>
                    <p className="text-2xl sm:text-4xl xl:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none">
                       Le {Math.round(grandTotal).toLocaleString()}
                    </p>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                       <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                       <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Ready to Pay</span>
                    </div>
                 </div>
              </div>
           </div>

           <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-14 sm:h-18 xl:h-20 rounded-2xl sm:rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-[1000] text-xs sm:text-sm xl:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 sm:gap-3"
           >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
           </Button>
        </div>
      </div>
      
      {/* SECURE CHECKOUT MODAL */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-[1100px] w-[96vw] rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 max-h-[92vh] flex flex-col">
          {/* Sleek Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 sm:px-8 sm:py-5 text-white relative overflow-hidden shrink-0 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">POS Terminal Settlement</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Live Sync</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-[1000] tracking-tight uppercase text-white flex items-center gap-2">
                  Final Checkout & Settlement
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Payable</span>
                <span className="text-xl font-[1000] tracking-tight text-emerald-400">Le {Math.round(grandTotal).toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2-Column Responsive Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
            
            {/* LEFT COLUMN: Payment Controls & Tender (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 lg:overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
              
              {/* Customer Selection Row */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer / Account</Label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsNewCustomerOpen(true)} 
                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> New Customer
                  </button>
                </div>
                <Select value={selectedCustomer} onValueChange={(val) => setSelectedCustomer(val || "WALKIN")}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs uppercase tracking-wider shadow-sm">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1 max-h-56">
                    <SelectItem value="WALKIN" className="font-bold uppercase tracking-wider py-2.5 text-xs rounded-lg">
                      🚶 Walk-in Customer (Standard)
                    </SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="font-bold py-2.5 text-xs rounded-lg">
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prescription Link if Applicable */}
              {cartRequiresPrescription && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Linked Prescription</Label>
                  </div>
                  <Select value={prescriptionId} onValueChange={setPrescriptionId}>
                    <SelectTrigger className="h-11 rounded-xl border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 font-bold text-xs">
                      <SelectValue placeholder="Select Prescription (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {pendingPrescriptions.length === 0 ? (
                        <div className="p-3 text-center text-xs font-bold text-slate-400">No pending prescriptions</div>
                      ) : (
                        pendingPrescriptions.map((script) => (
                          <SelectItem key={script.id} value={script.id} className="text-xs font-bold">
                            {script.prescriptionNumber} - {script.patient?.name} (Dr. {script.doctorName})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment Method Selector Grid */}
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Method</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Banknote, activeBorder: 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/25', inactiveText: 'text-emerald-600 dark:text-emerald-400' },
                    { id: 'MOBILE_MONEY', label: 'MoMo', icon: Smartphone, activeBorder: 'border-blue-600 bg-blue-600 text-white shadow-blue-600/25', inactiveText: 'text-blue-600 dark:text-blue-400' },
                    { id: 'CARD', label: 'Card / POS', icon: CardIcon, activeBorder: 'border-indigo-600 bg-indigo-600 text-white shadow-indigo-600/25', inactiveText: 'text-indigo-600 dark:text-indigo-400' },
                    { id: 'CREDIT', label: 'Credit', icon: HandCoins, activeBorder: 'border-amber-500 bg-amber-500 text-white shadow-amber-500/25', inactiveText: 'text-amber-600 dark:text-amber-400' },
                    { id: 'SPLIT', label: 'Split', icon: LayoutGrid, activeBorder: 'border-fuchsia-600 bg-fuchsia-600 text-white shadow-fuchsia-600/25', inactiveText: 'text-fuchsia-600 dark:text-fuchsia-400' },
                  ].map((m) => {
                    const isActive = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any);
                          if (m.id !== 'CREDIT') setCreditAmountPaid("");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none",
                          isActive
                            ? `${m.activeBorder} shadow-lg scale-[1.02]`
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        <m.icon className={cn("h-5 w-5", isActive ? "text-white" : m.inactiveText)} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Tender Panels */}
              <div className="min-h-[160px]">
                {/* CASH PANEL */}
                {paymentMethod === 'CASH' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-4 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <Label className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Amount Tendered (Received)</Label>
                        </div>
                        {cashTendered && (
                          <button 
                            type="button" 
                            onClick={() => setCashTendered("")}
                            className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-wider cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Le</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder={Math.round(grandTotal).toString()}
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          className="pl-11 h-13 rounded-xl border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 font-mono font-black text-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Fast Tender Quick Buttons */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Fast Cash Presets:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCashTendered(Math.round(grandTotal).toString())}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                          >
                            Exact (Le {Math.round(grandTotal).toLocaleString()})
                          </button>
                          {[50, 100, 200, 500, 1000, 2000, 5000].map((denom) => (
                            <button
                              key={denom}
                              type="button"
                              onClick={() => setCashTendered(denom.toString())}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                            >
                              Le {denom >= 1000 ? `${denom / 1000}k` : denom}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Change Due Result Card */}
                      {(() => {
                        const tendered = parseFloat(cashTendered) || 0;
                        const change = tendered - grandTotal;
                        if (tendered >= grandTotal) {
                          return (
                            <div className="p-3.5 rounded-xl bg-emerald-500 text-white flex items-center justify-between shadow-md shadow-emerald-500/20">
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">Change to Return</span>
                                <p className="text-xs font-medium text-emerald-50">Give back to customer</p>
                              </div>
                              <span className="text-xl font-[1000] tracking-tight">Le {Math.round(change).toLocaleString()}</span>
                            </div>
                          );
                        } else if (tendered > 0) {
                          return (
                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-between border border-amber-200 dark:border-amber-900/50">
                              <span className="text-[10px] font-black uppercase tracking-wider">Remaining Due:</span>
                              <span className="text-sm font-[1000] font-mono">Le {Math.round(grandTotal - tendered).toLocaleString()}</span>
                            </div>
                          );
                        }
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 text-[10px] font-bold text-center uppercase tracking-wider">
                            Enter cash received or click Exact to verify change
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* MOBILE MONEY PANEL */}
                {paymentMethod === 'MOBILE_MONEY' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 p-4 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <Label className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Mobile Money Provider</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMomoProvider("ORANGE_MONEY")}
                          className={cn(
                            "py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                            momoProvider === "ORANGE_MONEY"
                              ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          Orange Money
                        </button>
                        <button
                          type="button"
                          onClick={() => setMomoProvider("AFRIMONEY")}
                          className={cn(
                            "py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                            momoProvider === "AFRIMONEY"
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          AfriMoney
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Transaction Code / Ref</Label>
                          <Input
                            placeholder="e.g. CO260623.1301.A102"
                            value={momoRefCode}
                            onChange={(e) => setMomoRefCode(e.target.value)}
                            className="h-10 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Payer Phone (Optional)</Label>
                          <Input
                            placeholder="e.g. 077 123456"
                            value={momoPhone}
                            onChange={(e) => setMomoPhone(e.target.value)}
                            className="h-10 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Quick-Parse SMS Confirmation</Label>
                          <span className="text-[9px] text-blue-500 font-bold">Auto-extracts Ref & Phone</span>
                        </div>
                        <Textarea
                          placeholder="Paste customer SMS confirmation message here to auto-fill..."
                          value={momoSmsPaste}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMomoSmsPaste(val);
                            const txn = val.match(/(?:Txn\s*ID|TxId|Trans\s*ID|Ref|ID)[:\s]+([A-Za-z0-9\.\-_]+)/i) || val.match(/\b(CO\d{6}\.\d{4}\.[A-Z0-9]+|PP\d+|MP\d+|CI\d+)\b/i);
                            if (txn && txn[1]) setMomoRefCode(txn[1]);
                            const ph = val.match(/(?:from|to|subscriber|sender|payer)[:\s]+(?:\+?232|0)?([7893]\d{7})/i) || val.match(/\b(?:\+?232|0)?([7893]\d{7})\b/);
                            if (ph && ph[1]) setMomoPhone("0" + ph[1]);
                          }}
                          className="rounded-xl bg-white dark:bg-slate-900 text-xs p-2.5 min-h-[50px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CARD PANEL */}
                {paymentMethod === 'CARD' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                      <CardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">POS Terminal Card Swipe</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Please insert or tap customer debit/credit card on the external card terminal for <span className="font-bold text-slate-900 dark:text-white">Le {Math.round(grandTotal).toLocaleString()}</span>.</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-black uppercase tracking-widest">
                      Terminal Ready
                    </Badge>
                  </motion.div>
                )}

                {/* CREDIT PANEL */}
                {paymentMethod === 'CREDIT' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3.5">
                    {selectedCustomer === 'WALKIN' ? (
                      <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 p-2">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-xs font-bold leading-relaxed">
                          Credit sales require a registered customer profile. Please select or add a customer above.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <HandCoins className="h-4 w-4 text-amber-600" />
                          <Label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">Credit Sale & Upfront Payment</Label>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Upfront Cash / Deposit (Optional)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Le</span>
                            <Input
                              type="number"
                              min="0"
                              max={grandTotal}
                              placeholder="0"
                              value={creditAmountPaid}
                              onChange={(e) => setCreditAmountPaid(e.target.value)}
                              className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 font-mono font-bold text-sm"
                            />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Sale:</span>
                            <span className="font-bold">Le {Math.round(grandTotal).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Upfront Paid:</span>
                            <span className="font-bold text-emerald-600">Le {Math.round(parseFloat(creditAmountPaid) || 0).toLocaleString()}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-amber-600 font-black uppercase tracking-wider text-[10px]">Remaining Debt:</span>
                            <span className="text-base font-[1000] text-amber-600">Le {Math.round(Math.max(0, grandTotal - (parseFloat(creditAmountPaid) || 0))).toLocaleString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* SPLIT PANEL */}
                {paymentMethod === 'SPLIT' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border border-fuchsia-200/80 dark:border-fuchsia-900/40 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-fuchsia-600" />
                        <Label className="text-[10px] font-black text-fuchsia-800 dark:text-fuchsia-300 uppercase tracking-widest">Multi-Tender Split</Label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        Remaining: Le {Math.max(0, grandTotal - splitPayments.reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(["CASH", "CARD", "MOBILE_MONEY"] as const).map(method => {
                        const existingIndex = splitPayments.findIndex(s => s.method === method);
                        const amount = existingIndex >= 0 ? splitPayments[existingIndex].amount : 0;
                        return (
                          <div key={method} className="space-y-1">
                            <Label className="text-[9px] font-black uppercase text-slate-500">{method.replace('_', ' ')}</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={amount || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const newSplits = [...splitPayments];
                                const idx = newSplits.findIndex(s => s.method === method);
                                if (idx >= 0) {
                                  if (val === 0) newSplits.splice(idx, 1);
                                  else newSplits[idx].amount = val;
                                } else if (val > 0) {
                                  newSplits.push({ method, amount: val });
                                }
                                setSplitPayments(newSplits);
                              }}
                              className="h-10 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Itemized Cart Breakdown & Financial Ledger (5 cols) */}
            <div className="lg:col-span-5 p-5 sm:p-7 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col justify-between space-y-5 lg:overflow-y-auto custom-scrollbar">
              
              {/* Cart Itemized Header & List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Cart Breakdown ({cart.length})</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cart.reduce((a, b) => a + b.quantity, 0)} Units</span>
                </div>

                <div className="space-y-2 max-h-[160px] sm:max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {cart.map((item, i) => (
                    <div key={item.id + (item.unitId || "") + i} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.quantity}×
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-white truncate text-[11px] leading-tight">{item.name}</p>
                          <p className="text-[9px] text-slate-400">@ Le {Math.round(item.price).toLocaleString()} {item.unitName ? `/${item.unitName}` : ""}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-slate-200 shrink-0">
                        Le {Math.round(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ledger & Grand Total Summary */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Subtotal:</span>
                    <span className="font-mono font-bold">Le {Math.round(total).toLocaleString()}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-rose-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Discount:</span>
                      <span className="font-mono font-bold">-Le {Math.round(totalDiscount).toLocaleString()}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">NRA GST (15%):</span>
                      <span className="font-mono font-bold">Le {Math.round(tax).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total Hero Display */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white shadow-xl space-y-2 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">Total Due</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-bold">
                      {paymentMethod.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-2xl sm:text-3xl font-[1000] tracking-tight text-white relative z-10">
                    Le {Math.round(grandTotal).toLocaleString()}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" /> SSL Secured</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-blue-500" /> NRA Compliant</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-500" /> Instant Ledger</span>
                </div>
              </div>

            </div>

          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
              className="h-12 sm:h-14 px-5 rounded-xl font-bold uppercase text-[10px] tracking-wider text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
            >
              Cancel (ESC)
            </Button>
            
            <Button
              type="button"
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="h-12 sm:h-14 flex-1 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-emerald-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-[1000] uppercase text-xs tracking-widest shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Finalize Sale & Print Receipt</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD NEW CUSTOMER MODAL */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="sm:max-w-[450px] w-[95vw] max-h-[95vh] rounded-[2rem] sm:rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col">
           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 p-6 opacity-10">
               <User size={120} />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                 <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[9px] font-black uppercase tracking-[0.3em] backdrop-blur-md">CRM</Badge>
               </div>
               <h3 className="text-2xl sm:text-3xl font-[1000] tracking-tighter uppercase italic leading-none drop-shadow-md">
                 New Customer
               </h3>
               <p className="text-indigo-100 text-[10px] sm:text-[11px] font-bold mt-2 uppercase tracking-widest">
                 Add to your database
               </p>
             </div>
           </div>
           
           <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
             <form onSubmit={handleCreateCustomer} className="space-y-4 sm:space-y-5">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name <span className="text-rose-500">*</span></Label>
                 <Input 
                   required 
                   value={newCustomerData.name} 
                   onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})} 
                   className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20" 
                   placeholder="e.g. John Doe"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                 <Input 
                   value={newCustomerData.phone} 
                   onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})} 
                   className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20" 
                   placeholder="e.g. 077 123 456"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                 <Input 
                   type="email"
                   value={newCustomerData.email} 
                   onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})} 
                   className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20" 
                   placeholder="e.g. john@example.com"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Address</Label>
                 <Input 
                   value={newCustomerData.address} 
                   onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})} 
                   className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20" 
                   placeholder="e.g. 123 Main St, Freetown"
                 />
               </div>
               
               <div className="pt-4 flex gap-3">
                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => setIsNewCustomerOpen(false)} 
                   className="flex-1 h-14 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-800 text-slate-500"
                 >
                   Cancel
                 </Button>
                 <Button 
                   type="submit" 
                   disabled={isCreatingCustomer} 
                   className="flex-[2] h-14 rounded-[1.2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                 >
                   {isCreatingCustomer ? <RefreshCw className="animate-spin h-4 w-4" /> : "Save Customer"}
                 </Button>
               </div>
             </form>
           </div>
        </DialogContent>
      </Dialog>

      {/* HOLD SALE MODAL */}
      <Dialog open={isHoldSaleModalOpen} onOpenChange={setIsHoldSaleModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl p-6 sm:p-10 bg-white dark:bg-slate-950 flex flex-col gap-6">
          <div className="flex flex-col text-center">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Hold Sale</h3>
            <p className="text-xs text-slate-500 mt-2">Add a customer name so you can find this draft later.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <Input 
                value={holdCustomerName}
                onChange={(e) => setHoldCustomerName(e.target.value)}
                placeholder="e.g. Amadu Koroma"
                className={cn("h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border px-4 transition-colors", !holdCustomerName.trim() ? "border-amber-300 dark:border-amber-700" : "border-emerald-400 dark:border-emerald-700")}
                autoFocus
              />
              {!holdCustomerName.trim() && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Name helps identify this draft quickly
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
              <Input 
                value={holdCustomerPhone}
                onChange={(e) => setHoldCustomerPhone(e.target.value)}
                placeholder="e.g. 077 123 456"
                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none px-4"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsHoldSaleModalOpen(false)} className="flex-1 rounded-2xl">Cancel</Button>
            <Button onClick={handleCreateDraft} disabled={isHolding} className="flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
              {isHolding ? <RefreshCw className="animate-spin" /> : "Save Draft"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DRAFTS MODAL */}
      <Dialog open={isDraftsModalOpen} onOpenChange={setIsDraftsModalOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-10 bg-white dark:bg-slate-950 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Sales Drafts</h3>
            <Badge variant="outline" className="text-indigo-500 border-indigo-500/30">{drafts.length} Paused</Badge>
          </div>
          
          <Input 
            value={draftSearchQuery}
            onChange={(e) => setDraftSearchQuery(e.target.value)}
            placeholder="Search by Name, Phone, or DRAFT-..."
            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none px-4"
          />

          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {drafts.filter(d => 
              (d.draftNumber || "").toLowerCase().includes(draftSearchQuery.toLowerCase()) || 
              (d.customerName || "").toLowerCase().includes(draftSearchQuery.toLowerCase()) ||
              (d.customerPhone || "").toLowerCase().includes(draftSearchQuery.toLowerCase())
            ).length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No matching drafts</p>
              </div>
            ) : (
              drafts.filter(d => 
                (d.draftNumber || "").toLowerCase().includes(draftSearchQuery.toLowerCase()) || 
                (d.customerName || "").toLowerCase().includes(draftSearchQuery.toLowerCase()) ||
                (d.customerPhone || "").toLowerCase().includes(draftSearchQuery.toLowerCase())
              ).map((d) => (
                <div key={d.id} className={cn("p-4 rounded-2xl border flex flex-col gap-4 transition-all", currentDraftId === d.id ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800" : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800")}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {d.customerName || <span className="text-amber-500">⚠ No Name Set</span>} 
                        {d.customerPhone && <span className="text-xs text-slate-500 ml-2 font-normal">{d.customerPhone}</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{d.draftNumber} • {new Date(d.updatedAt).toLocaleTimeString()}</p>
                      {/* Item preview */}
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {Array.isArray(d.items) && d.items.slice(0, 3).map((item: any) => item.name).join(', ')}
                        {Array.isArray(d.items) && d.items.length > 3 && ` +${d.items.length - 3} more`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-[1000] text-primary">Le {Math.round(d.totalAmount).toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{d.items.length} Items</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleResumeDraft(d)}
                      disabled={currentDraftId === d.id}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] tracking-widest uppercase rounded-xl"
                    >
                      {currentDraftId === d.id ? "Active" : "Resume Session"}
                    </Button>
                    <Button 
                      onClick={() => handleDeleteDraft(d.id)}
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
               <div id="receipt-thermal-container">
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
                   businessSecondaryPhone={receiptData.businessSecondaryPhone}
                   businessWhatsappPhone={receiptData.businessWhatsappPhone}
                   businessEmail={receiptData.businessEmail}
                   logoUrl={receiptData.logoUrl}
                   receiptSettings={receiptData.receiptSettings}
                 />
               </div>
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
               className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
             >
               <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
             </Button>
             <Button 
               onClick={handlePrintReceipt}
               className="flex-[1.2] h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xl hover:scale-105 transition-transform"
             >
               <Printer className="mr-2 h-4 w-4" /> Print
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WHATSAPP DIGITAL RECEIPT DISPATCH MODAL */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 flex flex-col gap-5">
          <div className="text-center space-y-1.5">
            <div className="mx-auto h-14 w-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
              <MessageSquare size={28} className="fill-emerald-600/20" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              WhatsApp Digital Receipt
            </h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Instant 1-Tap Customer Dispatch
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Customer Phone Number (WhatsApp)
              </Label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="e.g. 077 123 456 or +232 79 178 880"
                  value={whatsAppRecipientPhone}
                  onChange={(e) => setWhatsAppRecipientPhone(e.target.value)}
                  className="h-12 text-sm font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Supports Sierra Leone local formats (07X, 08X, 03X, +232).
              </p>
            </div>

            {/* Receipt Summary Card */}
            {receiptData && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{receiptData.transactionId || receiptData.id || "INV-REC"}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="text-emerald-600 font-mono font-black">Le {Math.round(receiptData.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Items:</span>
                  <span className="text-slate-900 dark:text-white">{receiptData.items?.length || 0} Products</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <Button
              onClick={executeSendWhatsAppReceipt}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 fill-white" /> Send Digital Receipt Now
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="w-full h-9 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
            >
              Cancel
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

      {/* CASH REGISTER OPEN SHIFT MODAL */}
      <Dialog open={isRegisterModalOpen} onOpenChange={(open) => {
        // Prevent closing if no session is open
        if (!registerSession) return;
        setIsRegisterModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900 flex flex-col gap-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Banknote size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Open Register</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Start a new sales shift</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-500">Starting Cash (Float)</Label>
              <Input 
                type="number"
                min="0"
                placeholder="Amount in Till"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                className="h-14 bg-slate-50 dark:bg-slate-950 font-mono text-lg rounded-xl"
              />
            </div>
          </div>

          <Button 
            disabled={!startingCash || isOpeningRegister}
            onClick={async () => {
              setIsOpeningRegister(true);
              try {
                const session = await openSession(parseFloat(startingCash));
                setRegisterSession(session);
                setIsRegisterModalOpen(false);
                toast.success("Shift opened successfully.");
              } catch (e: any) {
                toast.error(e.message || "Failed to open register");
              } finally {
                setIsOpeningRegister(false);
              }
            }}
            className="w-full h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl"
          >
            {isOpeningRegister ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Start Shift"}
          </Button>
        </DialogContent>
      </Dialog>
      
      <CloseRegisterModal 
        isOpen={isCloseRegisterModalOpen} 
        onClose={() => setIsCloseRegisterModalOpen(false)} 
        sessionId={registerSession?.id || null} 
      />
    </>
  );
}
