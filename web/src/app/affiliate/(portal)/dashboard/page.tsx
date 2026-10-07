"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  TrendingUp,
  Users,
  MousePointerClick,
  DollarSign,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  QrCode,
  FileText,
  Brain,
  MessageSquare,
  Building2,
  GraduationCap,
  Sparkles,
  Layers,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateDashboardStats } from "@/lib/actions/affiliate";

export default function AffiliateDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://protechassist.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }

    async function load() {
      try {
        const res = await getAffiliateDashboardStats();
        if (res.success) {
          setData(res);
        } else {
          toast.error(res.error || "Failed to load dashboard metrics");
        }
      } catch (err: any) {
        toast.error("Network error fetching stats");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const copyToClipboard = () => {
    if (!data?.affiliate?.affiliateCode) return;
    const url = `${baseUrl}/ref/${data.affiliate.affiliateCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Primary referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    if (!data?.affiliate?.affiliateCode) return;
    const url = `${baseUrl}/ref/${data.affiliate.affiliateCode}`;
    const text = `🚀 Check out ProTech Assist SL - Leading Business Management Software, AI Masterclasses & Tech Solutions in Sierra Leone!\n\n👉 Learn more & start your free trial: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const referralUrl = data?.affiliate?.affiliateCode
    ? `${baseUrl}/ref/${data.affiliate.affiliateCode}`
    : `${baseUrl}/ref/...`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white rounded-3xl border border-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  const { affiliate, kpis, recentConversions, recentClicks } = data || {};
  const isApproved = affiliate?.status === "APPROVED";

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Status Alert Banner */}
      {affiliate?.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-amber-900 text-sm">
              Application Under Super Admin Verification
            </h3>
            <p className="text-amber-800 leading-relaxed">
              Your partner application is being verified by ProTech Assist SL management. Once approved, you will automatically receive an official confirmation email with your permanent credentials, and live commission withdrawals will be unlocked. You may still test and share your referral link below.
            </p>
          </div>
        </div>
      )}

      {affiliate?.status === "REJECTED" && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-rose-900 text-sm">
              Partner Application Status: Not Approved
            </h3>
            <p className="text-rose-800 leading-relaxed">
              {affiliate?.rejectionReason
                ? `Reason: ${affiliate.rejectionReason}`
                : "Your application could not be approved at this time. Please contact ProTech Assist support to update your information."}
            </p>
          </div>
        </div>
      )}

      {affiliate?.status === "SUSPENDED" && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-rose-900 text-sm">
              Partner Account Suspended
            </h3>
            <p className="text-rose-800 leading-relaxed">
              Your affiliate account is currently suspended. Please contact partner support at support@protechassist.com to reactivate your account.
            </p>
          </div>
        </div>
      )}

      {/* Executive Welcome & Primary Referral Link Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-50 border border-emerald-200 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Certified Partner Portal
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {affiliate?.status === "APPROVED" ? "🟢 Active Partner" : "🟡 Under Verification"}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {affiliate?.affiliateCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Welcome back, {affiliate?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Share your verified referral link across Sierra Leone. Visitors who click your link are attributed to your account for <strong>30 days</strong>. Payouts available via Orange Money, Afrimoney, or Bank Transfer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/affiliate/links"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition flex items-center gap-1.5 shadow-sm"
            >
              Custom Campaign Links <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/affiliate/marketing"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              Marketing Media Kit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Primary Referral Link Action Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-inner">
          <div className="space-y-1 overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Your Primary Referral Link
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold hidden sm:inline">
                30-Day Attribution Active
              </span>
            </div>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs sm:text-base font-black text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 truncate group"
              title="Click to visit your referral link"
            >
              <span className="truncate">{referralUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Link!" : "Copy Link"}
            </button>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Link
            </a>
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* 4 Refined KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Clicks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Clicks
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {kpis?.totalClicks || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {kpis?.uniqueVisitors || 0} unique visitors
          </p>
        </div>

        {/* Conversions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Conversions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {kpis?.totalConversions || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {kpis?.conversionRate || "0.0"}% conversion rate
          </p>
        </div>

        {/* Pending Commissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Payout
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            NLe {(kpis?.pendingAmount || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Under admin verification
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            NLe {(kpis?.availableBalance || 0).toFixed(2)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/affiliate/payouts"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              Withdraw Cash &rarr;
            </Link>
            <span className="text-[10px] text-slate-400 font-mono">
              Paid: NLe {(kpis?.paidAmount || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Converting Products Pitch Guide in White */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> High-Converting Solutions Guide
            </h2>
            <p className="text-xs text-slate-500">
              Pitch these targeted solutions to earn product-specific commissions across Sierra Leone.
            </p>
          </div>
          <Link
            href="/affiliate/marketing"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Download Flyers & Banners &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Solution 1: Enterprise OS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-emerald-300 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-slate-200">
                  Recurring SaaS
                </span>
                <Laptop className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Enterprise OS POS & Inventory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target retail shops, pharmacies, supermarkets, and restaurants. Pitch barcode scanning, automated expiry alerts, and thermal receipts.
              </p>
            </div>
            <Link
              href="/affiliate/links"
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 text-center transition block shadow-sm"
            >
              Get POS Tracking Link &rarr;
            </Link>
          </div>

          {/* Solution 2: AI Masterclass */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-emerald-300 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-purple-700 border border-slate-200">
                  Tech Academy
                </span>
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI & Prompt Engineering</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target university students, young professionals, and creatives. Pitch practical AI tools, automation, and certified training.
              </p>
            </div>
            <Link
              href="/affiliate/links"
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 text-center transition block shadow-sm"
            >
              Get AI Course Link &rarr;
            </Link>
          </div>

          {/* Solution 3: Custom Web & Mobile Apps */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-emerald-300 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-blue-700 border border-slate-200">
                  Corporate Contracts
                </span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Custom Web & Mobile Apps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target NGOs, schools, and corporate institutions needing specialized database systems, portals, or mobile apps.
              </p>
            </div>
            <Link
              href="/affiliate/links"
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 text-center transition block shadow-sm"
            >
              Get Custom IT Link &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Conversions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversions */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Recent Referral Conversions
            </h2>
            <Link
              href="/affiliate/commissions"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View Full Ledger &rarr;
            </Link>
          </div>

          {recentConversions && recentConversions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentConversions.map((conv: any) => (
                <div key={conv.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{conv.customerName || "Verified Customer"}</p>
                    <p className="text-[11px] text-slate-500">
                      {conv.productName || "ProTech Solution"} &bull;{" "}
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-700 font-mono">
                      +NLe {(Number(conv.commission?.amount) || 0).toFixed(2)}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {conv.commission?.status || "APPROVED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No conversions recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Share your referral link on WhatsApp or pitch in-person to retail shops to register your first sale!
              </p>
            </div>
          )}
        </div>

        {/* Recent Clicks Activity */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-blue-600" /> Recent Referral Clicks
            </h2>
            <Link
              href="/affiliate/links"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Manage Links &rarr;
            </Link>
          </div>

          {recentClicks && recentClicks.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentClicks.map((click: any) => (
                <div key={click.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[220px] sm:max-w-xs">
                    <p className="font-semibold text-slate-900 truncate font-mono">
                      {click.landingPage || "/"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {click.referrer ? new URL(click.referrer).hostname : "Direct / WhatsApp"}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    {new Date(click.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No clicks recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Copy your primary referral link above and share it on WhatsApp status or Facebook to start receiving clicks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
