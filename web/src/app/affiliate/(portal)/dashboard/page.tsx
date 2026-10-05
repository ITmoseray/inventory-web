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
      `Upgrade your business with ProTech Assist! Get Enterprise OS inventory software, custom websites, and world-class tech training. Learn more here: ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  const { affiliate, kpis, recentConversions, recentClicks } = data || {};
  const isApproved = affiliate?.status === "APPROVED";

  return (
    <div className="space-y-8">
      {/* Welcome & Primary Referral Link Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Affiliate Partner Portal
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isApproved
                    ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                    : "bg-amber-950 border-amber-800 text-amber-400"
                }`}
              >
                {affiliate?.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome, {affiliate?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your unique affiliate link is ready to share. Visitors who click your link will be attributed to your account for 30 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/affiliate/links"
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              Custom Links <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/affiliate/marketing"
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950 transition flex items-center gap-1.5"
            >
              Marketing Resources <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Big Link Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="space-y-1 overflow-hidden min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Your Primary Referral Link
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">
                Tap to open in new tab
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
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Link!" : "Copy Link"}
            </button>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Link
            </a>
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Clicks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {kpis?.totalClicks || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {kpis?.uniqueVisitors || 0} unique visitors tracked
          </p>
        </div>

        {/* Conversions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Verified Conversions</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {kpis?.totalConversions || 0}
          </div>
          <p className="text-[11px] text-blue-400 font-medium">
            {kpis?.conversionRate || 0}% conversion rate
          </p>
        </div>

        {/* Pending Commissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
            NLe {(kpis?.pendingCommission || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            Holding period before approval
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-emerald-300">Available for Payout</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            NLe {(kpis?.availableBalance || 0).toFixed(2)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Min. threshold: NLe {kpis?.minPayout || 100}
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

      {/* Two-Column Section: Recent Conversions & Click Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Conversions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Conversions</h2>
              <p className="text-xs text-slate-400">Verified qualifying transactions referred by you</p>
            </div>
            <Link
              href="/affiliate/commissions"
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View All
            </Link>
          </div>

          {recentConversions && recentConversions.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {recentConversions.map((conv: any) => (
                <div key={conv.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {conv.orderType.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                    <p className="text-xs text-slate-400">
                      Referred: {conv.customerMasked} &bull; Order: {conv.currency} {conv.orderAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">
                      + NLe {conv.commissionAmount.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No conversions recorded yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your referral link on WhatsApp status, social media, or with business clients. When they subscribe or register, your commission appears here.
              </p>
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
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              All Links
            </Link>
          </div>

          {recentClicks && recentClicks.length > 0 ? (
            <div className="space-y-3">
              {recentClicks.map((click: any) => (
                <div
                  key={click.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-400">
                      {click.linkCode}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate">
                    Destination: {click.landingPage}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Source: {click.referrer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <MousePointerClick className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No click traffic yet</p>
              <p className="text-xs text-slate-500">
                Clicks on your links will stream in real-time right here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
