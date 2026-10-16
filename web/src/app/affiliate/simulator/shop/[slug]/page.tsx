"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Info,
  ChevronRight,
  Check,
  RefreshCw,
  User,
  Phone,
  Mail,
  Package,
  Layers,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { SimulatorNoticeBanner } from "@/components/affiliate/SimulatorNoticeBanner";
import {
  getTrainingProductBySlug,
  recordTrainingClick,
  recordCheckoutAttempt,
  processSimulatedCheckout,
  generateDemoPaymentRef,
} from "@/lib/actions/affiliate-simulator";

export default function PublicSimulatorProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = (params?.slug as string) || "";
  const refCode = searchParams.get("ref") || "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clickId, setClickId] = useState<string>("");

  // Checkout State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"info" | "orange_money">("info");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentRef, setPaymentRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    // Generate idempotency key for this checkout session
    setIdempotencyKey(`IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

    // Auto-generate a realistic Demo Orange Money reference
    generateDemoPaymentRef().then((ref) => setPaymentRef(ref));

    async function loadData() {
      try {
        setLoading(true);
        const res = await getTrainingProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);

          // Track click if refCode present
          if (refCode) {
            let visitorId = "";
            try {
              visitorId = localStorage.getItem("pa_demo_visitor_id") || "";
              if (!visitorId) {
                visitorId = `vis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                localStorage.setItem("pa_demo_visitor_id", visitorId);
              }
            } catch (e) {
              visitorId = `vis-${Date.now()}`;
            }

            const clickRes = await recordTrainingClick({
              code: refCode,
              visitorId,
              landingPage: window.location.pathname + window.location.search,
              referrer: document.referrer || undefined,
            });

            if (clickRes?.success && clickRes.clickId) {
              setClickId(clickRes.clickId);
            }
          }
        } else {
          toast.error("Product not found in training catalog.");
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadData();
  }, [slug, refCode]);

  const handleStartCheckout = async () => {
    setCheckoutModalOpen(true);
    setCheckoutStep("info");
    if (clickId) {
      await recordCheckoutAttempt(clickId);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please fill in your customer name and phone number.");
      return;
    }
    setCheckoutStep("orange_money");
  };

  const handleConfirmPurchase = async () => {
    if (!paymentRef.trim()) {
      toast.error("Demonstration payment reference is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await processSimulatedCheckout({
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
        productId: product.id,
        quantity,
        paymentRef: paymentRef.trim(),
        paymentMethod: "DEMO_ORANGE_MONEY",
        linkCode: refCode || undefined,
        clickId: clickId || undefined,
        idempotencyKey,
      });

      if (res.success && res.orderRef) {
        toast.success("Demonstration purchase completed!");
        router.push(`/affiliate/simulator/checkout/confirmation/${res.orderRef}`);
      } else {
        toast.error(res.error || "Failed to complete demonstration checkout.");
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshPaymentRef = async () => {
    const newRef = await generateDemoPaymentRef();
    setPaymentRef(newRef);
    toast.info("Generated new demonstration Orange Money reference.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Demonstration Product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Package className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Training Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          The requested demonstration product is currently unavailable or has been archived by the instructor.
        </p>
        <Link
          href="/affiliate/simulator"
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm"
        >
          Return to Training Hub
        </Link>
      </div>
    );
  }

  const unitPrice = Number(product.price);
  const totalAmount = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-amber-500 text-white py-2 px-4 text-center font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-sm">
        ⚠️ PROTECH TRAINING SIMULATOR — NO REAL MONEY WILL BE CHARGED OR PAID ⚠️
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* Simulator Full Notice Card */}
        <SimulatorNoticeBanner />

        {/* Breadcrumb / Referral Attribution pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href="/affiliate/simulator"
            className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Academy Marketplace
          </Link>

          {refCode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Attributed Student Referral: <span className="font-black underline">{refCode}</span></span>
            </div>
          )}
        </div>

        {/* Product Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {/* Image Column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square max-h-[420px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Package className="h-20 w-20 stroke-1 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Demo Training Asset</span>
                </div>
              )}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                {product.category || "General Demonstration"}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Practical Course Demonstration Item
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Tag */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Demonstration Price
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    NLe {unitPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                    Affiliate Comm. Rate
                  </span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {product.commissionPct}% (NLe {product.calculatedCommission})
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">About Product</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description || "Training product item for practical affiliate link generation and customer checkout flow."}
                </p>
              </div>

              {/* Specifications if present */}
              {product.specifications && typeof product.specifications === "object" && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Demonstration Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800"
                      >
                        <span className="font-bold text-slate-400 capitalize block text-[10px]">{key}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {Array.isArray(val) ? val.join(", ") : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartCheckout}
                  className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Proceed to Simulated Checkout
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <p className="text-center text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-500/20">
                🔒 Demonstration Mode: No real mobile money or card payments accepted. Safe training flow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {checkoutStep === "info" ? "Step 1 of 2: Customer Details" : "Step 2 of 2: Simulated Payment"}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {checkoutStep === "info" ? "Order Information" : "Simulated Orange Money Checkout"}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Prominent Mandatory Training Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="block font-black uppercase text-[11px] tracking-wider text-rose-600 dark:text-rose-400">
                  TRAINING DEMONSTRATION ONLY
                </span>
                NO REAL PAYMENT WILL BE PROCESSED. DO NOT SEND MONEY TO ANYONE. NEVER ENTER A REAL PIN OR OTP.
              </div>
            </div>

            {/* STEP 1: Customer Info */}
            {checkoutStep === "info" && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Product</span>
                    <span className="text-slate-800 dark:text-slate-200">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Unit Price</span>
                    <span className="text-slate-900 dark:text-white font-black">NLe {unitPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-lg flex items-center justify-center cursor-pointer hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-black text-base px-4">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.demoStock || 10, q + 1))}
                      className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-lg flex items-center justify-center cursor-pointer hover:bg-slate-200"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-400 ml-auto font-bold">
                      Order Subtotal: <span className="text-slate-900 dark:text-white font-black">NLe {totalAmount.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mariama Sesay"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Customer Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +232 76 123 456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Customer Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Customer Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {refCode && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>Referring Affiliate Student:</span>
                    <span className="font-black underline">{refCode}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  Continue to Orange Money Simulation
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Simulated Orange Money Payment */}
            {checkoutStep === "orange_money" && (
              <div className="space-y-5">
                {/* Method Card */}
                <div className="p-4 rounded-2xl bg-orange-500/10 border-2 border-orange-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        OM
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          Orange Money — Simulation
                        </h4>
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                          Practice Mobile Payment
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      NLe {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    In live mobile money workflows, customers authorize via USSD/app and receive a transaction code. In this training simulator, enter or generate an illustrative reference below.
                  </p>
                </div>

                {/* Demo Reference Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Demo Orange Money Reference <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={refreshPaymentRef}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate Sample Ref
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="DEMO-OM-2026-0001"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-orange-500/50 text-slate-900 dark:text-white font-mono text-sm font-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Illustrative sample reference for training confirmation audit.
                  </span>
                </div>

                {/* Customer summary */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{customerName} ({customerPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referral Code:</span>
                    <span className="font-bold text-emerald-600">{refCode || "Direct (Unattributed)"}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("info")}
                    disabled={isSubmitting}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Recording Demo Purchase...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Confirm Demo Purchase (No Real Money)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
