"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Share2,
  TrendingUp,
  MousePointerClick,
  Users,
  Brain,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateLinks, createAffiliateLink } from "@/lib/actions/affiliate";

const PRODUCT_PRESETS = [
  { slug: "enterprise-os", name: "Enterprise OS / Inventory Software", targetUrl: "/register" },
  { slug: "software-engineering", name: "Software Engineering & Full-Stack Cohort", targetUrl: "/services" },
  { slug: "ai-masterclass", name: "ProTech AI & Prompt Engineering Masterclass", targetUrl: "/services" },
  { slug: "website-dev", name: "Custom Website & Portal Development", targetUrl: "/services" },
  { slug: "mobile-app-dev", name: "Mobile Application Development (iOS & Android)", targetUrl: "/services" },
  { slug: "school-system", name: "School, College & University Management System", targetUrl: "/school" },
  { slug: "all", name: "ProTech Assist General Platform (All Services)", targetUrl: "/" },
];

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("https://protechassist.com");

  // Generator form
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_PRESETS[0]);
  const [campaignTitle, setCampaignTitle] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const res = await getAffiliateLinks();
      if (res.success) {
        setLinks(res.links || []);
        if (res.affiliateCode) setAffiliateCode(res.affiliateCode);
      } else {
        toast.error(res.error || "Failed to load affiliate links");
      }
    } catch (err: any) {
      toast.error("Network error fetching links");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await createAffiliateLink({
        targetUrl: selectedProduct.targetUrl,
        productSlug: selectedProduct.slug,
        title: campaignTitle.trim() || `${selectedProduct.name} Campaign`,
      });

      if (res.success) {
        toast.success("New custom referral link generated!");
        setCampaignTitle("");
        loadLinks();
      } else {
        toast.error(res.error || "Failed to create link");
      }
    } catch (err: any) {
      toast.error("Failed to generate link");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (code: string, id: string) => {
    const fullUrl = `${baseUrl}/ref/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareWhatsApp = (code: string, title: string) => {
    const fullUrl = `${baseUrl}/ref/${code}`;
    const message = `🚀 ${title} by ProTech Assist SL!\n\n👉 Learn more & get started: ${fullUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <Link2 className="w-3.5 h-3.5 text-emerald-600" /> Dynamic Campaign Generator
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Custom Referral Links & Campaigns
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Create product-targeted referral links for specific social media posts, WhatsApp groups, or email newsletters. Every custom link locks the lead to your account for <strong>30 full days</strong>.
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Generate New Campaign Link
          </h2>
        </div>

        <form onSubmit={handleCreateLink} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Solution / Landing Destination
              </label>
              <select
                value={selectedProduct.slug}
                onChange={(e) => {
                  const found = PRODUCT_PRESETS.find((p) => p.slug === e.target.value);
                  if (found) setSelectedProduct(found);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
              >
                {PRODUCT_PRESETS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.targetUrl})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campaign Label / Title (Optional)
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Pharmacy WhatsApp Group Promo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              Destination URL: <span className="font-mono text-emerald-700 font-bold">{selectedProduct.targetUrl}</span>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {creating ? "Creating Link..." : "Create Campaign Link"}
            </button>
          </div>
        </form>
      </div>

      {/* Links List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" /> Active Referral Links ({links.length})
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500">
            Partner Code: {affiliateCode}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Campaign Name</th>
                <th className="py-3.5 px-4">Tracking URL</th>
                <th className="py-3.5 px-4">Target Route</th>
                <th className="py-3.5 px-4 text-center">Clicks</th>
                <th className="py-3.5 px-4 text-center">Conversions</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Share & Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((link) => {
                const fullUrl = `${baseUrl}/ref/${link.code}`;
                const isCopied = copiedId === link.id;

                return (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div>{link.title || "Default Campaign"}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1 group"
                        title="Open tracking link in new tab"
                      >
                        <span>{fullUrl}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </a>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                      {link.targetUrl}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      {link.clicksCount}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-blue-600">
                      {link.conversionsCount}
                    </td>

                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => copyLink(link.code, link.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center gap-1 shadow-sm"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => shareWhatsApp(link.code, link.title || "ProTech Solution")}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition inline-flex items-center gap-1"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {links.map((link) => {
            const fullUrl = `${baseUrl}/ref/${link.code}`;
            const isCopied = copiedId === link.id;

            return (
              <div
                key={link.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {link.title || "Default Campaign"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tracking URL
                  </span>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold text-emerald-700 break-all flex items-center gap-1 hover:underline"
                  >
                    <span>{fullUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Clicks</span>
                    <span className="font-bold text-slate-900">{link.clicksCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Conversions</span>
                    <span className="font-bold text-blue-600">{link.conversionsCount}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => copyLink(link.code, link.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    onClick={() => shareWhatsApp(link.code, link.title || "ProTech Solution")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
