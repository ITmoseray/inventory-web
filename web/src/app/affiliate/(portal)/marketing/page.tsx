"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateProfile, getAffiliateMarketingMaterials } from "@/lib/actions/affiliate";

export default function AffiliateMarketingPage() {
  const [affiliateCode, setAffiliateCode] = useState<string>("PA-AFF-00001");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
      title: "Enterprise OS / Retail Inventory Pitch (WhatsApp Status & Groups)",
      category: "Software",
      product: "Enterprise OS",
      description: "Ideal for retail shop owners, supermarkets, pharmacies, electronics stores, and restaurant managers.",
      text: `🚀 Tired of missing stock, manual paper receipts, or untracked profit in your shop?

ProTech Assist Enterprise OS is Sierra Leone's #1 modern business management software!
✅ Barcode POS & Fast Thermal Receipt Printing
✅ Automatic Stock Alerts & Expiry Tracking
✅ Multi-Store Branch Management
✅ Daily Profit & Loss Reports
✅ Works smoothly on phones, tablets & laptops

Try the free trial today or request a live demo:
👉 ${baseUrl}/ref/${affiliateCode}?product=enterprise-os

Contact ProTech Assist for installation support across Sierra Leone! 🇸🇱`,
    },
    {
      title: "ProTech AI Masterclass & Prompt Engineering Pitch",
      category: "Training",
      product: "AI Masterclass",
      description: "Ideal for young professionals, university students, corporate employees, and creative freelancers.",
      text: `🤖 Master Artificial Intelligence in 2026 with ProTech Assist SL!

Learn how to use AI tools, ChatGPT, Claude, Automation, and Prompt Engineering to multiply your productivity and earn globally.

🎓 Hands-on practical masterclass
📜 Official ProTech Certification
💼 Career & freelance portfolio guidance

Reserve your seat now before registration closes:
👉 ${baseUrl}/ref/${affiliateCode}?product=ai-masterclass`,
    },
    {
      title: "Software Engineering & Full-Stack Development Cohort Pitch",
      category: "Training",
      product: "Full-Stack Cohort",
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
      title: "Corporate Website & Custom Software Services Pitch",
      category: "Services",
      product: "Web & Mobile Development",
      description: "Ideal for business executives, NGOs, schools, hospitals, and founders needing digital transformation.",
      text: `🌐 Upgrade your company or institution with custom enterprise technology from ProTech Assist SL Limited!

Specialized in:
✨ Modern Responsive Websites & Web Portals
✨ Android & iOS Mobile Applications
✨ School & Hospital Management Systems
✨ Secure Cloud Database Solutions & Cybersecurity

Get a custom project quote today:
👉 ${baseUrl}/ref/${affiliateCode}?product=website-dev`,
    },
  ];

  const copyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Promotional script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const shareScriptWhatsApp = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Marketing Resources & Copy Scripts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Use these high-converting, pre-approved promotional texts, WhatsApp messages, and marketing assets to share with your audience.
        </p>
      </div>

      {/* Copy Scripts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pre-Written WhatsApp & Social Scripts</h2>
            <p className="text-xs text-slate-400">
              Your unique referral link (<code>{affiliateCode}</code>) is automatically inserted into every script!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promoScripts.map((script, idx) => {
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-slate-800">
                      {script.category} &bull; {script.product}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {script.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {script.description}
                  </p>

                  <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all max-h-56 overflow-y-auto">
                    {script.text}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyScript(script.text, idx)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied Script!" : "Copy Full Text"}
                  </button>

                  <button
                    onClick={() => shareScriptWhatsApp(script.text)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
                    title="Send straight to WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Flyers & Graphics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Promotional Graphics & Flyers</h2>
            <p className="text-xs text-slate-400">
              Download approved visual assets to post on Instagram stories, Facebook banners, and WhatsApp statuses.
            </p>
          </div>
        </div>

        {materials && materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {mat.category}
                  </span>
                  <h4 className="font-bold text-white text-sm">{mat.title}</h4>
                  <p className="text-xs text-slate-400">{mat.description}</p>
                </div>

                {mat.fileUrl && (
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    download
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Asset
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              Official Media Kit & Banners
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our graphic design team regularly uploads updated promotional banners, brochures, and course flyers here. You can also request custom branded materials from ProTech admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
