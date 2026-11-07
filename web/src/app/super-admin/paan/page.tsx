"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building,
  TrendingUp,
  DollarSign,
  Users,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Wallet,
  ArrowRight,
  ExternalLink,
  Phone,
  Smartphone,
  Check,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { getSuperAdminPaanOverview } from "@/lib/actions/paan";

export default function SuperAdminPaanSuite() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "attributions" | "ledger" | "payouts">("overview");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getSuperAdminPaanOverview();
      if (res.success) {
        setOverview(res);
      } else {
        toast.error(res.error || "Failed to load PAAN overview");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading PAAN Network Administration...</p>
      </div>
    );
  }

  const stats = overview?.stats;
  const offlineAttributions = overview?.offlineAttributions || [];
  const ledgerEntries = overview?.ledgerEntries || [];
  const pendingPayouts = overview?.pendingPayouts || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> ProTech Assist Central Authority
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            PAAN National Affiliate Marketplace Administration
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Connecting Businesses. Empowering Marketers. Driving Sales Across Sierra Leone.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Network Data
        </button>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Network GMV</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            NLe {stats?.totalGMV?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Attributed Sales</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Affiliate Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            NLe {stats?.totalAffiliateCommissions?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Paid & Pending Marketer Cut</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>ProTech Platform Fee</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">
            NLe {stats?.totalPlatformRevenue?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">30% Network Platform Share</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Merchants & Affiliates</span>
            <Building className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalMerchants || 0} / {stats?.totalAffiliates || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Merchants vs Marketers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "attributions", label: `Offline Walk-In Attributions (${offlineAttributions.length})` },
          { key: "ledger", label: `National Financial Ledger (${ledgerEntries.length})` },
          { key: "payouts", label: `Pending Withdrawals (${pendingPayouts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-900 text-blue-600 border-t-2 border-blue-600 border-x border-slate-200 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" /> Merchant Participation
              </h3>
              <p className="text-xs text-slate-500">
                Registered Sierra Leonean merchants, shops, supermarkets, and service providers participating in PAAN.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Merchants</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalMerchants || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40">
                  <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Active Campaigns</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{stats?.activeCampaigns || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Marketer Network
              </h3>
              <p className="text-xs text-slate-500">
                Registered independent affiliates, Academy students, and social promoters actively generating links.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Marketers</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalAffiliates || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <p className="text-xs text-emerald-600 dark:text-emerald-300 font-bold uppercase">Pending Payouts</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{pendingPayouts.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OFFLINE ATTRIBUTIONS AUDIT */}
      {activeTab === "attributions" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Audited Offline Physical Shop Attributions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Ref Code</th>
                  <th className="p-3">Merchant</th>
                  <th className="p-3">Marketer</th>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Sale GMV</th>
                  <th className="p-3">Affiliate (70%)</th>
                  <th className="p-3">ProTech (30%)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {offlineAttributions.map((attr: any) => (
                  <tr key={attr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs font-bold text-blue-600">{attr.attributionRef}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{attr.merchant.business.name}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{attr.affiliate.fullName}</p>
                      <p className="text-xs font-mono text-slate-400">{attr.affiliate.affiliateCode}</p>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">{attr.receiptNumber || "N/A"}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">NLe {Number(attr.saleAmount).toFixed(2)}</td>
                    <td className="p-3 font-bold text-emerald-600">NLe {Number(attr.affiliateEarning).toFixed(2)}</td>
                    <td className="p-3 font-bold text-indigo-600">NLe {Number(attr.platformRevenue).toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {attr.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{new Date(attr.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: IMMUTABLE FINANCIAL LEDGER */}
      {activeTab === "ledger" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">National Double-Entry Financial Ledger</h3>
            <p className="text-slate-500 text-xs">
              Every balance movement, accrual, approval, and payout is strictly recorded with an immutable transaction reference.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Tx Ref</th>
                  <th className="p-3">Entry Type</th>
                  <th className="p-3">Affiliate / Merchant</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Balance Trail</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {ledgerEntries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs font-bold text-blue-600">{entry.transactionRef}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="p-3">
                      {entry.affiliate ? (
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{entry.affiliate.fullName}</p>
                          <p className="text-xs font-mono text-slate-400">{entry.affiliate.affiliateCode}</p>
                        </div>
                      ) : entry.merchant ? (
                        <p className="font-bold text-slate-900 dark:text-white">{entry.merchant.business.name}</p>
                      ) : (
                        <span className="text-slate-400">Platform System</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">NLe {Number(entry.amount).toFixed(2)}</td>
                    <td className="p-3 font-bold text-xs">
                      <span className={entry.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"}>
                        {entry.direction}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">
                      NLe {Number(entry.balanceBefore).toFixed(2)} &rarr; NLe {Number(entry.balanceAfter).toFixed(2)}
                    </td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="p-3 text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: WITHDRAWALS */}
      {activeTab === "payouts" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Marketer Withdrawal Requests</h3>
            <p className="text-slate-500 text-xs">
              Verify mobile money (Orange Money, Afrimoney) or bank transfers and record the transaction reference.
            </p>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold">All withdrawal requests have been processed!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Marketer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payout Method</th>
                    <th className="p-3">Destination Details</th>
                    <th className="p-3">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {pendingPayouts.map((payout: any) => (
                    <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{payout.affiliate.fullName}</p>
                        <p className="text-xs font-mono text-slate-400">{payout.affiliate.affiliateCode}</p>
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        NLe {Number(payout.amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {payout.method}
                        </span>
                      </td>
                      <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                        {JSON.stringify(payout.accountDetails)}
                      </td>
                      <td className="p-3 text-xs text-slate-400">{new Date(payout.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
