"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Package,
  Calendar,
  DollarSign,
  User,
  Phone,
  Share2,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { SimulatorNoticeBanner } from "@/components/affiliate/SimulatorNoticeBanner";
import { getDemoOrderDetails } from "@/lib/actions/affiliate-simulator";

export default function DemoOrderConfirmationPage() {
  const params = useParams();
  const orderRef = (params?.orderRef as string) || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await getDemoOrderDetails(orderRef);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          toast.error("Demonstration order reference not found.");
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    }

    if (orderRef) loadOrder();
  }, [orderRef]);

  const copyOrderRef = () => {
    if (!order?.orderRef) return;
    navigator.clipboard.writeText(order.orderRef);
    setCopied(true);
    toast.success("Order reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Retrieving Demonstration Receipt...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-400 mb-3" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Order Reference Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          No training order matched <span className="font-mono font-bold">{orderRef}</span>.
        </p>
        <Link
          href="/affiliate/simulator"
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
        >
          Return to Simulator Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner */}
        <SimulatorNoticeBanner />

        {/* Receipt Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                Practice Order Recorded
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Demonstration Purchase Successful!
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your training order has been recorded in the database. The referring affiliate student has received an automated simulated commission notification.
            </p>
          </div>

          {/* Prominent Mandatory Training Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1">
            <div className="font-black uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>⚠️</span> Educational Simulation Notice
            </div>
            <p className="font-medium leading-relaxed">
              No real payment was processed, and no physical product has been purchased or dispatched. This demonstration record verifies that your affiliate marketing checkout attribution worked seamlessly.
            </p>
          </div>

          {/* Order Details Grid */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs">
            {/* Reference */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Order Reference</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{order.orderRef}</span>
                <button
                  onClick={copyOrderRef}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Copy reference"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Product */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Product</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.product?.name} (Qty: {order.quantity})
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Method</span>
              <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <span>🟠</span> Orange Money — Simulation
              </span>
            </div>

            {/* Demo OM Reference */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Demo Transaction Ref</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{order.paymentRef}</span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                Demo Payment Confirmed
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Order Total</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                NLe {Number(order.totalAmount).toLocaleString()}
              </span>
            </div>

            {/* Affiliate Referral */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Affiliate Referral</span>
              <div className="text-right">
                <span className="font-black text-emerald-600 dark:text-emerald-400 block">
                  {order.affiliate ? `${order.affiliate.fullName} (${order.affiliate.affiliateCode})` : "Direct / Unattributed"}
                </span>
                {order.commissionAmount > 0 && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    Demo Commission: NLe {order.commissionAmount.toLocaleString()} ({order.commissionPct}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/affiliate/simulator"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm text-center shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              Go to Student Simulator Hub
            </Link>
            <Link
              href={`/affiliate/simulator/shop/${order.product?.slug || ""}`}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm text-center transition-all cursor-pointer"
            >
              Test Another Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
