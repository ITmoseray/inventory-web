"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Search,
  Filter,
  ShoppingBag,
  Store,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPublicPaanCampaigns,
  joinOrApplyPaanCampaign,
  getPaanAffiliateCampaigns,
} from "@/lib/actions/paan";

export default function AffiliateCampaignsExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [joinedLinks, setJoinedLinks] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = [
    "ALL",
    "Electronics",
    "Fashion",
    "Groceries",
    "Beauty",
    "Education",
    "Technology",
    "Restaurants",
    "Services",
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, myRes] = await Promise.all([
        getPublicPaanCampaigns(),
        getPaanAffiliateCampaigns(),
      ]);
      if (cRes.success) setCampaigns(cRes.campaigns);
      if (myRes.success) setJoinedLinks(myRes.links || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load campaigns catalog");
    } finally {
      setLoading(false);
    }
  }

  const isJoined = (campaignId: string) => {
    return joinedLinks.some((l) => l.campaignId === campaignId);
  };

  const getTrackingCode = (campaignId: string) => {
    const link = joinedLinks.find((l) => l.campaignId === campaignId);
    return link ? link.trackingCode : null;
  };

  async function handleJoin(campaignId: string, type: string) {
    setActionLoadingId(campaignId);
    try {
      const res = await joinOrApplyPaanCampaign(campaignId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.error || "Failed to join campaign");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/ref/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success("Affiliate link copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWhatsApp = (campaign: any, code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/ref/${code}`;
    const text = `Check out this offer on ${campaign.title} from ${campaign.merchantName}!\n\nBuy online or quote promo code ${code} in-store:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = campaigns.filter((c) => {
    const matchesCat = activeCategory === "ALL" || c.category === activeCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.merchantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Megaphone className="h-3.5 w-3.5" /> PAAN National Campaign Marketplace
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            Discover Verified Merchant Campaigns
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Promote products & services for shops, supermarkets, and service providers across Sierra Leone.
            Earn guaranteed commissions on both online orders and physical walk-in store sales.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns, products or merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Showing {filtered.length} of {campaigns.length} Active Campaigns
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading campaigns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No campaigns found in this category.</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting a different filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((campaign) => {
            const joined = isJoined(campaign.id);
            const code = getTrackingCode(campaign.id);

            return (
              <div
                key={campaign.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Commission Badge */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {campaign.category}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                      Earn {campaign.affiliateEffectiveRate.toFixed(1)}% Commission
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1">
                    {campaign.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <Store className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{campaign.merchantName}</span>
                    {campaign.merchantAddress && <span>&bull; {campaign.merchantAddress}</span>}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* Products snippet */}
                  {campaign.products && campaign.products.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl mb-4 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Featured In This Campaign:</p>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <span className="truncate">{campaign.products[0].name}</span>
                        <span className="font-bold text-blue-600 shrink-0 ml-2">
                          NLe {campaign.products[0].price}
                        </span>
                      </div>
                      {campaign.products.length > 1 && (
                        <p className="text-[10px] text-slate-400">+{campaign.products.length - 1} more items</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Area */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {joined && code ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-xl text-xs">
                        <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                          Ref: {code}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(code)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300"
                            title="Copy Tracking URL"
                          >
                            {copiedCode === code ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(campaign, code)}
                            className="p-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba5a]"
                            title="Share to WhatsApp"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 font-medium">
                        Active Promoter &bull; Share online or give customers the code for in-store checkout.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(campaign.id, campaign.type)}
                      disabled={actionLoadingId === campaign.id}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoadingId === campaign.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {campaign.type === "APPLICATION" ? "Apply to Promote" : "Promote & Get Link"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
