"use client";

import React, { useState } from "react";
import { 
  Laptop, Tablet, Smartphone, Sparkles, Save, Globe, Eye, EyeOff, 
  Trash2, ChevronUp, ChevronDown, Plus, Wand2, X, Check, ArrowRight,
  Palette, Layout, Settings, RefreshCw, ShoppingBag, Layers, ExternalLink
} from "lucide-react";
import { StoreSection, StoreTheme, StoreSectionType, StoreSectionTypes, normalizeStoreTheme } from "@/types/store-builder";
import { updateStoreConfig, updateStorePageSections, toggleStorePublish, modifyStoreWithAIAction } from "@/lib/actions/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  initialStore: any;
  availableProducts: any[];
}

const SECTION_TEMPLATES: { type: StoreSectionType; name: string; desc: string; defaultContent: any }[] = [
  { type: "hero", name: "Hero Banner", desc: "Large impactful introduction with headline, CTA buttons, and background image.", defaultContent: { title: "Discover Our Best Picks", subtitle: "Curated quality products with prompt doorstep delivery.", badge: "NEW ARRIVAL", primaryButtonText: "Shop Catalog", primaryButtonUrl: "#products", bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" } },
  { type: "product-grid", name: "Product Grid", desc: "Showcase online products in a responsive grid with direct Add to Cart buttons.", defaultContent: { title: "Featured Products", subtitle: "Handpicked essentials and popular trending items." } },
  { type: "featured-product", name: "Featured Product Spotlight", desc: "Highlight a single star item with large visuals and detailed specs.", defaultContent: { title: "Spotlight Deal", description: "Our most requested item this season. Guaranteed genuine quality." } },
  { type: "categories", name: "Category Grid", desc: "Display visual icons/cards for all product departments.", defaultContent: { title: "Browse by Department", subtitle: "Quickly find the right items." } },
  { type: "promotional-offer", name: "Promotional Banner", desc: "High-contrast announcement banner with discount badge and WhatsApp link.", defaultContent: { badge: "LIMITED OFFER", title: "Flash Sale: Up to 20% OFF!", description: "Order online today and enjoy swift doorstep delivery.", ctaText: "Order Now", ctaUrl: "#products" } },
  { type: "product-carousel", name: "Product Carousel", desc: "Horizontally scrolling carousel of trending items.", defaultContent: { title: "Trending Items" } },
  { type: "banner", name: "Gradient Banner", desc: "Colorful promotional banner with custom message.", defaultContent: { badge: "SPECIAL", title: "Free Delivery on Orders Over Le 250", description: "Available for all orders across the city." } },
  { type: "image-text", name: "Image + Story", desc: "Split layout showcasing a product feature or brand story alongside a photo.", defaultContent: { title: "Crafted with Authentic Care", description: "Every item is carefully verified for quality, longevity, and genuine satisfaction.", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80", badge: "OUR MISSION" } },
  { type: "testimonials", name: "Customer Testimonials", desc: "Display star ratings and quotes from happy shoppers.", defaultContent: { title: "Loved by Customers", subtitle: "Real ratings from everyday shoppers." } },
  { type: "faq", name: "FAQ Accordion", desc: "Answers to delivery, payment, return, and WhatsApp ordering questions.", defaultContent: { title: "Frequently Asked Questions", subtitle: "Common questions answered." } },
  { type: "newsletter", name: "Newsletter Box", desc: "Allow shoppers to subscribe for special discount notifications.", defaultContent: { title: "Join Our VIP List", subtitle: "Get early access to flash sales and new arrivals." } },
  { type: "contact", name: "Contact & WhatsApp", desc: "Direct phone, WhatsApp, email, and location info cards.", defaultContent: { title: "Reach Out to Us", subtitle: "We are available anytime to assist with your order." } },
  { type: "about", name: "About the Brand", desc: "Origin story with key credibility metric numbers.", defaultContent: { title: "Our Story & Promise", description: "Dedicated to providing verified items and dependable service." } },
  { type: "text", name: "Text Announcement", desc: "Clean centered message or policy statement.", defaultContent: { title: "Quality You Can Rely On", body: "We pride ourselves on offering authentic items with zero compromises." } },
  { type: "image", name: "Full-Width Graphic", desc: "Visual lookbook or promotional banner image.", defaultContent: { imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" } },
  { type: "footer", name: "Storefront Footer", desc: "Footer with quick links, contact summary, and copyright note.", defaultContent: { aboutText: "Your trusted destination for verified quality products." } },
];

export function StoreStudio({ initialStore, availableProducts = [] }: Props) {
  const [store, setStore] = useState(initialStore);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeLeftTab, setActiveLeftTab] = useState<"sections" | "theme">("sections");

  const homePage = store.pages?.find((p: any) => p.slug === "home" || p.isHome) || store.pages?.[0];
  const [sections, setSections] = useState<StoreSection[]>((homePage?.sections as unknown as StoreSection[]) || []);
  const [theme, setTheme] = useState<StoreTheme>(normalizeStoreTheme(store.themeConfig));
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || "");

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiExecuting, setIsAiExecuting] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Reordering sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setSections(updated.map((s, idx) => ({ ...s, order: idx })));
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) {
      toast.error("You must keep at least one section");
      return;
    }
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || "");
    }
  };

  const addSection = (template: typeof SECTION_TEMPLATES[0]) => {
    const newSection: StoreSection = {
      id: `sec-${template.type}-${Date.now()}`,
      type: template.type,
      order: sections.length,
      visible: true,
      settings: {},
      content: { ...template.defaultContent }
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    setIsAddModalOpen(false);
    toast.success(`Added "${template.name}" section!`);
  };

  // Section content updater
  const updateSelectedContent = (key: string, value: any) => {
    if (!selectedSectionId) return;
    setSections(sections.map((s) => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          [key]: value
        }
      };
    }));
  };

  // Theme updater
  const updateThemeColor = (key: string, color: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: color
      }
    }));
  };

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update theme
      await updateStoreConfig({
        themeConfig: theme
      });
      // 2. Update home page sections
      await updateStorePageSections("home", sections);
      toast.success("Store changes saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish status
  const handlePublishToggle = async () => {
    setIsPublishing(true);
    const newStatus = store.status === "PUBLISHED" ? false : true;
    try {
      const res = await toggleStorePublish(newStatus);
      if (res.success) {
        setStore({ ...store, status: res.status });
        toast.success(newStatus ? "Store is now LIVE to the public!" : "Store set to DRAFT.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update publish status");
    } finally {
      setIsPublishing(false);
    }
  };

  // AI Assistant command
  const handleAiCommand = async (commandToRun?: string) => {
    const prompt = commandToRun || aiPrompt;
    if (!prompt.trim()) return;

    setIsAiExecuting(true);
    try {
      const res = await modifyStoreWithAIAction(prompt);
      if (res.success) {
        if (res.updatedTheme) setTheme(normalizeStoreTheme(res.updatedTheme));
        if (res.updatedSections) setSections(res.updatedSections as StoreSection[]);
        toast.success(res.explanation || "Store updated with AI!");
        setIsAiModalOpen(false);
        setAiPrompt("");
      } else {
        toast.error("AI could not apply change. Please try a different phrasing.");
      }
    } catch (err: any) {
      toast.error(err.message || "AI modification failed");
    } finally {
      setIsAiExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-3 sm:-m-6 md:-m-8 bg-slate-900 text-white overflow-hidden select-none">
      {/* ── TOP STUDIO TOOLBAR ─────────────────────────────── */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Store info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-white">{store.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Studio
            </span>
          </div>

          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <span>/store/{store.slug}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Center: Device Switchers */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              device === "desktop" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (100%)"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              device === "tablet" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              device === "mobile" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>

          {/* Publish Toggle Button */}
          <button
            onClick={handlePublishToggle}
            disabled={isPublishing}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              store.status === "PUBLISHED"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{store.status === "PUBLISHED" ? "Published" : "Publish"}</span>
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN WORKSPACE BODY ───────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── COLUMN 1: LEFT NAVIGATION (SECTIONS & THEME) ─── */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          {/* Left Nav Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900 border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveLeftTab("sections")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeLeftTab === "sections" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Sections
            </button>
            <button
              onClick={() => setActiveLeftTab("theme")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeLeftTab === "theme" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Theme
            </button>
          </div>

          {/* Sections Tab Content */}
          {activeLeftTab === "sections" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-2">
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {sections.map((sec, idx) => {
                  const isSelected = sec.id === selectedSectionId;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`group p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white font-bold"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
                      } ${!sec.visible ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] text-slate-500 font-mono">{idx + 1}</span>
                        <span className="capitalize truncate">{sec.type.replace(/-/g, " ")}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-800 rounded disabled:opacity-20"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                          disabled={idx === sections.length - 1}
                          className="p-1 hover:bg-slate-800 rounded disabled:opacity-20"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.id); }}
                          className="p-1 hover:bg-slate-800 rounded"
                        >
                          {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                          className="p-1 hover:bg-rose-900/60 text-rose-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-indigo-400"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
              </div>
            </div>
          )}

          {/* Theme Tab Content */}
          {activeLeftTab === "theme" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Colors</span>
                {[
                  { label: "Primary Color", key: "primary", val: theme.colors.primary },
                  { label: "Accent / Badges", key: "accent", val: theme.colors.accent },
                  { label: "Background", key: "background", val: theme.colors.background },
                  { label: "Surface Cards", key: "surface", val: theme.colors.surface },
                  { label: "Text Color", key: "text", val: theme.colors.text },
                  { label: "Header Nav", key: "headerBg", val: theme.colors.headerBg },
                  { label: "Footer BG", key: "footerBg", val: theme.colors.footerBg },
                ].map((c) => (
                  <div key={c.key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">{c.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.val || "#4F46E5"}
                        onChange={(e) => updateThemeColor(c.key, e.target.value)}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-slate-400">{c.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Typography & Corners</span>
                <div>
                  <label className="text-slate-400 block mb-1">Heading Font</label>
                  <select
                    value={theme.fonts?.heading || "Inter"}
                    onChange={(e) => setTheme({ ...theme, fonts: { ...theme.fonts, heading: e.target.value } })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (African Energy)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Corner Radius</label>
                  <select
                    value={theme.borderRadius || "lg"}
                    onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="none">Square (None)</option>
                    <option value="sm">Small (Soft)</option>
                    <option value="lg">Large (Modern)</option>
                    <option value="full">Pill (Fashion)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMN 2: CENTER LIVE PREVIEW CANVAS ─────────── */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 rounded-2xl overflow-y-auto shadow-2xl bg-white text-slate-900 flex flex-col ${
              device === "desktop"
                ? "w-full"
                : device === "tablet"
                ? "w-[768px] border-8 border-slate-800 rounded-[2.5rem]"
                : "w-[375px] border-8 border-slate-800 rounded-[3rem]"
            }`}
          >
            {/* Live Storefront Preview */}
            <StoreThemeWrapper theme={theme}>
              <StoreHeader
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logoUrl}
                whatsappNumber={store.whatsappPhone}
                theme={theme}
                navigation={store.navigation}
              />

              <main>
                {sections.map((sec) => (
                  <div 
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`cursor-pointer transition-all ${
                      sec.id === selectedSectionId ? "ring-2 ring-indigo-500" : ""
                    }`}
                  >
                    <SectionRenderer
                      section={sec}
                      theme={theme}
                      storeSlug={store.slug}
                      storeName={store.name}
                      products={store.products || []}
                      navigation={store.navigation}
                      whatsappNumber={store.whatsappPhone}
                      currency={store.currency || "SLE"}
                    />
                  </div>
                ))}
              </main>
            </StoreThemeWrapper>
          </div>
        </div>

        {/* ── COLUMN 3: RIGHT INSPECTOR (PROPERTIES) ───────── */}
        <div className="w-72 bg-slate-950 border-l border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
          {selectedSection ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    Section Editor
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {selectedSection.type}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white capitalize mt-1">
                  {selectedSection.type.replace(/-/g, " ")} Properties
                </h3>
              </div>

              {/* Dynamic form fields depending on section type */}
              {selectedSection.content.badge !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Badge Text</label>
                  <input
                    type="text"
                    value={selectedSection.content.badge || ""}
                    onChange={(e) => updateSelectedContent("badge", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.title !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Headline / Title</label>
                  <input
                    type="text"
                    value={selectedSection.content.title || ""}
                    onChange={(e) => updateSelectedContent("title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.subtitle !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Subtitle</label>
                  <textarea
                    rows={2}
                    value={selectedSection.content.subtitle || ""}
                    onChange={(e) => updateSelectedContent("subtitle", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.description !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Description Text</label>
                  <textarea
                    rows={3}
                    value={selectedSection.content.description || ""}
                    onChange={(e) => updateSelectedContent("description", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.primaryButtonText !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Primary Button Text</label>
                  <input
                    type="text"
                    value={selectedSection.content.primaryButtonText || ""}
                    onChange={(e) => updateSelectedContent("primaryButtonText", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.bgImage !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Background Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.content.bgImage || ""}
                    onChange={(e) => updateSelectedContent("bgImage", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none text-[11px] font-mono"
                  />
                </div>
              )}

              {selectedSection.content.image !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Feature Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.content.image || ""}
                    onChange={(e) => updateSelectedContent("image", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none text-[11px] font-mono"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => removeSection(selectedSection.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/40 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Section
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Layers className="w-8 h-8 mx-auto stroke-[1.5]" />
              <p className="text-xs">Select any section on the canvas or left panel to edit properties.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD SECTION MODAL ──────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white">Add New Store Section</h3>
                <p className="text-xs text-slate-400">Select one of the 16 modular components to insert into your page.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SECTION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.type}
                  onClick={() => addSection(tmpl)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.02] space-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{tmpl.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{tmpl.desc}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1 pt-1">
                    <Plus className="w-3 h-3" /> Add Section
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI ASSISTANT MODAL ─────────────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">AI Store Assistant</h3>
                  <p className="text-[11px] text-slate-400">Describe what you want to change in plain English.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Quick Suggestions</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Change colors to black and gold",
                  "Add a 20% off promotional banner",
                  "Make the hero look more luxury",
                  "Add customer testimonials",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAiCommand(s)}
                    disabled={isAiExecuting}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="e.g. Change the store colors to emerald green and gold, and add a flash sale banner..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAiCommand()}
                disabled={isAiExecuting || !aiPrompt.trim()}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white shadow-lg flex items-center gap-2 disabled:opacity-40"
              >
                {isAiExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Apply with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
