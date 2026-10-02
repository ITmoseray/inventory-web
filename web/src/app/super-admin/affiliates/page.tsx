"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Wallet,
  MousePointerClick,
  Share2,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  X,
  Send,
  Eye,
  Smartphone,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSuperAdminAffiliateStats,
  getAdminAffiliatesList,
  getAdminAffiliateDetails,
  updateAdminAffiliateStatus,
  updateAdminAffiliateRateOverride,
  getCommissionRules,
  saveCommissionRule,
  deleteCommissionRule,
  getAdminCommissions,
  updateAdminCommissionStatus,
  getAdminPayouts,
  recordAdminPayoutExecution,
  getAdminMarketingMaterials,
  saveAdminMarketingMaterial,
  deleteAdminMarketingMaterial,
  getAdminAffiliateSettings,
  updateAdminAffiliateSettings,
} from "@/lib/actions/affiliate-admin";

export default function SuperAdminAffiliatesSuite() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "affiliates" | "commissions" | "payouts" | "rules" | "marketing" | "settings"
  >("overview");

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab: Affiliates
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState("ALL");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [selectedAffiliateDetail, setSelectedAffiliateDetail] = useState<any>(null);
  const [rateOverrideModalOpen, setRateOverrideModalOpen] = useState(false);
  const [targetAffiliateForRate, setTargetAffiliateForRate] = useState<any>(null);
  const [newRateOverride, setNewRateOverride] = useState<string>("");

  // Tab: Commissions
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("ALL");
  const [commissionSearch, setCommissionSearch] = useState("");

  // Tab: Payouts
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [payoutTxRef, setPayoutTxRef] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");

  // Tab: Rules
  const [rules, setRules] = useState<any[]>([]);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    id: undefined as string | undefined,
    productSlug: "",
    productName: "",
    category: "SOFTWARE",
    type: "PERCENTAGE",
    rate: 10,
    isActive: true,
    description: "",
  });

  // Tab: Marketing
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    id: undefined as string | undefined,
    title: "",
    category: "BANNERS",
    productSlug: "",
    description: "",
    fileUrl: "",
    fileType: "IMAGE",
    textContent: "",
    dimensions: "1080x1080",
    isActive: true,
  });

  // Tab: Settings
  const [settings, setSettings] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [statsRes, affRes, commRes, payRes, rulesRes, matRes, setRes] =
        await Promise.all([
          getSuperAdminAffiliateStats(),
          getAdminAffiliatesList({ status: affiliateStatusFilter, search: affiliateSearch }),
          getAdminCommissions({ status: commissionStatusFilter, search: commissionSearch }),
          getAdminPayouts(),
          getCommissionRules(),
          getAdminMarketingMaterials(),
          getAdminAffiliateSettings(),
        ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (affRes.success) setAffiliates(affRes.affiliates);
      if (commRes.success) setCommissions(commRes.commissions);
      if (payRes.success) setPayouts(payRes.payouts);
      if (rulesRes.success) setRules(rulesRes.rules);
      if (matRes.success) setMaterials(matRes.materials);
      if (setRes.success) setSettings(setRes.settings);
    } catch (e) {
      console.error(e);
      toast.error("Error loading affiliate suite data");
    } finally {
      setLoading(false);
    }
  }

  // Reload specific tabs on filter changes
  useEffect(() => {
    if (activeTab === "affiliates") {
      getAdminAffiliatesList({ status: affiliateStatusFilter, search: affiliateSearch }).then(
        (res) => {
          if (res.success) setAffiliates(res.affiliates);
        }
      );
    }
  }, [affiliateStatusFilter, affiliateSearch, activeTab]);

  useEffect(() => {
    if (activeTab === "commissions") {
      getAdminCommissions({ status: commissionStatusFilter, search: commissionSearch }).then(
        (res) => {
          if (res.success) setCommissions(res.commissions);
        }
      );
    }
  }, [commissionStatusFilter, commissionSearch, activeTab]);

  // Handler: Affiliate Status Update
  const handleUpdateStatus = async (
    affiliateId: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED" | "DEACTIVATED"
  ) => {
    try {
      const res = await updateAdminAffiliateStatus(affiliateId, status);
      if (res.success) {
        toast.success(res.message);
        loadAllData();
        if (selectedAffiliateDetail) {
          setSelectedAffiliateDetail((prev: any) => ({ ...prev, status }));
        }
      } else {
        toast.error(res.error || "Status update failed");
      }
    } catch (e: any) {
      toast.error("Failed to update status");
    }
  };

  // Handler: Custom Override Rate
  const handleSaveRateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAffiliateForRate) return;

    try {
      const parsed = newRateOverride ? parseFloat(newRateOverride) : null;
      const res = await updateAdminAffiliateRateOverride(targetAffiliateForRate.id, parsed);
      if (res.success) {
        toast.success(res.message);
        setRateOverrideModalOpen(false);
        loadAllData();
      } else {
        toast.error("Failed to update rate override");
      }
    } catch (e) {
      toast.error("Error updating rate");
    }
  };

  // Handler: Commission Status
  const handleCommissionStatus = async (
    commissionId: string,
    status: "APPROVED" | "REJECTED" | "CANCELLED" | "REVERSED"
  ) => {
    try {
      const res = await updateAdminCommissionStatus(commissionId, status as any);
      if (res.success) {
        toast.success(res.message);
        loadAllData();
      } else {
        toast.error("Failed to update commission");
      }
    } catch (e) {
      toast.error("Error updating commission");
    }
  };

  // Handler: Process Payout
  const handleProcessPayout = async (status: "COMPLETED" | "FAILED") => {
    if (!selectedPayout) return;
    try {
      const res = await recordAdminPayoutExecution({
        payoutId: selectedPayout.id,
        status: status as any,
        transactionRef: payoutTxRef,
        notes: payoutNotes,
      });

      if (res.success) {
        toast.success(res.message);
        setPayoutModalOpen(false);
        setPayoutTxRef("");
        setPayoutNotes("");
        loadAllData();
      } else {
        toast.error("Failed to record payout");
      }
    } catch (e) {
      toast.error("Error executing payout");
    }
  };

  // Handler: Save Commission Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveCommissionRule({
        ...ruleFormData,
        rate: Number(ruleFormData.rate),
        type: ruleFormData.type as any,
      });
      if (res.success) {
        toast.success(res.message);
        setRuleModalOpen(false);
        getCommissionRules().then((r) => r.success && setRules(r.rules));
      } else {
        toast.error(res.error || "Failed to save rule");
      }
    } catch (e) {
      toast.error("Error saving rule");
    }
  };

  // Handler: Delete Rule
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this commission rule?")) return;
    try {
      const res = await deleteCommissionRule(ruleId);
      if (res.success) {
        toast.success(res.message);
        getCommissionRules().then((r) => r.success && setRules(r.rules));
      } else {
        toast.error(res.error || "Failed to delete rule");
      }
    } catch (e) {
      toast.error("Error deleting rule");
    }
  };

  // Handler: Save Marketing Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveAdminMarketingMaterial(materialForm);
      if (res.success) {
        toast.success(res.message);
        setMaterialModalOpen(false);
        getAdminMarketingMaterials().then((m) => m.success && setMaterials(m.materials));
      } else {
        toast.error(res.error || "Failed to save material");
      }
    } catch (e) {
      toast.error("Error saving resource");
    }
  };

  // Handler: Delete Marketing Material
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Delete this marketing resource?")) return;
    try {
      const res = await deleteAdminMarketingMaterial(id);
      if (res.success) {
        toast.success(res.message);
        getAdminMarketingMaterials().then((m) => m.success && setMaterials(m.materials));
      }
    } catch (e) {
      toast.error("Failed to delete resource");
    }
  };

  // Handler: Save Global Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateAdminAffiliateSettings({
        attributionWindowDays: Number(settings.attributionWindowDays),
        defaultCommissionType: settings.defaultCommissionType,
        defaultCommissionRate: Number(settings.defaultCommissionRate),
        minPayoutThreshold: Number(settings.minPayoutThreshold),
        attributionModel: settings.attributionModel,
        allowSelfReferrals: Boolean(settings.allowSelfReferrals),
        requireApproval: Boolean(settings.requireApproval),
        payoutTermsDays: Number(settings.payoutTermsDays),
        termsContent: settings.termsContent,
      });

      if (res.success) {
        toast.success(res.message);
        setSettings(res.settings);
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header & Back to Super Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/super-admin"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Super Admin Center
            </Link>
            <span className="text-slate-400">&bull;</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ProTech Affiliate Platform
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Affiliate &amp; Referral Marketing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review partner applications, verify commissions, disburse payouts (Orange Money, Afrimoney, Bank), and configure commission rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/affiliate/register"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            Public Register Link <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Affiliates</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalAffiliates || 0}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            {stats?.pendingAffiliates || 0} pending review
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Clicks</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalClicks || 0}
          </div>
          <div className="text-[10px] text-slate-400">tracked visits</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Conversions</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats?.totalConversions || 0}
          </div>
          <div className="text-[10px] text-slate-400">verified customers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Comm.</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            NLe {(stats?.totalPendingCommission || 0).toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-400">awaiting clearance</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Approved Comm.</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            NLe {(stats?.totalApprovedCommission || 0).toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-400">ready for payout</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Payout Requests</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats?.pendingPayouts || 0}
          </div>
          <div className="text-[10px] text-purple-500 font-bold">needs execution</div>
        </div>
      </div>

      {/* Main Suite Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Dashboard" },
          { id: "affiliates", label: `Affiliate Directory (${stats?.totalAffiliates || 0})` },
          { id: "commissions", label: "Commissions Ledger" },
          { id: "payouts", label: `Payout Disbursements (${stats?.pendingPayouts || 0})` },
          { id: "rules", label: "Commission Rules Catalog" },
          { id: "marketing", label: "Marketing Materials" },
          { id: "settings", label: "Global Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm"
                : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & DASHBOARD */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Action alerts */}
          {(stats?.pendingAffiliates > 0 || stats?.pendingPayouts > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats?.pendingAffiliates > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {stats.pendingAffiliates} Pending Affiliate Application(s)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Applicants awaiting review and activation.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAffiliateStatusFilter("PENDING");
                      setActiveTab("affiliates");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {stats?.pendingPayouts > 0 && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-400">
                        {stats.pendingPayouts} Pending Payout Request(s)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Affiliates requesting withdrawal to Orange/Afrimoney/Bank.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("payouts")}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                  >
                    Disburse
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Summary Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Pending Affiliates */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Latest Affiliate Applications
                </h3>
                <button
                  onClick={() => setActiveTab("affiliates")}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {affiliates.slice(0, 5).map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {a.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {a.affiliateCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {a.email} &bull; {a.phone} ({a.city || a.country})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          a.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : a.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        }`}
                      >
                        {a.status}
                      </span>
                      {a.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, "APPROVED")}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Quick Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Rules Summary */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Active Commission Rules
                </h3>
                <button
                  onClick={() => setActiveTab("rules")}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Manage Catalog
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {rules.slice(0, 5).map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        slug: {r.productSlug} ({r.category || "GENERAL"})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {Number(r.rate)}
                        {r.type === "PERCENTAGE" ? "%" : " NLe"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AFFILIATES DIRECTORY */}
      {/* ============================================================== */}
      {activeTab === "affiliates" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={affiliateSearch}
                onChange={(e) => setAffiliateSearch(e.target.value)}
                placeholder="Search by name, email, phone, or affiliate code..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={affiliateStatusFilter}
                onChange={(e) => setAffiliateStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Affiliates Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Affiliate</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4 text-center">Clicks</th>
                    <th className="py-3.5 px-4 text-center">Conversions</th>
                    <th className="py-3.5 px-4 text-right">Total Earned</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {affiliates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No affiliates found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    affiliates.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">{a.fullName}</div>
                          <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {a.affiliateCode}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 space-y-0.5">
                          <div>{a.email}</div>
                          <div className="text-[11px] text-slate-500">{a.phone}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold">
                          {a.clicksCount}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {a.conversionsCount}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          NLe {a.totalEarned.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              a.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : a.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          {a.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(a.id, "APPROVED")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(a.id, "REJECTED")}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {a.status === "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(a.id, "SUSPENDED")}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-[11px]"
                            >
                              Suspend
                            </button>
                          )}

                          {a.status === "SUSPENDED" && (
                            <button
                              onClick={() => handleUpdateStatus(a.id, "APPROVED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                            >
                              Reactivate
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setTargetAffiliateForRate(a);
                              setRateOverrideModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-[11px]"
                            title="Set custom override commission rate"
                          >
                            Set Rate %
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rate Override Modal */}
      {rateOverrideModalOpen && targetAffiliateForRate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Set Individual Commission Override
            </h3>
            <p className="text-xs text-slate-500">
              For <strong>{targetAffiliateForRate.fullName}</strong> ({targetAffiliateForRate.affiliateCode}). This rate overrides product rules.
            </p>

            <form onSubmit={handleSaveRateOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  placeholder="e.g. 15 (leave blank to revert to standard rules)"
                  value={newRateOverride}
                  onChange={(e) => setNewRateOverride(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRateOverrideModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: COMMISSIONS LEDGER */}
      {/* ============================================================== */}
      {activeTab === "commissions" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={commissionSearch}
                onChange={(e) => setCommissionSearch(e.target.value)}
                placeholder="Search by affiliate code, customer email, or order ID..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <select
              value={commissionStatusFilter}
              onChange={(e) => setCommissionStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>

          {/* Commissions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Affiliate</th>
                    <th className="py-3.5 px-4">Order Ref &amp; Product</th>
                    <th className="py-3.5 px-4 text-right">Order Amount</th>
                    <th className="py-3.5 px-4 text-center">Rate</th>
                    <th className="py-3.5 px-4 text-right">Commission</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No commissions found.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {c.affiliate.fullName}
                          </div>
                          <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            {c.affiliate.affiliateCode}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold uppercase text-[11px] text-slate-900 dark:text-white">
                            {c.orderType?.replace("_", " ")}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cust: {c.customerEmail || "Direct"} &bull; Order #{c.orderId || "N/A"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium">
                          NLe {c.orderAmount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[10px] font-bold">
                            {c.rateApplied}
                            {c.rateType === "PERCENTAGE" ? "%" : " NLe"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          + NLe {c.amount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              c.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : c.status === "APPROVED"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : c.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          {c.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleCommissionStatus(c.id, "APPROVED")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCommissionStatus(c.id, "REJECTED")}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {c.status === "APPROVED" && (
                            <button
                              onClick={() => handleCommissionStatus(c.id, "REVERSED")}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-rose-600 font-semibold text-[11px]"
                            >
                              Reverse
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PAYOUT DISBURSEMENTS */}
      {/* ============================================================== */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Payout Requests &amp; Disbursements
            </h2>
            <p className="text-xs text-slate-500">
              Disburse payments via Orange Money, Afrimoney, Bank Transfer, or Cash, and record the transaction reference.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Affiliate</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4">Method &amp; Details</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Tx Reference</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No payout requests recorded.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {p.affiliate.fullName}
                          </div>
                          <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            {p.affiliate.affiliateCode} &bull; {p.affiliate.phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                          NLe {p.amount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {p.method?.replace("_", " ")}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {p.accountDetails?.mobileMoneyNumber ||
                              `${p.accountDetails?.bankName || ""} ${p.accountDetails?.bankAccountNumber || ""}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : p.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {p.transactionRef || "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => {
                                setSelectedPayout(p);
                                setPayoutTxRef("");
                                setPayoutNotes("");
                                setPayoutModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              Process Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payout Processing Modal */}
      {payoutModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Disburse Commission Payout
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <p>
                <strong>Affiliate:</strong> {selectedPayout.affiliate.fullName} ({selectedPayout.affiliate.affiliateCode})
              </p>
              <p>
                <strong>Amount:</strong> NLe {selectedPayout.amount.toFixed(2)}
              </p>
              <p>
                <strong>Method:</strong> {selectedPayout.method?.replace("_", " ")}
              </p>
              <p className="font-mono text-emerald-600 dark:text-emerald-400">
                {selectedPayout.accountDetails?.mobileMoneyNumber
                  ? `Phone: ${selectedPayout.accountDetails.mobileMoneyNumber} (${selectedPayout.accountDetails.mobileMoneyName})`
                  : `Bank: ${selectedPayout.accountDetails?.bankName} - ${selectedPayout.accountDetails?.bankAccountNumber}`}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Confirmation Reference (Orange Money TxID, Bank Ref)
                </label>
                <input
                  type="text"
                  placeholder="e.g. OM-20261002-8823"
                  value={payoutTxRef}
                  onChange={(e) => setPayoutTxRef(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via Orange Money agent"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayout("COMPLETED")}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Mark Paid &amp; Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: COMMISSION RULES CATALOG */}
      {/* ============================================================== */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Commission Rates &amp; Catalog Rules
              </h2>
              <p className="text-xs text-slate-500">
                Configure commission percentages or fixed bonuses per product, training cohort, or service.
              </p>
            </div>

            <button
              onClick={() => {
                setRuleFormData({
                  id: undefined,
                  productSlug: "",
                  productName: "",
                  category: "SOFTWARE",
                  type: "PERCENTAGE",
                  rate: 10,
                  isActive: true,
                  description: "",
                });
                setRuleModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold uppercase text-slate-500">
                      {r.category || "GENERAL"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {r.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {r.productName}
                  </h3>
                  <p className="font-mono text-xs text-slate-400">slug: {r.productSlug}</p>
                  <p className="text-xs text-slate-500">{r.description || "No description set"}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Reward</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {Number(r.rate)}
                      {r.type === "PERCENTAGE" ? "%" : " NLe"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRuleFormData({
                          id: r.id,
                          productSlug: r.productSlug,
                          productName: r.productName,
                          category: r.category || "SOFTWARE",
                          type: r.type,
                          rate: Number(r.rate),
                          isActive: r.isActive,
                          description: r.description || "",
                        });
                        setRuleModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Rule"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {r.productSlug !== "default" && (
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Form Modal */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {ruleFormData.id ? "Edit Commission Rule" : "Create Commission Rule"}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise OS Subscriptions"
                  value={ruleFormData.productName}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, productName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Slug (Identifier)
                </label>
                <input
                  type="text"
                  required
                  disabled={ruleFormData.productSlug === "default"}
                  placeholder="e.g. enterprise-os"
                  value={ruleFormData.productSlug}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, productSlug: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={ruleFormData.type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Bonus (NLe)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rate Value
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={ruleFormData.rate}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, rate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description of when this rule applies"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: MARKETING MATERIALS */}
      {/* ============================================================== */}
      {activeTab === "marketing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Marketing Materials &amp; Media Kit
              </h2>
              <p className="text-xs text-slate-500">
                Upload approved promotional banners, flyers, and WhatsApp scripts for your affiliates to download.
              </p>
            </div>

            <button
              onClick={() => {
                setMaterialForm({
                  id: undefined,
                  title: "",
                  category: "BANNERS",
                  productSlug: "",
                  description: "",
                  fileUrl: "",
                  fileType: "IMAGE",
                  textContent: "",
                  dimensions: "1080x1080",
                  isActive: true,
                });
                setMaterialModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold uppercase text-slate-500">
                    {m.category} &bull; {m.dimensions || "Media"}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</h4>
                  <p className="text-xs text-slate-500">{m.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Downloads: {m.downloadCount}</span>
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Modal */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Marketing Asset</h3>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise OS Square Flyer"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="BANNERS">Banners</option>
                    <option value="FLYERS">Flyers</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="SCRIPTS">WhatsApp Scripts</option>
                    <option value="DOCS">Brochures &amp; Docs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1080x1080"
                    value={materialForm.dimensions}
                    onChange={(e) => setMaterialForm({ ...materialForm, dimensions: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Download URL (CDN / Public Link)
                </label>
                <input
                  type="url"
                  placeholder="https://.../banner.png"
                  value={materialForm.fileUrl}
                  onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on usage..."
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaterialModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: GLOBAL SETTINGS & FRAUD RULES */}
      {/* ============================================================== */}
      {activeTab === "settings" && settings && (
        <div className="space-y-6 max-w-3xl">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Global Affiliate &amp; Anti-Fraud Settings
            </h2>
            <p className="text-xs text-slate-500">
              Configure attribution window, minimum payout thresholds, and fraud prevention policies.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attribution Window (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={settings.attributionWindowDays}
                  onChange={(e) =>
                    setSettings({ ...settings, attributionWindowDays: parseInt(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Duration referral cookies persist (Default: 30 days).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Payout Threshold (NLe)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  value={settings.minPayoutThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, minPayoutThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Minimum approved balance required to request a withdrawal (Default: NLe 100).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commission Holding / Clearance Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={settings.payoutTermsDays}
                  onChange={(e) =>
                    setSettings({ ...settings, payoutTermsDays: parseInt(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Grace period before a commission transitions from Pending to Approved (Default: 14 days).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  required
                  value={settings.defaultCommissionRate}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCommissionRate: parseFloat(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Fallback commission rate when no product-specific rule matches.
                </p>
              </div>
            </div>

            {/* Anti-Fraud Toggles */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Anti-Fraud &amp; Governance
              </h3>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Prevent Self-Referrals
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Block affiliates from earning commissions on purchases made with their own email or user account.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!settings.allowSelfReferrals}
                    onChange={(e) =>
                      setSettings({ ...settings, allowSelfReferrals: !e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Require Admin Review for New Affiliates
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Applications start as Pending until Super Admin manually verifies and approves them.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={(e) =>
                      setSettings({ ...settings, requireApproval: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={savingSettings}
                className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {savingSettings ? "Saving Settings..." : "Save Affiliate Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
