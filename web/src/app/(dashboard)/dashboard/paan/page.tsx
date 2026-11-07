"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  Share2,
  Copy,
  Receipt,
  Store,
  Tag,
  Clock,
  Sparkles,
  Percent,
  Check,
  X,
  ExternalLink,
  Phone,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaanMerchantStats,
  registerPaanMerchant,
  createPaanCampaign,
  getPaanMerchantCampaigns,
  updatePaanCampaignStatus,
  getPaanMerchantProducts,
  verifyPaanReferralCode,
  recordPaanOfflineSale,
  getPaanMerchantOfflineAttributions,
  uploadPaanMarketingAsset,
  getPaanCampaignAssets,
} from "@/lib/actions/paan";

export default function MerchantPaanPortal() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "campaigns" | "offline" | "attributions" | "marketing" | "finances"
  >("overview");

  // Registration Form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [merchantProducts, setMerchantProducts] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newType, setNewType] = useState<"OPEN" | "APPLICATION">("OPEN");
  const [newCommType, setNewCommType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newCommRate, setNewCommRate] = useState<string>("10");
  const [newAffiliateShare, setNewAffiliateShare] = useState<string>("70");
  const [newPlatformShare, setNewPlatformShare] = useState<string>("30");
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  // Offline Attribution State (Cashier Terminal)
  const [offlineCode, setOfflineCode] = useState("");
  const [verifiedPromoter, setVerifiedPromoter] = useState<any>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saleAmount, setSaleAmount] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [recordingSale, setRecordingSale] = useState(false);
  const [offlineAttributions, setOfflineAttributions] = useState<any[]>([]);

  // Marketing Assets State
  const [assets, setAssets] = useState<any[]>([]);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState<"BANNER" | "PHOTO" | "CAPTION" | "SCRIPT">("SCRIPT");
  const [assetFileUrl, setAssetFileUrl] = useState("");
  const [assetTextContent, setAssetTextContent] = useState("");
  const [uploadingAsset, setUploadingAsset] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPaanMerchantStats();
      if (res.notRegistered) {
        setNotRegistered(true);
      } else if (res.success) {
        setStats(res.stats);
        setMerchant(res.merchant);
        setNotRegistered(false);

        // Load campaigns and offline attributions
        const [cRes, aRes, pRes] = await Promise.all([
          getPaanMerchantCampaigns(),
          getPaanMerchantOfflineAttributions(),
          getPaanMerchantProducts(),
        ]);
        if (cRes.success) setCampaigns(cRes.campaigns);
        if (aRes.success) setOfflineAttributions(aRes.attributions);
        if (pRes.success) setMerchantProducts(pRes.products);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load PAAN merchant dashboard");
    } finally {
      setLoading(false);
    }
  }

  // Handle Merchant Registration
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName || !regPhone || !regEmail) {
      toast.error("Please fill in contact person details");
      return;
    }

    setSubmittingReg(true);
    try {
      const res = await registerPaanMerchant({
        contactPersonName: regName,
        contactPersonPhone: regPhone,
        contactPersonEmail: regEmail,
      });

      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.error || "Failed to register");
      }
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setSubmittingReg(false);
    }
  }

  // Handle Campaign Creation
  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    const rate = parseFloat(newCommRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please provide a valid commission rate");
      return;
    }

    const affShare = parseFloat(newAffiliateShare) || 70;
    const platShare = parseFloat(newPlatformShare) || 30;

    if (Math.round(affShare + platShare) !== 100) {
      toast.error("Affiliate share and Platform share must equal 100%");
      return;
    }

    setCreatingCampaign(true);
    try {
      const res = await createPaanCampaign({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        type: newType,
        commissionType: newCommType,
        totalCommissionRate: rate,
        affiliateSharePct: affShare,
        platformSharePct: platShare,
        bannerUrl: newBannerUrl,
        productIds: selectedProductIds,
      });

      if (res.success) {
        toast.success(res.message);
        setShowCreateModal(false);
        // Reset form
        setNewTitle("");
        setNewDesc("");
        setSelectedProductIds([]);
        loadData();
      } else {
        toast.error(res.error || "Failed to create campaign");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingCampaign(false);
    }
  }

  // Handle Status Toggle
  async function handleStatusToggle(campaignId: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await updatePaanCampaignStatus(campaignId, nextStatus);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Cashier Lookup: Verify Referral Code
  async function handleLookupCode() {
    if (!offlineCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setVerifyingCode(true);
    setVerifiedPromoter(null);
    try {
      const res = await verifyPaanReferralCode(offlineCode);
      if (res.success) {
        setVerifiedPromoter(res);
        if (res.campaign?.id) {
          setSelectedCampaignId(res.campaign.id);
        }
        toast.success(`Verified: ${res.affiliate?.fullName} (${res.trackingCode})`);
      } else {
        toast.error(res.error || "Invalid referral code");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setVerifyingCode(false);
    }
  }

  // Record Offline Walk-in Physical Sale
  async function handleRecordOfflineSale(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid sale amount in NLe");
      return;
    }

    if (!verifiedPromoter) {
      toast.error("Please verify the referral code first");
      return;
    }

    setRecordingSale(true);
    try {
      const res = await recordPaanOfflineSale({
        referralCode: offlineCode,
        campaignId: selectedCampaignId || undefined,
        receiptNumber: receiptNumber || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        saleAmount: amount,
      });

      if (res.success) {
        toast.success(res.message);
        // Reset form
        setOfflineCode("");
        setVerifiedPromoter(null);
        setReceiptNumber("");
        setCustomerName("");
        setCustomerPhone("");
        setSaleAmount("");
        loadData();
      } else {
        toast.error(res.error || "Failed to record sale");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRecordingSale(false);
    }
  }

  // Upload Marketing Asset
  async function handleUploadAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!assetTitle || (!assetFileUrl && !assetTextContent)) {
      toast.error("Please enter title and either a file URL or caption text");
      return;
    }

    setUploadingAsset(true);
    try {
      const res = await uploadPaanMarketingAsset({
        title: assetTitle,
        assetType,
        fileUrl: assetFileUrl || undefined,
        textContent: assetTextContent || undefined,
      });

      if (res.success) {
        toast.success("Marketing asset uploaded for affiliates!");
        setAssetTitle("");
        setAssetFileUrl("");
        setAssetTextContent("");
      } else {
        toast.error(res.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingAsset(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading PAAN Merchant Network...</p>
      </div>
    );
  }

  // Not Registered Onboarding View
  if (notRegistered) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-blue-800/40">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" /> ProTech Assist Affiliate Network (PAAN)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Connect with Thousands of Marketers Across Sierra Leone
            </h1>
            <p className="text-slate-300 max-w-2xl text-base md:text-lg leading-relaxed">
              Transform your business into a high-volume merchant on the national affiliate marketplace.
              Empower registered digital marketers, influencers, and Academy graduates to promote your
              products on WhatsApp, TikTok, Facebook, and in person.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-blue-900/60">
              <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-blue-300 font-bold uppercase">Zero Upfront Ad Cost</p>
                <p className="text-sm text-slate-200 mt-1">Pay commission only on verified, confirmed sales.</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-blue-300 font-bold uppercase">Physical Shop Attribution</p>
                <p className="text-sm text-slate-200 mt-1">Cashiers credit walk-in sales with offline referral codes.</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-blue-300 font-bold uppercase">National Exposure</p>
                <p className="text-sm text-slate-200 mt-1">Featured across Freetown, Bo, Kenema, Makeni, and beyond.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Activate Your PAAN Merchant Account</h2>
          <p className="text-slate-500 text-sm mb-6">
            Enter the direct contact details for your business affiliate operations manager.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Contact Person Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Samuel Koroma"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Direct Contact Phone / WhatsApp (+232)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +232 76 123456"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Operational Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. contact@business.sl"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingReg}
                className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submittingReg ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                Join the PAAN Network Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Active Merchant Dashboard View
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider mb-2">
            <Building className="h-3.5 w-3.5" /> PAAN Verified Merchant
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {merchant?.business?.name || "Merchant Dashboard"}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Connecting Businesses. Empowering Marketers. Driving Sales Across Sierra Leone.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("offline")}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" /> Cashier POS Terminal
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Attributed Sales</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            NLe {stats?.totalAttributedRevenue?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Gross Merchandise Value</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Commissions Due</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            NLe {stats?.totalCommissionsOwed?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Network obligations</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Net Retained</span>
            <Store className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            NLe {stats?.totalMerchantRetention?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Merchant net earnings</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Active Promoters</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalPromoters || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Marketers with links</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Live Campaigns</span>
            <Tag className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.activeCampaigns || 0} / {stats?.totalCampaigns || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Active vs Published</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { key: "overview", label: "Overview & Attributions" },
          { key: "campaigns", label: `Campaigns (${campaigns.length})` },
          { key: "offline", label: "Cashier POS Terminal" },
          { key: "marketing", label: "Marketing Materials" },
          { key: "finances", label: "Financial Statement" },
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Recent Attributed Walk-in Sales (Offline Attribution)
            </h3>

            {offlineAttributions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold">No offline walk-in sales recorded yet.</p>
                <p className="text-xs mt-1">
                  When a customer brings an affiliate referral code to your shop, use the Cashier POS Terminal.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Attribution Ref</th>
                      <th className="p-3">Promoter</th>
                      <th className="p-3">Receipt #</th>
                      <th className="p-3">Sale GMV</th>
                      <th className="p-3">Affiliate Share (70%)</th>
                      <th className="p-3">ProTech Share (30%)</th>
                      <th className="p-3">Merchant Retains</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {offlineAttributions.map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-xs font-bold text-blue-600">{attr.attributionRef}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{attr.affiliate.fullName}</p>
                          <p className="text-xs font-mono text-slate-400">{attr.affiliate.affiliateCode}</p>
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {attr.receiptNumber || "N/A"}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          NLe {Number(attr.saleAmount).toFixed(2)}
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          NLe {Number(attr.affiliateEarning).toFixed(2)}
                        </td>
                        <td className="p-3 font-bold text-blue-600">
                          NLe {Number(attr.platformRevenue).toFixed(2)}
                        </td>
                        <td className="p-3 font-bold text-indigo-600">
                          NLe {Number(attr.merchantRetention).toFixed(2)}
                        </td>
                        <td className="p-3 text-xs text-slate-400">
                          {new Date(attr.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Product & Service Campaigns</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {camp.category}
                    </span>
                    <button
                      onClick={() => handleStatusToggle(camp.id, camp.status)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        camp.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      {camp.status}
                    </button>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{camp.title}</h4>
                  <p className="text-slate-500 text-xs line-clamp-3 mb-4">{camp.description}</p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Agreed Total Commission:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {camp.totalCommissionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Marketer Cut (70%):</span>
                      <span className="font-bold text-emerald-600">
                        {((Number(camp.totalCommissionRate) * Number(camp.affiliateSharePct)) / 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">PAAN Platform (30%):</span>
                      <span className="font-bold text-blue-600">
                        {((Number(camp.totalCommissionRate) * Number(camp.platformSharePct)) / 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span>{camp._count?.referralLinks || 0} Marketers active</span>
                  <span>{camp.totalConversions || 0} conversions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CASHIER POS OFFLINE TERMINAL */}
      {activeTab === "offline" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-6 w-6 text-emerald-600" /> Physical Shop Cashier Terminal
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Attribute in-person purchases to the marketer who referred the customer.
            </p>
          </div>

          {/* Step 1: Lookup Code */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Step 1: Enter Customer's Referral Code or Marketer ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PA-AFF-00001 or PAAN-ELEC-0001"
                value={offlineCode}
                onChange={(e) => setOfflineCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-base font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={handleLookupCode}
                disabled={verifyingCode}
                className="px-6 py-3 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800"
              >
                {verifyingCode ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Verify Code"}
              </button>
            </div>
          </div>

          {/* Verified Marketer Card */}
          {verifiedPromoter && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" /> Code Verified & Linked!
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                Promoter: {verifiedPromoter.affiliate?.fullName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                Code: {verifiedPromoter.trackingCode} | Phone: {verifiedPromoter.affiliate?.phone}
              </p>
              {verifiedPromoter.campaign && (
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mt-1">
                  Assigned Campaign: {verifiedPromoter.campaign.title} ({verifiedPromoter.campaign.totalCommissionRate}%)
                </p>
              )}
            </div>
          )}

          {/* Step 2: Sale Entry Form */}
          {verifiedPromoter && (
            <form onSubmit={handleRecordOfflineSale} className="space-y-4 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 2: Enter Transaction Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Receipt / Invoice Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REC-2026-8812"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Sale Total Amount (NLe)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1000.00"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Fatu Sesay"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Customer Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +232 78 555666"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={recordingSale}
                className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {recordingSale ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
                Confirm & Record Walk-In Sale Attribution
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB: MARKETING ASSETS */}
      {activeTab === "marketing" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Marketing Material</h3>
            <p className="text-slate-500 text-xs mb-6">
              Provide flyers, high-res photos, or pre-written WhatsApp caption scripts for marketers to share.
            </p>

            <form onSubmit={handleUploadAsset} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Asset Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WhatsApp Promo Script for Smart TVs"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Type</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="SCRIPT">WhatsApp / Social Script</option>
                    <option value="BANNER">Flyer / Banner</option>
                    <option value="PHOTO">Product Photo</option>
                    <option value="CAPTION">Instagram / TikTok Caption</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Image / Flyer URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={assetFileUrl}
                    onChange={(e) => setAssetFileUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Text Copy / WhatsApp Broadcast Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste pre-written copy for your marketers..."
                  value={assetTextContent}
                  onChange={(e) => setAssetTextContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={uploadingAsset}
                className="py-3 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploadingAsset ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Publish Resource"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: FINANCES */}
      {activeTab === "finances" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Merchant Financial Statement</h3>
          <p className="text-slate-500 text-xs">
            Summary of all affiliate-driven gross sales, commission liabilities, and settlements with ProTech Assist SL Limited.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 font-bold uppercase">Total Commission Accrued</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                NLe {stats?.totalCommissionsOwed?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">Settled to Network</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                NLe {stats?.totalSettled?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-bold uppercase">Outstanding Settlement</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                NLe {stats?.outstandingBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">New PAAN Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Christmas Electronics Special Promo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Electronics">Electronics & Appliances</option>
                  <option value="Fashion">Fashion & Clothing</option>
                  <option value="Groceries">Supermarkets & Groceries</option>
                  <option value="Beauty">Beauty & Cosmetics</option>
                  <option value="Education">Education & Online Courses</option>
                  <option value="Technology">Technology & Software Services</option>
                  <option value="Restaurants">Food & Restaurants</option>
                  <option value="Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description & Campaign Rules
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what products qualify, discount codes, and promotion guidelines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Affiliate Access</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="OPEN">Open (All Approved Marketers)</option>
                    <option value="APPLICATION">Application Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Total Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newCommRate}
                    onChange={(e) => setNewCommRate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Commission Split Config */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                <p className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                  Standard Commission Split Formula
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Marketer Share (%)</label>
                    <input
                      type="number"
                      value={newAffiliateShare}
                      onChange={(e) => setNewAffiliateShare(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">ProTech Platform (%)</label>
                    <input
                      type="number"
                      value={newPlatformShare}
                      onChange={(e) => setNewPlatformShare(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-blue-600"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Default: 70% of commission goes to Marketer, 30% goes to ProTech Assist SL Limited.
                </p>
              </div>

              {/* Select Eligible Inventory Products */}
              {merchantProducts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                    Attach Inventory Products (Optional)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-800 p-2 rounded-xl">
                    {merchantProducts.map((p) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${
                            isSelected ? "bg-blue-50 dark:bg-blue-950/60 font-bold" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                else setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                              }}
                            />
                            <span>{p.name}</span>
                          </div>
                          <span className="text-slate-500">NLe {p.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingCampaign}
                  className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center gap-2"
                >
                  {creatingCampaign ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Publish Campaign to PAAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
