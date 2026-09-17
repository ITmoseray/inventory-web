"use client";

import React, { useState } from "react";
import { 
  Sparkles, Store, ShoppingBag, Palette, Wand2, Eye, 
  ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, 
  RefreshCw, Check, Globe 
} from "lucide-react";
import { 
  AIStoreGenerationInput, 
  StoreStyleArchetypes, 
  StoreStyleArchetype 
} from "@/types/store-builder";
import { STYLE_PRESETS } from "@/lib/store-builder/ai-service";
import { createOrGenerateStore } from "@/lib/actions/store-builder";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  initialBusiness?: any;
  availableProducts: any[];
  onComplete?: (store: any) => void;
  onStoreCreated?: (store: any) => void;
}

const STYLE_OPTIONS: { id: StoreStyleArchetype; name: string; desc: string; previewColor: string }[] = [
  { id: "modern", name: "Modern Clean", desc: "Crisp indigo accents, balanced typography, ideal for any retail shop.", previewColor: "#4F46E5" },
  { id: "luxury", name: "Black & Gold Luxury", desc: "Deep dark aesthetic with golden tones and editorial serif typography.", previewColor: "#D4AF37" },
  { id: "minimal", name: "Nordic Minimal", desc: "Monochrome, spacious layouts focusing purely on product clarity.", previewColor: "#18181B" },
  { id: "fashion", name: "Vibrant Fashion", desc: "Chic rose & berry tones with expressive hero banners.", previewColor: "#E11D48" },
  { id: "african-contemporary", name: "African Heritage", desc: "Warm terracotta, ochre and earth tones celebrating authentic culture.", previewColor: "#C2410C" },
  { id: "electronics", name: "Tech & Electronics", desc: "Electric blue and slate accents with tech specs and warranty badges.", previewColor: "#2563EB" },
  { id: "grocery", name: "Fresh Grocery", desc: "Lush greens and warm tones for food, farm fresh produce and daily goods.", previewColor: "#16A34A" },
  { id: "pharmacy", name: "Health & Pharmacy", desc: "Clean teal and medical accents inspiring trust and wellness.", previewColor: "#0D9488" },
  { id: "restaurant", name: "Restaurant & Food", desc: "Warm appetizing amber and orange styling with quick ordering.", previewColor: "#EA580C" },
  { id: "corporate", name: "Enterprise & Office", desc: "Deep navy and professional corporate presentation for B2B supplies.", previewColor: "#1E3A8A" },
];

export function StoreWizard({ initialBusiness, availableProducts = [], onComplete, onStoreCreated }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [generating, setGenerating] = useState(false);
  const [generatedStore, setGeneratedStore] = useState<any>(null);

  const [formData, setFormData] = useState<AIStoreGenerationInput>({
    businessName: initialBusiness?.name || "",
    businessType: initialBusiness?.type || "Retail",
    description: `We offer premium quality products in ${initialBusiness?.address || "Freetown, Sierra Leone"}. Fast doorstep delivery and trusted service.`,
    location: initialBusiness?.address || "Freetown, Sierra Leone",
    phone: initialBusiness?.phone || "",
    whatsapp: initialBusiness?.whatsappPhone || initialBusiness?.phone || "",
    email: initialBusiness?.email || "",
    targetCustomers: "Everyday shoppers seeking verified quality and fast delivery",
    styleArchetype: "modern",
    productIds: availableProducts.slice(0, 12).map((p) => p.id),
  });

  const toggleProduct = (productId: string) => {
    setFormData((prev) => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists 
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId]
      };
    });
  };

  const selectAllProducts = () => {
    setFormData((prev) => ({
      ...prev,
      productIds: availableProducts.map((p) => p.id)
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setStep(4);
    try {
      const res = await createOrGenerateStore(formData);
      if (res.success && res.store) {
        setGeneratedStore(res.store);
        toast.success("AI generated your store successfully!");
        setStep(5);
        (onStoreCreated || onComplete)?.(res.store);
      } else {
        toast.error("Generation failed. Please retry.");
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate store");
      setStep(3);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 overflow-x-auto no-scrollbar gap-4">
        {[
          { num: 1, label: "Business Profile", icon: Store },
          { num: 2, label: "Select Products", icon: ShoppingBag },
          { num: 3, label: "Choose Style", icon: Palette },
          { num: 4, label: "AI Generation", icon: Wand2 },
          { num: 5, label: "Preview & Launch", icon: Eye },
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          const Icon = s.icon;

          return (
            <div
              key={s.num}
              className={`flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                isActive ? "text-indigo-600 font-black" : isDone ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white scale-110 shadow-indigo-600/30"
                    : isDone
                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span className="text-xs uppercase tracking-wider">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: BUSINESS DETAILS */}
      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Step 1 of 5</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tell us about your business</h2>
            <p className="text-xs text-slate-500">
              Our AI uses your business details to write tailored copy, product banners, and contact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Store / Business Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Freetown Glamour Boutique"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business Category / Type *</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                placeholder="e.g. Fashion, Electronics, Pharmacy, Supermarket"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Business Description & Story (AI Prompt) *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none"
              placeholder="Describe what you sell, your target customers, and what makes your store unique..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location / City *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none"
                placeholder="Wilkinson Road, Freetown"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp Order Line *</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none"
                placeholder="+232 79 123456"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none"
                placeholder="contact@mystore.com"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => {
                if (!formData.businessName || !formData.description) {
                  toast.error("Please enter your business name and description");
                  return;
                }
                setStep(2);
              }}
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              Continue to Products <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT PRODUCTS */}
      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Step 2 of 5</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Select Online Catalog Items</h2>
              <p className="text-xs text-slate-500">
                Choose which products from your Enterprise OS inventory will be available online.
              </p>
            </div>
            <button
              type="button"
              onClick={selectAllProducts}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap"
            >
              Select All ({availableProducts.length})
            </button>
          </div>

          {availableProducts.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-amber-600" />
              <h4 className="font-bold text-sm">No products found in inventory yet</h4>
              <p className="text-xs max-w-sm mx-auto">
                You can still generate your store! Your sample showcase will be pre-created, and you can link products later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {availableProducts.map((p) => {
                const isSelected = formData.productIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center text-white shrink-0 ${
                        isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>
                      <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 block">
                        Le {Number(p.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              Choose Style & Theme <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE STYLE ARCHETYPE */}
      {step === 3 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Step 3 of 5</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Select Design & Aesthetic Style</h2>
            <p className="text-xs text-slate-500">
              Choose an aesthetic theme. Our AI will craft sections, typography and palettes inspired by this archetype.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STYLE_OPTIONS.map((style) => {
              const isSelected = formData.styleArchetype === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => setFormData({ ...formData, styleArchetype: style.id })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg shadow-indigo-600/10 scale-[1.02]"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: style.previewColor }}
                      />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{style.name}</h4>
                    </div>
                    {isSelected && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{style.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleGenerate}
              className="px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Generate Store with AI
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI GENERATION IN PROGRESS */}
      {step === 4 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Wand2 className="w-10 h-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              AI Store Builder is Generating Your Store...
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Synthesizing brand theme, layout, hero sections, product presentation, promotional copy, and mobile layouts.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 pt-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Analyzing business archetype
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Curating product catalog showcase
            </div>
            <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" /> Structuring 16 responsive sections
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-4 h-4 rounded-full border border-slate-300" /> Generating WhatsApp checkout links
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PREVIEW & LAUNCH READY */}
      {step === 5 && generatedStore && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Storefront Generated</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {generatedStore.name} is Ready!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your store has been created and configured. You can preview it, customize sections with the visual studio, or publish immediately.
            </p>
          </div>

          {/* Store URL Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-md mx-auto flex items-center justify-between">
            <div className="text-left font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
              /store/{generatedStore.slug}
            </div>
            <Link
              href={`/store/${generatedStore.slug}`}
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
            >
              <Globe className="w-3.5 h-3.5" /> View
            </Link>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => (onStoreCreated || onComplete)?.(generatedStore)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center gap-2"
            >
              Open Visual Studio & Editor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
