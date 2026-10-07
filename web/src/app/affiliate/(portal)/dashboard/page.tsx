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
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateDashboardStats } from "@/lib/actions/affiliate";

export default function AffiliateDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://protechassist.com");
  const [showPitchModal, setShowPitchModal] = useState(false);

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
        toast.error("Error fetching affiliate data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const referralUrl = data?.affiliate
    ? `${baseUrl}/ref/${data.affiliate.affiliateCode}`
    : `${baseUrl}/ref/loading`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Upgrade your business with ProTech Assist SL! Get Enterprise OS inventory software, custom websites, and world-class tech training. Learn more here: ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-72 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  const { affiliate, kpis, recentConversions, recentClicks } = data || {};
  const isApproved = affiliate?.status === "APPROVED";

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Status Alert Banner */}
      {affiliate?.status === "PENDING" && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-amber-200 text-sm">
              Application Under Super Admin Verification
            </h3>
            <p className="text-amber-300/80 leading-relaxed">
              Your partner application is being verified by ProTech Assist SL management. Once approved, you will automatically receive an official confirmation email with your permanent credentials, and your live commission withdrawals will be unlocked. You may still test and share your referral link below.
            </p>
          </div>
        </div>
      )}

      {affiliate?.status === "REJECTED" && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-rose-200 text-sm">
              Partner Application Status: Not Approved
            </h3>
            <p className="text-rose-300/80 leading-relaxed">
              {affiliate?.rejectionReason
                ? `Reason: ${affiliate.rejectionReason}`
                : "Your application could not be approved at this time. Please contact ProTech Assist support to update your information."}
            </p>
          </div>
        </div>
      )}

      {affiliate?.status === "SUSPENDED" && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-rose-200 text-sm">
              Partner Account Suspended
            </h3>
            <p className="text-rose-300/80 leading-relaxed">
              Your affiliate account is currently suspended. Please contact partner support at support@protechassist.com to reactivate your account.
            </p>
          </div>
        </div>
      )}

      {/* Executive Welcome & Primary Referral Link Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Partner Portal
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isApproved
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                    : "bg-amber-950 text-amber-400 border-amber-800"
                }`}
              >
                {affiliate?.status === "APPROVED" ? "🟢 Active Partner" : "🟡 Under Verification"}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                {affiliate?.affiliateCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Welcome back, {affiliate?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Share your verified referral link across Sierra Leone. Visitors who click your link are attributed to your account for <strong>30 days</strong>. Payouts available via Orange Money, Afrimoney, or Bank.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/affiliate/links"
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              Custom Campaign Links <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/affiliate/marketing"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
            >
              Marketing Resources <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Primary Referral Link Action Box */}
        <div className="relative z-10 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-inner">
          <div className="space-y-1 overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Your Primary Referral Link
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">
                30-Day Attribution Active
              </span>
            </div>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs sm:text-base font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 truncate group"
              title="Click to visit your referral link"
            >
              <span className="truncate">{referralUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Link!" : "Copy Link"}
            </button>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Link
            </a>
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* 4 Refined KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Clicks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Link Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {kpis?.totalClicks || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {kpis?.uniqueVisitors || 0} unique visitors tracked
          </p>
        </div>

        {/* Conversions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Verified Conversions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {kpis?.totalConversions || 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 font-bold border border-blue-900">
              {kpis?.conversionRate || 0}%
            </span>
            <span className="text-slate-400">conversion rate</span>
          </div>
        </div>

        {/* Pending Commissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            NLe {(kpis?.pendingCommission || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            Holding period before clearance
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-emerald-400">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            NLe {(kpis?.availableBalance || 0).toFixed(2)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 font-mono">
              Min: NLe {kpis?.minPayout || 100}
            </span>
            <Link
              href="/affiliate/payouts"
              className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Withdraw <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Pitch Guide / High-Converting Solutions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Top Converting ProTech Solutions</h2>
              <p className="text-xs text-slate-400">Recommend these high-demand products to maximize your commission earnings</p>
            </div>
          </div>
          <Link
            href="/affiliate/marketing"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 hidden sm:inline-flex"
          >
            All Marketing Scripts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
              Software &bull; Retail & Pharmacy
            </span>
            <h4 className="font-bold text-white text-sm">Enterprise OS Inventory POS</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For supermarket, boutique, and pharmacy owners. Barcode POS, stock alerts, thermal receipts & profit reports.
            </p>
            <div className="pt-2">
              <Link
                href={`/affiliate/links`}
                className="text-[11px] font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Create Campaign Link <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900">
              Training &bull; Career
            </span>
            <h4 className="font-bold text-white text-sm">Software Engineering & AI Masterclass</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hands-on coding, prompt engineering, and certification cohorts for students and ambitious professionals.
            </p>
            <div className="pt-2">
              <Link
                href={`/affiliate/links`}
                className="text-[11px] font-semibold text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Create Training Link <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-900">
              Corporate &bull; Custom
            </span>
            <h4 className="font-bold text-white text-sm">Custom Websites & Mobile Apps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise digital transformation for NGOs, corporate businesses, schools, and hospitals across Sierra Leone.
            </p>
            <div className="pt-2">
              <Link
                href={`/affiliate/links`}
                className="text-[11px] font-semibold text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                Create Services Link <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Recent Conversions & Click Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Conversions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Conversions Ledger</h2>
              <p className="text-xs text-slate-400">Verified qualifying transactions referred by you</p>
            </div>
            <Link
              href="/affiliate/commissions"
              className="text-xs text-emerald-400 hover:underline font-bold"
            >
              View All Records
            </Link>
          </div>

          {recentConversions && recentConversions.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {recentConversions.map((conv: any) => (
                <div key={conv.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        {conv.orderType.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          conv.commissionStatus === "PAID"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : conv.commissionStatus === "APPROVED"
                            ? "bg-blue-950 text-blue-400 border border-blue-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {conv.commissionStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Referred: <span className="font-mono">{conv.customerMasked}</span> &bull; Order: {conv.currency} {conv.orderAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-emerald-400">
                      + NLe {conv.commissionAmount.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">No conversions recorded yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Share your referral link on WhatsApp, Facebook, or with local shop owners. When they subscribe or enroll in a training, your commission will appear here automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Click Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Live Click Activity</h2>
              <p className="text-xs text-slate-400">Recent visitors through your links</p>
            </div>
            <Link
              href="/affiliate/links"
              className="text-xs text-emerald-400 hover:underline font-bold"
            >
              All Links
            </Link>
          </div>

          {recentClicks && recentClicks.length > 0 ? (
            <div className="space-y-3">
              {recentClicks.map((click: any) => (
                <div
                  key={click.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400">
                      {click.linkCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] truncate">
                    Target: {click.landingPage}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Source: {click.referrer || "Direct / WhatsApp Link"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-3">
              <MousePointerClick className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">No click traffic yet</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time visitor clicks stream right here as soon as someone taps your link.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
