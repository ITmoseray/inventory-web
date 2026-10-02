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
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateLinks, createAffiliateLink } from "@/lib/actions/affiliate";

const PRODUCT_PRESETS = [
  { slug: "enterprise-os", name: "Enterprise OS / Inventory Software", targetUrl: "/register" },
  { slug: "software-engineering", name: "Software Engineering & Full-Stack Cohort", targetUrl: "/services" },
  { slug: "ai-masterclass", name: "ProTech AI & Prompt Engineering Masterclass", targetUrl: "/services" },
  { slug: "website-dev", name: "Custom Website & Portal Development", targetUrl: "/services" },
  { slug: "mobile-app-dev", name: "Mobile Application Development (iOS & Android)", targetUrl: "/services" },
  { slug: "ms-office-training", name: "Microsoft Office Suite Training", targetUrl: "/services" },
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
        title: campaignTitle.trim() || `${selectedProduct.name} Promo`,
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
    const text = encodeURIComponent(
      `Check out ${title} from ProTech Assist SL: ${fullUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Referral Link Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Create product-specific links to track your campaigns on WhatsApp, Facebook, TikTok, or client pitches.
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Generate Custom Campaign Link</h2>
            <p className="text-xs text-slate-400">Target a specific product, training cohort, or service</p>
          </div>
        </div>

        <form onSubmit={handleCreateLink} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Product or Service
            </label>
            <select
              value={selectedProduct.slug}
              onChange={(e) => {
                const found = PRODUCT_PRESETS.find((p) => p.slug === e.target.value);
                if (found) setSelectedProduct(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {PRODUCT_PRESETS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Campaign Label (Optional)
            </label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              placeholder="e.g. WhatsApp Status Promo, Bo Tech Group"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950 disabled:opacity-50"
            >
              <Link2 className="w-4 h-4" />
              {creating ? "Generating..." : "Generate Referral Link"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Links List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Your Active Tracking Links</h2>
            <p className="text-xs text-slate-400">Total {links.length} active links</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
            Loading your tracking links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No custom links created yet</p>
            <p className="text-xs text-slate-500">
              Use the generator above to create customized referral links for specific campaigns.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campaign & Target</th>
                  <th className="py-3 px-4">Tracking URL</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Conversions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {links.map((l) => {
                  const fullUrl = `${baseUrl}/ref/${l.code}`;
                  const isCopied = copiedId === l.id;

                  return (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-white text-xs">{l.title || "Referral Link"}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-[10px]">
                            {l.productSlug || "all"}
                          </span>
                          <span>&bull;</span>
                          <span>{l.targetUrl}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 select-all max-w-xs truncate">
                        {fullUrl}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 text-slate-200 font-semibold border border-slate-800">
                          <MousePointerClick className="w-3 h-3 text-emerald-400" /> {l.clicksCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 text-emerald-400 font-semibold border border-emerald-950">
                          <Users className="w-3 h-3 text-emerald-400" /> {l.conversionsCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => copyLink(l.code, l.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? "Copied" : "Copy"}
                        </button>

                        <button
                          onClick={() => shareWhatsApp(l.code, l.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition inline-flex items-center gap-1"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
