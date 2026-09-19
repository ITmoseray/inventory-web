"use client";

import React, { useState } from "react";
import { 
  Sparkles, Wand2, ArrowRight, CheckCircle2, Globe, RefreshCw, 
  Laptop, Tablet, Smartphone, Check, ShoppingBag, X, Phone, Lock, 
  Mail, User, ExternalLink, ShieldCheck, ChevronRight, Eye
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { 
  generateGuestStorePreviewAction, 
  claimGuestStoreAction 
} from "@/lib/actions/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";
import { STARTER_TEMPLATES } from "@/lib/store-builder/starter-templates";
import { StoreSection, StoreTheme, normalizeStoreTheme } from "@/types/store-builder";

const INSPIRATION_CHIPS = [
  { label: "👗 Women's Fashion & Bags", prompt: "A chic boutique selling elegant women's dresses, handbags, and heels in Freetown with WhatsApp ordering." },
  { label: "📱 Phones & Tech Gadgets", prompt: "An electronics store selling brand-new smartphones, wireless earbuds, laptops, and chargers with warranty." },
  { label: "🥦 Fresh Farm Grocery", prompt: "Fresh food market delivering farm produce, rice, cooking oils, and daily groceries same-day." },
  { label: "🍔 Hot Food & Burger Bar", prompt: "A lively restaurant offering juicy burgers, grilled chicken, fresh fruit juices, and quick local delivery." },
  { label: "💄 Luxury Beauty & Makeup", prompt: "A high-end cosmetics shop offering skincare serums, lipsticks, perfumes, and beauty consultations." },
  { label: "💊 Health & Pharmacy", prompt: "A community pharmacy offering verified medications, vitamins, baby care items, and pharmacist advice." },
  { label: "🔨 Hardware & Tools", prompt: "Quality building materials, electrical supplies, power tools, and paints with bulk discount quotes." },
];

interface Props {
  initialPrompt?: string;
}

export function PublicStoreCreatorClient({ initialPrompt = "" }: Props) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStore, setGeneratedStore] = useState<any | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeStep, setActiveStep] = useState(0);

  // Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimName, setClaimName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPassword, setClaimPassword] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedResult, setClaimedResult] = useState<any | null>(null);

  const PROGRESS_STEPS = [
    "Understanding your business idea & category...",
    "Designing your brand palette & typography...",
    "Creating your starter product catalog & prices...",
    "Setting up 1-click WhatsApp customer ordering...",
    "Rendering your live multi-device preview..."
  ];

  const handleGenerate = async (customPrompt?: string, templateId?: string) => {
    const finalPrompt = customPrompt !== undefined ? customPrompt : prompt;
    if (!templateId && (!finalPrompt || finalPrompt.trim().length < 5)) {
      toast.error("Please describe your store idea in a few words.");
      return;
    }

    setIsGenerating(true);
    setGeneratedStore(null);
    setActiveStep(0);

    // Step ticker
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await generateGuestStorePreviewAction({
        prompt: finalPrompt,
        templateId: templateId || undefined
      });

      clearInterval(timer);

      if (res.success) {
        setGeneratedStore(res);
        toast.success(`🎉 ${res.name} generated! Scroll down to preview.`);
      } else {
        toast.error(res.error || "Failed to generate store. Please try again.");
      }
    } catch (err: any) {
      clearInterval(timer);
      toast.error(err.message || "Failed to generate store");
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length >= 5) {
      handleGenerate(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleClaimStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!claimPassword || claimPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsClaiming(true);
    try {
      const res = await claimGuestStoreAction({
        storeData: {
          name: generatedStore.name,
          slug: generatedStore.slug,
          description: generatedStore.description,
          theme: generatedStore.theme,
          sections: generatedStore.sections,
          navigation: generatedStore.navigation,
          settings: generatedStore.settings,
          sampleProducts: generatedStore.sampleProducts,
          whatsappPhone: claimPhone,
          templateId: selectedTemplateId || undefined
        },
        userData: {
          name: claimName,
          email: claimEmail,
          password: claimPassword,
          phone: claimPhone
        }
      });

      if (res.success) {
        setClaimedResult(res);
        toast.success(`🚀 Store created and published!`);
      } else {
        toast.error(res.error || "Failed to claim store");
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating store account");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight">ProTech</span>{" "}
              <span className="text-primary font-bold text-xs">AI Store Creator</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        
        {/* ── HERO HEADER ────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            100% Free • No Shop Account or Credit Card Required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Create Your Dream Online Store in <span className="text-primary">30 Seconds</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tell our AI what you sell. We will instantly design your brand, build your product catalog, and set up 1-click WhatsApp customer ordering.
          </p>
        </div>

        {/* ── AI PROMPT & CREATION CARD ──────────────────────── */}
        <div className="max-w-3xl mx-auto rounded-3xl border-2 border-primary/30 bg-card p-4 sm:p-7 shadow-2xl shadow-primary/10 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Describe Your Store Idea
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A trendy sneaker and streetwear shop in Freetown with modern neon styling and fast doorstep delivery..."
                  className="w-full bg-transparent border-0 resize-none text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 leading-relaxed"
                />
              </div>
            </div>

            {/* Inspiration Chips */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Need inspiration? Click any category below:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(chip.prompt);
                      handleGenerate(chip.prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-bold text-foreground transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Generate Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero setup fee • Free mobile-friendly preview</span>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleGenerate()}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Building Store...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate My Store
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── GENERATION PROGRESS INDICATOR ──────────────────── */}
        {isGenerating && (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-muted/40 border border-border/80 shadow-lg space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Creating your online storefront...</span>
              <span className="text-primary font-black">{Math.round(((activeStep + 1) / PROGRESS_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((activeStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-center font-medium text-muted-foreground animate-pulse">
              {PROGRESS_STEPS[activeStep]}
            </p>
          </div>
        )}

        {/* ── LIVE INTERACTIVE PREVIEW SECTION ────────────────── */}
        {generatedStore && !isGenerating && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Action Bar Above Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Live Preview: <span className="text-primary font-black">{generatedStore.name}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Test your store below. Switch devices or claim it for free to make it live.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Viewport Toggles */}
                <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/70 text-xs font-bold">
                  <button
                    onClick={() => setViewport("desktop")}
                    className={`p-2 rounded-lg transition-all ${viewport === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                    title="Desktop View (1280px)"
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    className={`p-2 rounded-lg transition-all ${viewport === "tablet" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                    title="Tablet View (768px)"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    className={`p-2 rounded-lg transition-all ${viewport === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                    title="Mobile View (390px)"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Claim Store Trigger */}
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Claim & Publish Free
                </button>
              </div>
            </div>

            {/* Viewport Frame Container */}
            <div className="flex justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-x-hidden w-full">
              <div
                style={{
                  width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "390px",
                  maxWidth: "100%",
                  transition: "width 0.3s ease-in-out"
                }}
                className={`bg-background overflow-hidden border border-border shadow-2xl max-h-[85vh] overflow-y-auto w-full transition-all ${
                  viewport === "mobile" 
                    ? "rounded-[32px] sm:border-[8px] sm:border-slate-800" 
                    : viewport === "tablet"
                    ? "rounded-2xl sm:border-[6px] sm:border-slate-800"
                    : "rounded-2xl"
                }`}
              >
                <StoreThemeWrapper theme={normalizeStoreTheme(generatedStore.theme)}>
                  <StoreHeader 
                    storeName={generatedStore.name} 
                    storeSlug={generatedStore.slug || "preview"}
                    whatsappNumber={generatedStore.whatsapp || "+23276000000"}
                    theme={generatedStore.theme}
                    navigation={generatedStore.navigation} 
                  />
                  <div className="space-y-0">
                    {generatedStore.sections.map((sec: StoreSection) => (
                      <SectionRenderer
                        key={sec.id}
                        section={sec}
                        theme={generatedStore.theme}
                        storeName={generatedStore.name}
                        storeSlug={generatedStore.slug || "preview"}
                        products={generatedStore.sampleProducts || []}
                        navigation={generatedStore.navigation}
                        whatsappNumber={generatedStore.whatsapp || "+23276000000"}
                        currency="SLE"
                      />
                    ))}
                  </div>
                </StoreThemeWrapper>
              </div>
            </div>
          </div>
        )}

        {/* ── 20+ STARTER TEMPLATES SECTION ───────────────────── */}
        <div className="space-y-6 pt-12 border-t border-border/60">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Or Pick from 20+ High-Converting Starter Templates
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Ready-made, professionally designed layouts for every business niche.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {STARTER_TEMPLATES.slice(0, 8).map((tpl) => (
              <div
                key={tpl.templateId}
                className="flex flex-col rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-all group"
              >
                <div className="h-32 rounded-xl bg-muted/60 border border-border/60 mb-3 overflow-hidden relative flex items-center justify-center">
                  <div 
                    className="w-full h-full p-3 flex flex-col justify-between"
                    style={{ backgroundColor: tpl.themeConfig.colors.surface }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground">{tpl.category}</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tpl.themeConfig.colors.primary }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tpl.themeConfig.colors.accent }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tpl.sections.length} store sections</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-1 mb-3">
                  <h4 className="font-bold text-xs text-foreground">{tpl.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{tpl.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tpl.templateId);
                    handleGenerate(undefined, tpl.templateId);
                  }}
                  className="w-full py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all text-center"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── CLAIM & PUBLISH MODAL ───────────────────────────── */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Claim Your Online Store</h3>
                  <p className="text-[11px] text-muted-foreground">Free forever • No shop account needed</p>
                </div>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!claimedResult ? (
              <form onSubmit={handleClaimStore} className="space-y-4">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                  <p className="font-bold text-foreground">Store Name: {generatedStore?.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    Includes {generatedStore?.sampleProducts?.length || 4} sample products & WhatsApp ordering.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mariatu Sesay"
                        value={claimName}
                        onChange={(e) => setClaimName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. mariatu@gmail.com"
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={claimPassword}
                        onChange={(e) => setClaimPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      WhatsApp Phone Number (For Customer Orders)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. +232 76 123 456"
                        value={claimPhone}
                        onChange={(e) => setClaimPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isClaiming}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing Store...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Launch My Free Online Store
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-foreground">
                    🎉 Your Online Store is Live!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your store has been created and published successfully.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={claimedResult.storeUrl}
                    target="_blank"
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Live Storefront
                  </Link>

                  <Link
                    href="/login"
                    className="w-full py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    Sign In to Store Dashboard
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground bg-muted/20">
        <p>© {new Date().getFullYear()} ProTech Assist Enterprise OS. AI Store Creator.</p>
      </footer>
    </div>
  );
}
