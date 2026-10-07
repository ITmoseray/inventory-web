"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FileText,
  Copy,
  Check,
  Share2,
  Download,
  Brain,
  Package,
  Layers,
  Smartphone,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  Laptop,
  GraduationCap,
  Building2,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateProfile, getAffiliateMarketingMaterials } from "@/lib/actions/affiliate";

export default function AffiliateMarketingPage() {
  const [affiliateCode, setAffiliateCode] = useState<string>("PA-AFF-00001");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedBannerId, setCopiedBannerId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("https://protechassist.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }

    async function load() {
      try {
        const [profRes, matRes] = await Promise.all([
          getAffiliateProfile(),
          getAffiliateMarketingMaterials(),
        ]);
        if (profRes.success && profRes.affiliate) {
          setAffiliateCode(profRes.affiliate.affiliateCode);
        }
        if (matRes.success && matRes.materials) {
          setMaterials(matRes.materials);
        }
      } catch (e) {
        console.error("Failed to load marketing materials", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const promoScripts = [
    {
      id: "script-enterprise-os",
      title: "Enterprise OS / Retail Inventory Pitch (WhatsApp Status & Groups)",
      category: "Software",
      product: "Enterprise OS",
      targetSlug: "enterprise-os",
      description: "Ideal for retail shop owners, supermarkets, pharmacies, electronics stores, and restaurant managers.",
      text: `🚀 Tired of missing stock, manual paper receipts, or untracked profit in your shop?

ProTech Assist Enterprise OS is Sierra Leone's #1 modern business management software!
✅ Barcode POS & Fast Thermal Receipt Printing
✅ Automatic Stock Alerts & Expiry Tracking for Pharmacies
✅ Multi-Store Branch & Warehouse Synchronization
✅ Daily Profit & Loss Reports straight to your phone
✅ Works on mobile phones, tablets, POS terminals & laptops

Try the free trial today or request a live demo:
👉 ${baseUrl}/ref/${affiliateCode}?product=enterprise-os

Contact ProTech Assist for installation support across Sierra Leone! 🇸🇱`,
    },
    {
      id: "script-ai",
      title: "ProTech AI Masterclass & Prompt Engineering Pitch",
      category: "Training",
      product: "AI Masterclass",
      targetSlug: "ai-masterclass",
      description: "Ideal for young professionals, university students, corporate employees, and creative freelancers.",
      text: `🤖 Master Artificial Intelligence in 2026 with ProTech Assist SL!

Learn how to use AI tools, ChatGPT, Claude, Automation, and Prompt Engineering to multiply your productivity and earn globally.

🎓 Hands-on practical masterclass
📜 Official ProTech Certification of Completion
💼 Career & freelance portfolio guidance

Reserve your seat now before registration closes:
👉 ${baseUrl}/ref/${affiliateCode}?product=ai-masterclass`,
    },
    {
      id: "script-coding",
      title: "Software Engineering & Full-Stack Development Cohort Pitch",
      category: "Training",
      product: "Full-Stack Cohort",
      targetSlug: "software-engineering",
      description: "Ideal for tech enthusiasts, school leavers, and university grads looking for high-paying software engineering jobs.",
      text: `💻 Want to become a certified Full-Stack Software Engineer right here in Sierra Leone?

Join the intensive Software Engineering program at ProTech Assist SL Limited!
🔹 HTML, CSS, JavaScript, TypeScript
🔹 React, Next.js, Node.js & Database Architecture
🔹 Real-world client projects & GitHub portfolio
🔹 Mentorship from top local and international engineers

Apply today through my referral link:
👉 ${baseUrl}/ref/${affiliateCode}?product=software-engineering`,
    },
    {
      id: "script-school",
      title: "School, College & University Management System Pitch",
      category: "Institutions",
      product: "School Management",
      targetSlug: "school-system",
      description: "Ideal for school principals, headmasters, university registrars, and education administrators.",
      text: `🏫 Modernize your school or college with ProTech Assist Educational OS!

Comprehensive institution management:
✅ Student Admissions & Digital Registration
✅ Automated Fee Tracking & Orange/Afrimoney Payment Receipts
✅ Report Cards, Exams & Transcript Generation
✅ Staff & Teacher Payroll Management

Book an institutional consultation and live system demo:
👉 ${baseUrl}/ref/${affiliateCode}?to=/school`,
    },
  ];

  // Default visual assets if database list is empty or complements
  const defaultVisualAssets = [
    {
      id: "def-school",
      title: "School, College & University System",
      category: "BANNERS",
      dimensions: "1080x1080",
      description: "Square promotional graphic designed for school heads, universities, and education boards.",
      fileUrl: "/flyer.html",
      productSlug: "school-system",
      targetUrl: "/school",
      caption: `🏫 Upgrade your school or university administration with ProTech Assist Educational OS! Digital admissions, instant student fee receipts, and automated report card generation. Learn more: ${baseUrl}/ref/${affiliateCode}?to=/school`,
    },
    {
      id: "def-enterprise",
      title: "Enterprise OS for Retail Shops & Pharmacies",
      category: "FLYERS",
      dimensions: "1080x1080",
      description: "High-impact retail promotional flyer for supermarkets, pharmacies, and wholesale shops.",
      fileUrl: "/images/Sales_and_POS.png",
      productSlug: "enterprise-os",
      targetUrl: "/register",
      caption: `🛒 Run your retail shop or pharmacy like a pro! Barcode POS scanning, thermal receipt printing, stock alerts & profit tracking. Start 14-day free trial: ${baseUrl}/ref/${affiliateCode}?product=enterprise-os`,
    },
    {
      id: "def-ai",
      title: "ProTech AI & Prompt Engineering Masterclass",
      category: "BANNERS",
      dimensions: "1080x1080",
      description: "Official masterclass poster for students, creatives, and corporate professionals.",
      fileUrl: "/images/AI_Copilot.png",
      productSlug: "ai-masterclass",
      targetUrl: "/services",
      caption: `🤖 Master Artificial Intelligence in 2026! Practical hands-on training with ChatGPT, Claude, and workflow automation. Enroll now: ${baseUrl}/ref/${affiliateCode}?product=ai-masterclass`,
    },
  ];

  const allAssets = materials && materials.length > 0 ? materials : defaultVisualAssets;

  const copyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Promotional text copied with your referral link!");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const shareScriptWhatsApp = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareBannerWhatsApp = (asset: any) => {
    const trackingUrl = `${baseUrl}/ref/${affiliateCode}${
      asset.targetUrl ? `?to=${encodeURIComponent(asset.targetUrl)}` : `?product=${encodeURIComponent(asset.productSlug || "all")}`
    }`;
    const caption = asset.caption || `🚀 Check out ${asset.title} from ProTech Assist SL!\n\n👉 Learn more & get started: ${trackingUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, "_blank");
  };

  const handleDownloadAndCopyCaption = (asset: any) => {
    const trackingUrl = `${baseUrl}/ref/${affiliateCode}${
      asset.targetUrl ? `?to=${encodeURIComponent(asset.targetUrl)}` : `?product=${encodeURIComponent(asset.productSlug || "all")}`
    }`;
    const caption = asset.caption || `🚀 ${asset.title} - ProTech Assist SL\n\n👉 Inquire or Register: ${trackingUrl}`;
    
    // Copy caption to clipboard
    navigator.clipboard.writeText(caption);
    setCopiedBannerId(asset.id);
    toast.success("Caption & referral link copied to clipboard! File download started.");
    setTimeout(() => setCopiedBannerId(null), 3000);

    // Trigger download if fileUrl exists
    if (asset.fileUrl) {
      const link = document.createElement("a");
      link.href = asset.fileUrl;
      link.target = "_blank";
      link.download = `${asset.title.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Media Kit & Social Toolkit
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Marketing Resources & Promotional Kit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Share these pre-written messages, marketing flyers, and social banners with your audience. Your unique tracking code (<span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{affiliateCode}</span>) is automatically embedded in every share!
        </p>
      </div>

      {/* Visual Banners & Flyers Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Promotional Banners & Media Kit</h2>
              <p className="text-xs text-slate-500">
                1080x1080 graphics ready for WhatsApp status, Facebook posts, and Instagram stories.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allAssets.map((asset) => {
            const isCopied = copiedBannerId === asset.id;
            return (
              <div
                key={asset.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {asset.category || "BANNER"} &bull; {asset.dimensions || "1080x1080"}
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono border border-emerald-200">
                      Active Asset
                    </span>
                  </div>

                  {/* Thumbnail / Graphic Placeholder */}
                  <div className="h-40 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group-hover:border-emerald-300 transition">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-100">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{asset.title}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">High-Res Brand Graphic</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{asset.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {asset.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => shareBannerWhatsApp(asset)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp with My Link
                  </button>

                  <button
                    onClick={() => handleDownloadAndCopyCaption(asset)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                    {isCopied ? "Caption & Link Copied!" : "Download + Copy Link Caption"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy Scripts Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Pre-Written WhatsApp & Social Scripts</h2>
            <p className="text-xs text-slate-500">
              Copy and paste these proven scripts into your WhatsApp statuses, broadcasts, and DM conversations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promoScripts.map((script, idx) => {
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={script.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-slate-200 font-mono">
                      {script.category} &bull; {script.product}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {script.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {script.description}
                  </p>

                  <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-all max-h-56 overflow-y-auto shadow-inner">
                    {script.text}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyScript(script.text, idx)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied with Link!" : "Copy Text with Link"}
                  </button>

                  <button
                    onClick={() => shareScriptWhatsApp(script.text)}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-emerald-700 font-bold text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-sm"
                    title="Send straight to WhatsApp"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    WhatsApp
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
