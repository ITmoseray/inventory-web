"use client";

import React, { useState } from "react";
import { 
  Wand2, ArrowRight, CheckCircle2, Globe, RefreshCw, 
  Laptop, Tablet, Smartphone, Check, ShoppingBag, X, Phone, Lock, 
  Mail, User, ExternalLink, ShieldCheck, ChevronRight, Eye, Search,
  Palette, SlidersHorizontal, Sparkles, AlertCircle
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
import { StoreMobileBottomNav } from "@/components/storefront/StoreMobileBottomNav";
import { STARTER_TEMPLATES } from "@/lib/store-builder/starter-templates";
import { StoreSection, StoreTheme, normalizeStoreTheme } from "@/types/store-builder";

// ── 10 REQUIRED BUSINESS CATEGORY SHORTCUTS ────────────────────────
const CATEGORY_SHORTCUTS = [
  { 
    id: "fashion", 
    label: "Women's Fashion & Bags", 
    icon: "👗", 
    category: "Fashion & Apparel",
    style: "fashion",
    prompt: "A chic boutique selling elegant women's dresses, luxury handbags, designer heels, and fine jewelry in Freetown with WhatsApp ordering." 
  },
  { 
    id: "tech", 
    label: "Phones & Tech Gadgets", 
    icon: "📱", 
    category: "Electronics & Tech",
    style: "electronics",
    prompt: "An electronics store selling brand-new smartphones, laptops, wireless earbuds, smartwatches, and accessories with authentic warranty." 
  },
  { 
    id: "grocery", 
    label: "Fresh Farm Grocery", 
    icon: "🥦", 
    category: "Supermarket & Grocery",
    style: "grocery",
    prompt: "Fresh farm market delivering local farm produce, organic vegetables, rice, cooking oils, and daily household groceries same-day." 
  },
  { 
    id: "restaurant", 
    label: "Restaurants & Fast Food", 
    icon: "🍔", 
    category: "Food & Restaurant",
    style: "restaurant",
    prompt: "A lively restaurant offering hot delicious meals, artisanal burgers, grilled chicken, fresh tropical juices, and quick local takeaway." 
  },
  { 
    id: "beauty", 
    label: "Beauty & Cosmetics", 
    icon: "💄", 
    category: "Beauty & Cosmetics",
    style: "beauty",
    prompt: "A luxury beauty boutique offering verified skincare serums, lipsticks, perfumes, wig essentials, and beauty consultations." 
  },
  { 
    id: "pharmacy", 
    label: "Health & Pharmacy", 
    icon: "💊", 
    category: "Health & Pharmacy",
    style: "pharmacy",
    prompt: "Licensed community pharmacy offering verified prescription medicines, vitamins, wellness products, and baby care essentials." 
  },
  { 
    id: "hardware", 
    label: "Hardware & Tools", 
    icon: "🔨", 
    category: "Automotive & Hardware",
    style: "hardware",
    prompt: "Quality building materials, electrical supplies, power tools, plumbing fittings, and paints with instant bulk discount quotes." 
  },
  { 
    id: "furniture", 
    label: "Furniture & Home Decor", 
    icon: "🛋️", 
    category: "Home & Furniture",
    style: "furniture",
    prompt: "Handcrafted modern sofas, dining sets, ergonomic office desks, and stylish home interior furnishings with doorstep assembly." 
  },
  { 
    id: "retail", 
    label: "General Retail", 
    icon: "🏬", 
    category: "General Retail",
    style: "general",
    prompt: "General retail store offering diverse daily household goods, electronics accessories, and gifts at competitive prices." 
  },
  { 
    id: "other", 
    label: "Other Business Types", 
    icon: "✨", 
    category: "Corporate & Services",
    style: "modern",
    prompt: "A bespoke modern commercial enterprise providing verified quality products and dedicated customer service with doorstep delivery." 
  },
];

const STYLE_OPTIONS = [
  { id: "modern", label: "Modern & Clean", badge: "POPULAR" },
  { id: "luxury", label: "Luxury & Editorial", badge: "PREMIUM" },
  { id: "minimal", label: "Minimalist", badge: "SLEEK" },
  { id: "vibrant", label: "Vibrant & Bold", badge: "DYNAMIC" },
  { id: "african-contemporary", label: "African Contemporary", badge: "WARM" },
];

const COLOR_PRESETS = [
  { label: "Indigo & Cyan", primary: "#4F46E5", secondary: "#06B6D4" },
  { label: "Rose & Ruby", primary: "#E11D48", secondary: "#BE123C" },
  { label: "Emerald & Mint", primary: "#059669", secondary: "#10B981" },
  { label: "Midnight Gold", primary: "#D4AF37", secondary: "#1E293B" },
  { label: "Sunset Amber", primary: "#EA580C", secondary: "#F59E0B" },
];

interface Props {
  initialPrompt?: string;
}

export function PublicStoreCreatorClient({ initialPrompt = "" }: Props) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Fashion & Apparel");
  const [preferredStyle, setPreferredStyle] = useState("modern");
  const [selectedColor, setSelectedColor] = useState("#4F46E5");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedStore, setGeneratedStore] = useState<any | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeStep, setActiveStep] = useState(0);

  // Template marketplace filters
  const [tplSearch, setTplSearch] = useState("");
  const [tplCategory, setTplCategory] = useState("All");

  // Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimName, setClaimName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPassword, setClaimPassword] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedResult, setClaimedResult] = useState<any | null>(null);

  const PROGRESS_STEPS = [
    "Analyzing your business category & target buyers...",
    "Selecting bespoke color palette & typography hierarchy...",
    "Creating curated starter catalog & pricing records...",
    "Configuring WhatsApp ordering & delivery rules...",
    "Finalizing high-converting responsive storefront preview..."
  ];

  const handleShortcutClick = (shortcut: typeof CATEGORY_SHORTCUTS[0]) => {
    setPrompt(shortcut.prompt);
    setBusinessCategory(shortcut.category);
    setPreferredStyle(shortcut.style);
    toast.info(`Selected "${shortcut.label}" shortcut`);
  };

  const handleGenerate = async (customPrompt?: string, templateId?: string) => {
    const finalPrompt = customPrompt !== undefined ? customPrompt : prompt;
    if (!templateId && (!finalPrompt || finalPrompt.trim().length < 5)) {
      toast.error("Please describe your store idea or select a category shortcut.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedStore(null);
    setActiveStep(0);

    // Step progression ticker
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await generateGuestStorePreviewAction({
        prompt: finalPrompt,
        templateId: templateId || undefined,
        businessName: businessName.trim() || undefined,
        businessType: businessCategory,
        preferredStyle: preferredStyle,
        brandColor: selectedColor,
        whatsappPhone: whatsappNumber.trim() || undefined
      });

      clearInterval(timer);

      if (res.success) {
        setGeneratedStore(res);
        if (whatsappNumber.trim()) {
          setClaimPhone(whatsappNumber.trim());
        }
        toast.success(`🎉 Store "${res.name}" generated successfully! Preview below.`);
      } else {
        setGenerationError(res.error || "Generation failed. Please try again.");
        toast.error(res.error || "Failed to generate store. Please try again.");
      }
    } catch (err: any) {
      clearInterval(timer);
      setGenerationError(err.message || "Failed to generate store");
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
          whatsappPhone: claimPhone || whatsappNumber || undefined,
          templateId: selectedTemplateId || undefined
        },
        userData: {
          name: claimName,
          email: claimEmail,
          password: claimPassword,
          phone: claimPhone || whatsappNumber || undefined
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

  // Filter templates in the gallery
  const filteredTemplates = STARTER_TEMPLATES.filter(tpl => {
    const matchesCat = tplCategory === "All" || tpl.category.toLowerCase() === tplCategory.toLowerCase();
    const matchesSearch = !tplSearch.trim() || 
      tpl.name.toLowerCase().includes(tplSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(tplSearch.toLowerCase()) ||
      tpl.tags.some(t => t.toLowerCase().includes(tplSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

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
              <span className="font-black text-sm tracking-tight">ProTech Assist</span>{" "}
              <span className="text-primary font-bold text-xs">AI Store Builder</span>
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
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        
        {/* ── HERO HEADER ────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% Free — No Shop Account or Credit Card Required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Create Your Dream Online Store in <span className="text-primary">30 Seconds</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tell our AI what you sell. Create a professional storefront, customize your design, add products, and enable customer ordering.
          </p>
        </div>

        {/* ── 10 BUSINESS CATEGORY SHORTCUTS ──────────────────── */}
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
            <span>Popular Business Categories (Click to auto-populate):</span>
            <span className="text-[11px] font-normal text-muted-foreground/80">10 options</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CATEGORY_SHORTCUTS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleShortcutClick(sc)}
                className="p-3 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{sc.icon}</span>
                <span className="text-xs font-bold text-foreground leading-tight">{sc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── AI CREATION FORM CARD ──────────────────────────── */}
        <div className="max-w-3xl mx-auto rounded-3xl border-2 border-primary/30 bg-card p-5 sm:p-8 shadow-2xl shadow-primary/10 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 space-y-5">
          
          {/* Business Name & WhatsApp Phone Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                Business Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Bella Chic Boutique"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                WhatsApp Number for Customer Orders
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +232 76 123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Large Store Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Tell Our AI What You Sell</span>
              <span className="text-[11px] font-normal text-muted-foreground">Detailed description ensures superior results</span>
            </label>
            <div className="relative rounded-2xl border border-border bg-background p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your products, target customers, location, and preferred aesthetic. e.g. A chic luxury women's boutique in Freetown selling designer dresses, handbags, and accessories with fast nationwide delivery..."
                className="w-full bg-transparent border-0 resize-none text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 leading-relaxed"
              />
            </div>
          </div>

          {/* Preferred Visual Style & Color Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                Preferred Visual Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setPreferredStyle(style.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      preferredStyle === style.id
                        ? "bg-primary text-primary-foreground shadow-sm scale-105"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                Brand Color Palette
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(p.primary)}
                    className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
                      selectedColor === p.primary 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primary }} />
                    <span className="text-[11px] font-bold text-foreground">{p.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Action Button & Error Box */}
          {generationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real products • WhatsApp ordering ready • Mobile optimized</span>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Store...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Store in 30s
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── GENERATION PROGRESS INDICATOR ──────────────────── */}
        {isGenerating && (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-muted/40 border border-border/80 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Generating your online storefront...</span>
              <span className="text-primary font-black">{Math.round(((activeStep + 1) / PROGRESS_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-border overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${((activeStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-center font-bold text-foreground animate-pulse">
              {PROGRESS_STEPS[activeStep]}
            </p>
          </div>
        )}

        {/* ── LIVE STOREFRONT PREVIEW SECTION ────────────────── */}
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
                    Responsive multi-device preview. Switch viewport below or claim to publish live.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Claim &amp; Publish Free
                </button>
              </div>
            </div>

            {/* Viewport Frame Container */}
            <div className="flex justify-center bg-slate-950/90 backdrop-blur-md p-1.5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-x-hidden w-full">
              <div
                style={{
                  width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "100%",
                  maxWidth: viewport === "mobile" ? "390px" : "100%",
                  transition: "max-width 0.3s ease-in-out, width 0.3s ease-in-out"
                }}
                className={`bg-background overflow-hidden border border-border shadow-2xl max-h-[85vh] overflow-y-auto w-full transition-all relative ${
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
                    whatsappNumber={generatedStore.whatsapp || whatsappNumber || "+23276000000"}
                    theme={generatedStore.theme}
                    navigation={generatedStore.navigation} 
                  />
                  <div className="space-y-0 pb-16">
                    {generatedStore.sections.map((sec: StoreSection) => (
                      <SectionRenderer
                        key={sec.id}
                        section={sec}
                        theme={generatedStore.theme}
                        storeName={generatedStore.name}
                        storeSlug={generatedStore.slug || "preview"}
                        products={generatedStore.sampleProducts || []}
                        navigation={generatedStore.navigation}
                        whatsappNumber={generatedStore.whatsapp || whatsappNumber || "+23276000000"}
                        currency="SLE"
                      />
                    ))}
                  </div>

                  {/* Mobile Bottom Navigation in Mobile Preview */}
                  <div className="sticky bottom-0 z-40">
                    <StoreMobileBottomNav
                      storeSlug={generatedStore.slug || "preview"}
                      whatsappNumber={generatedStore.whatsapp || whatsappNumber || "+23276000000"}
                      theme={generatedStore.theme}
                    />
                  </div>
                </StoreThemeWrapper>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFESSIONAL TEMPLATE MARKETPLACE SECTION ──────── */}
        <div className="space-y-6 pt-12 border-t border-border/60">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              <Palette className="w-3.5 h-3.5" />
              Template Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Commercial-Grade Starter Templates
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Browse professionally crafted e-commerce layouts. Each template includes custom typography, category-specific layouts, and WhatsApp checkout.
            </p>
          </div>

          {/* Template Search and Category Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                value={tplSearch}
                onChange={(e) => setTplSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
              {["All", "Fashion & Apparel", "Electronics & Tech", "Supermarket & Grocery", "Food & Restaurant", "Beauty & Cosmetics", "Health & Pharmacy"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTplCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    tplCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.templateId}
                className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl group"
              >
                {/* Template Dedicated Thumbnail with Badges and Overlay */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={tpl.thumbnail || tpl.previewImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"}
                    alt={tpl.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-between p-3" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
                      {tpl.category}
                    </span>
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shadow-sm" 
                        style={{ backgroundColor: tpl.themeConfig.colors.primary }} 
                        title={`Primary: ${tpl.themeConfig.colors.primary}`}
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-full shadow-sm" 
                        style={{ backgroundColor: tpl.themeConfig.colors.accent }} 
                        title={`Accent: ${tpl.themeConfig.colors.accent}`}
                      />
                    </div>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-end justify-between text-white">
                    <div>
                      <p className="text-sm font-black drop-shadow-md text-white leading-tight">{tpl.name}</p>
                      <p className="text-[10px] text-white/80 font-semibold drop-shadow-sm">{tpl.sections.length} Curated Sections</p>
                    </div>
                    <span className="text-[9px] uppercase font-black text-black px-2 py-0.5 rounded-md bg-amber-400 shadow-sm">
                      {tpl.style}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.templateId);
                        handleGenerate(undefined, tpl.templateId);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer shadow-sm hover:shadow active:scale-95"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
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
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Claim Your Online Store</h3>
                  <p className="text-[11px] text-muted-foreground">Free forever • No shop account required</p>
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
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                  <p className="font-bold text-foreground">Store Name: {generatedStore?.name}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Includes {generatedStore?.sampleProducts?.length || 4} verified products &amp; WhatsApp ordering.
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
                        value={claimPhone || whatsappNumber}
                        onChange={(e) => setClaimPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isClaiming}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <p>© {new Date().getFullYear()} ProTech Assist Enterprise OS. AI Store Builder.</p>
      </footer>
    </div>
  );
}
