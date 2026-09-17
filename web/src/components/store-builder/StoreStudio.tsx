"use client";

import React, { useState, useRef } from "react";
import { 
  Laptop, Tablet, Smartphone, Sparkles, Save, Globe, Eye, EyeOff, 
  Trash2, ChevronUp, ChevronDown, Plus, Wand2, X, Check, ArrowRight,
  Palette, Layout, Settings, RefreshCw, ShoppingBag, Layers, ExternalLink,
  RotateCcw, RotateCw, Upload, Image as ImageIcon, FileText, Menu, Phone,
  Tag, Sliders, CheckCircle2
} from "lucide-react";
import { 
  StoreSection, 
  StoreTheme, 
  StoreSectionType, 
  normalizeStoreTheme 
} from "@/types/store-builder";
import { 
  updateStoreConfig, 
  updateStorePageSections, 
  toggleStorePublish, 
  modifyStoreWithAIAction 
} from "@/lib/actions/store-builder";
import { uploadProductImage } from "@/lib/actions/upload";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  initialStore: any;
  availableProducts?: any[];
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

const ARCHETYPE_PALETTES = [
  { id: "fashion", name: "Fashion & Apparel", primary: "#1E1E24", accent: "#C68B59", bg: "#FAF9F6", surface: "#FFFFFF", font: "Playfair Display", radius: "lg" },
  { id: "electronics", name: "Tech & Gadgets", primary: "#0284C7", accent: "#38BDF8", bg: "#0F172A", surface: "#1E293B", font: "Inter", radius: "lg" },
  { id: "grocery", name: "Fresh Market", primary: "#15803D", accent: "#F59E0B", bg: "#F8FAF8", surface: "#FFFFFF", font: "Inter", radius: "sm" },
  { id: "restaurant", name: "Restaurant & Cafe", primary: "#EA580C", accent: "#F97316", bg: "#FFFBEB", surface: "#FFFFFF", font: "Plus Jakarta Sans", radius: "lg" },
  { id: "beauty", name: "Cosmetics & Glam", primary: "#DB2777", accent: "#F472B6", bg: "#FDF2F8", surface: "#FFFFFF", font: "Playfair Display", radius: "full" },
  { id: "pharmacy", name: "Health & Pharmacy", primary: "#0D9488", accent: "#14B8A6", bg: "#F0FDFA", surface: "#FFFFFF", font: "Inter", radius: "sm" },
  { id: "luxury", name: "Luxury & Prestige", primary: "#0F172A", accent: "#D97706", bg: "#020617", surface: "#0F172A", font: "Cinzel", radius: "none" },
  { id: "african-contemporary", name: "African Vibrant", primary: "#B45309", accent: "#047857", bg: "#FFFDF7", surface: "#FFFFFF", font: "Plus Jakarta Sans", radius: "lg" },
  { id: "minimal", name: "Modern Minimalist", primary: "#18181B", accent: "#71717A", bg: "#FFFFFF", surface: "#F4F4F5", font: "Inter", radius: "none" }
];

export function StoreStudio({ initialStore, availableProducts = [] }: Props) {
  const [store, setStore] = useState(initialStore);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeLeftTab, setActiveLeftTab] = useState<"pages" | "sections" | "products" | "theme" | "navigation">("sections");

  const homePage = store.pages?.find((p: any) => p.slug === "home" || p.isHome) || store.pages?.[0];
  const [sections, setSections] = useState<StoreSection[]>((homePage?.sections as unknown as StoreSection[]) || []);
  const [theme, setTheme] = useState<StoreTheme>(normalizeStoreTheme(store.themeConfig));
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || "");

  // Undo / Redo history state
  const [history, setHistory] = useState<{ sections: StoreSection[]; theme: StoreTheme }[]>([
    { sections: (homePage?.sections as unknown as StoreSection[]) || [], theme: normalizeStoreTheme(store.themeConfig) }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [dockPrompt, setDockPrompt] = useState("");
  const [isAiExecuting, setIsAiExecuting] = useState(false);
  const [uploadingImageField, setUploadingImageField] = useState<string | null>(null);

  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const featureImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Helper: push new state to Undo / Redo history
  const pushState = (newSections: StoreSection[], newTheme: StoreTheme) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push({
      sections: JSON.parse(JSON.stringify(newSections)),
      theme: JSON.parse(JSON.stringify(newTheme))
    });
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setSections(target.sections);
      setTheme(target.theme);
      setHistoryIndex(historyIndex - 1);
      toast.info("Undo: Reverted to previous step");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setSections(target.sections);
      setTheme(target.theme);
      setHistoryIndex(historyIndex + 1);
      toast.info("Redo: Restored step");
    }
  };

  // Reordering sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    pushState(reordered, theme);
  };

  const toggleSectionVisibility = (id: string) => {
    const updated = sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s);
    setSections(updated);
    pushState(updated, theme);
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
    pushState(updated, theme);
    toast.success("Section removed");
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
    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionId(newSection.id);
    setIsAddModalOpen(false);
    pushState(updated, theme);
    toast.success(`Added "${template.name}" section!`);
  };

  // Section content updater
  const updateSelectedContent = (key: string, value: any) => {
    if (!selectedSectionId) return;
    const updated = sections.map((s) => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          [key]: value
        }
      };
    });
    setSections(updated);
  };

  // Commit changes to history stack on blur / completion
  const commitContentEdit = () => {
    pushState(sections, theme);
  };

  // Theme updater
  const updateThemeColor = (key: string, color: string) => {
    const updatedTheme: StoreTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [key]: color
      }
    };
    setTheme(updatedTheme);
    pushState(sections, updatedTheme);
  };

  const applyArchetype = (arc: typeof ARCHETYPE_PALETTES[0]) => {
    const updatedTheme: StoreTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        primary: arc.primary,
        accent: arc.accent,
        background: arc.bg,
        surface: arc.surface,
        text: arc.bg.startsWith("#0") || arc.bg.startsWith("#1") ? "#F8FAFC" : "#0F172A",
        headerBg: arc.bg,
        footerBg: arc.bg.startsWith("#0") || arc.bg.startsWith("#1") ? "#020617" : "#0F172A"
      },
      fonts: {
        ...theme.fonts,
        heading: arc.font
      },
      borderRadius: arc.radius as any
    };
    setTheme(updatedTheme);
    pushState(sections, updatedTheme);
    toast.success(`Applied ${arc.name} aesthetic!`);
  };

  // Image Upload handler (Cloudinary via uploadProductImage server action)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "bgImage" | "image" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageField(targetField);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadedUrl = await uploadProductImage(formData);

      if (targetField === "logo") {
        setStore((prev: any) => ({ ...prev, logoUrl: uploadedUrl }));
        await updateStoreConfig({ logoUrl: uploadedUrl });
        toast.success("Store logo uploaded!");
      } else {
        updateSelectedContent(targetField, uploadedUrl);
        commitContentEdit();
        toast.success("Section image updated from Cloudinary!");
      }
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImageField(null);
    }
  };

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStoreConfig({
        themeConfig: theme
      });
      await updateStorePageSections("home", sections);
      toast.success("All store changes saved successfully!");
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

  // AI Assistant command (from Dock or Modal)
  const handleAiCommand = async (commandToRun?: string) => {
    const prompt = commandToRun || dockPrompt;
    if (!prompt.trim()) return;

    setIsAiExecuting(true);
    try {
      const res = await modifyStoreWithAIAction(prompt);
      if (res.success) {
        let nextTheme = theme;
        let nextSections = sections;
        if (res.updatedTheme) {
          nextTheme = normalizeStoreTheme(res.updatedTheme);
          setTheme(nextTheme);
        }
        if (res.updatedSections) {
          nextSections = res.updatedSections as StoreSection[];
          setSections(nextSections);
        }
        pushState(nextSections, nextTheme);
        toast.success(res.explanation || "Store updated with AI!");
        setDockPrompt("");
        setIsAiModalOpen(false);
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
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-3 sm:-m-6 md:-m-8 bg-slate-950 text-white overflow-hidden select-none">
      {/* ── TOP STUDIO TOOLBAR ─────────────────────────────── */}
      <div className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 shrink-0 z-30">
        {/* Left: Store identity & breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-indigo-500/40 relative shrink-0 shadow-xs">
                <img src="/images/ai-store-icon.png" alt="ProTech AI Store" className="w-full h-full object-cover" />
              </div>
              <span>{store.name}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI Studio
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Undo / Redo controls */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-25 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-25 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <span>/store/{store.slug}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Center: Device Responsive Frame Switchers */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === "desktop" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (100%)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === "tablet" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === "mobile" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Modal Trigger */}
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
        {/* ── COLUMN 1: LEFT MULTI-TAB PANEL ───────────────── */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
          {/* 5-Tab Navigation Bar */}
          <div className="grid grid-cols-5 p-1 bg-slate-950 border-b border-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setActiveLeftTab("pages")}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeLeftTab === "pages" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Pages"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pages</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("sections")}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeLeftTab === "sections" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Sections"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("products")}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeLeftTab === "products" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Products"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("theme")}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeLeftTab === "theme" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Theme"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("navigation")}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeLeftTab === "navigation" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Nav & Info"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Nav</span>
            </button>
          </div>

          {/* TAB 1: PAGES */}
          {activeLeftTab === "pages" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Storefront Pages
              </span>
              <div className="space-y-1.5">
                {[
                  { name: "Homepage", slug: "home", desc: "Main landing & hero catalog", count: sections.length, isCurrent: true },
                  { name: "Product Details", slug: "product-page", desc: "Interactive gallery & cart", count: 1, isCurrent: false },
                  { name: "Checkout & WhatsApp", slug: "checkout", desc: "Seamless cart submission", count: 1, isCurrent: false }
                ].map((p) => (
                  <div
                    key={p.slug}
                    className={`p-3 rounded-xl border transition-all ${
                      p.isCurrent
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{p.name}</span>
                      {p.isCurrent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                          Active Canvas
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{p.count} components</span>
                      <span>Slug: /{p.slug}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS (Original elevated) */}
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
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-bold"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-950"
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
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                          disabled={idx === sections.length - 1}
                          className="p-1 hover:bg-slate-800 rounded disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.id); }}
                          className="p-1 hover:bg-slate-800 rounded"
                          title={sec.visible ? "Hide section" : "Show section"}
                        >
                          {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                          className="p-1 hover:bg-rose-900/60 text-rose-400 rounded"
                          title="Delete section"
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
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 text-indigo-400"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section (16 available)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeLeftTab === "products" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Connected Inventory
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Active products connected from ProTech Enterprise OS inventory.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-white">{availableProducts.length}</span>
                  <span className="text-xs text-slate-400 block">Total Items in Catalog</span>
                </div>
                <Link
                  href="/dashboard/store-builder"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1"
                >
                  Curate <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Storefront Spotlight
                </span>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {availableProducts.slice(0, 10).map((p: any) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name?.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-200 block truncate">{p.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {store.currency || "SLE"} {p.unitPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THEME & AESTHETIC ARCHETYPES */}
          {activeLeftTab === "theme" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {/* Archetype Quick Switcher */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Style Archetypes (1-Click)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ARCHETYPE_PALETTES.map((arc) => (
                    <button
                      key={arc.id}
                      onClick={() => applyArchetype(arc)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: arc.primary }} />
                        <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: arc.accent }} />
                      </div>
                      <span className="font-bold text-[11px] text-slate-300 group-hover:text-white block truncate">
                        {arc.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customizer */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Custom Palette</span>
                {[
                  { label: "Primary Brand", key: "primary", val: theme.colors.primary },
                  { label: "Accent / Badges", key: "accent", val: theme.colors.accent },
                  { label: "Background", key: "background", val: theme.colors.background },
                  { label: "Surface Cards", key: "surface", val: theme.colors.surface },
                  { label: "Text Color", key: "text", val: theme.colors.text },
                  { label: "Header Nav", key: "headerBg", val: theme.colors.headerBg },
                  { label: "Footer BG", key: "footerBg", val: theme.colors.footerBg },
                ].map((c) => (
                  <div key={c.key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950 border border-slate-800">
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

              {/* Typography & Corners */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Typography & Shapes</span>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Heading Font Family</label>
                  <select
                    value={theme.fonts?.heading || "Inter"}
                    onChange={(e) => {
                      const updated = { ...theme, fonts: { ...theme.fonts, heading: e.target.value } };
                      setTheme(updated);
                      pushState(sections, updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Vibrant African)</option>
                    <option value="Cinzel">Cinzel (High Prestige)</option>
                    <option value="Outfit">Outfit (Tech / Contemporary)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Corner Rounding</label>
                  <select
                    value={theme.borderRadius || "lg"}
                    onChange={(e) => {
                      const updated = { ...theme, borderRadius: e.target.value as any };
                      setTheme(updated);
                      pushState(sections, updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="none">Square (Sharp / Editorial)</option>
                    <option value="sm">Soft (Refined)</option>
                    <option value="lg">Large (Modern Rounded)</option>
                    <option value="full">Pill (Fashion / Beauty)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NAVIGATION & BRAND INFO */}
          {activeLeftTab === "navigation" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Brand & Logo</span>
                
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Store Display Name</label>
                  <input
                    type="text"
                    value={store.name}
                    onChange={(e) => setStore({ ...store, name: e.target.value })}
                    onBlur={() => updateStoreConfig({ name: store.name })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Store Logo</label>
                  <div className="flex items-center gap-2">
                    {store.logoUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
                        <img src={store.logoUrl} alt="Store logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingImageField === "logo"}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      {uploadingImageField === "logo" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload Logo</span>
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, "logo")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">WhatsApp Checkout</span>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Direct Order WhatsApp #</label>
                  <input
                    type="text"
                    placeholder="+232 76 000000"
                    value={store.whatsappPhone || ""}
                    onChange={(e) => setStore({ ...store, whatsappPhone: e.target.value })}
                    onBlur={() => updateStoreConfig({ whatsappPhone: store.whatsappPhone })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Customers can complete their orders via WhatsApp with item details and customer notes automatically prepared.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Currency Display</span>
                <input
                  type="text"
                  value={store.currency || "SLE"}
                  onChange={(e) => setStore({ ...store, currency: e.target.value })}
                  onBlur={() => updateStoreConfig({ currency: store.currency })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMN 2: CENTER LIVE PREVIEW CANVAS ─────────── */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 rounded-2xl overflow-y-auto shadow-2xl bg-white text-slate-900 flex flex-col relative ${
              device === "desktop"
                ? "w-full"
                : device === "tablet"
                ? "w-[768px] border-8 border-slate-800 rounded-[2.5rem]"
                : "w-[375px] border-8 border-slate-800 rounded-[3rem]"
            }`}
          >
            {/* Tablet / Mobile Device Bezel Bar */}
            {device !== "desktop" && (
              <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
              </div>
            )}

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
                    className={`cursor-pointer transition-all relative group/sec ${
                      sec.id === selectedSectionId ? "ring-2 ring-indigo-500" : "hover:ring-1 hover:ring-indigo-300"
                    }`}
                  >
                    <SectionRenderer
                      section={sec}
                      theme={theme}
                      storeSlug={store.slug}
                      storeName={store.name}
                      products={availableProducts || []}
                      navigation={store.navigation}
                      whatsappNumber={store.whatsappPhone}
                      currency={store.currency || "SLE"}
                    />
                  </div>
                ))}
              </main>
            </StoreThemeWrapper>
          </div>

          {/* ── DOCKED AI CO-PILOT BAR (ATLAS-STYLE) ───────────── */}
          <div className="absolute bottom-6 inset-x-0 mx-auto max-w-2xl px-4 z-30 pointer-events-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-2.5 shadow-2xl shadow-black/80 space-y-2">
              {/* Quick AI Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { label: "✨ Make more luxury", cmd: "Make the store more luxury with elegant fonts and premium aesthetic" },
                  { label: "🎨 Blue & White", cmd: "Change the colors to blue and white" },
                  { label: "🏷️ 20% Sale Banner", cmd: "Add a 20% off flash sale banner" },
                  { label: "📱 Mobile Polish", cmd: "Optimize the layout for mobile and add direct WhatsApp ordering" },
                  { label: "⚡ New Arrivals", cmd: "Add a new arrivals section" },
                  { label: "🌙 Ramadan Promo", cmd: "Add a festive Ramadan promotion banner" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleAiCommand(chip.cmd)}
                    disabled={isAiExecuting}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Natural language prompt input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiCommand();
                }}
                className="flex items-center gap-2 bg-slate-950/80 rounded-xl px-3 py-1.5 border border-slate-800 focus-within:border-indigo-500 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                <input
                  type="text"
                  placeholder="Ask AI to change anything (e.g. 'Make the hero bigger', 'Rewrite headline to sound premium')..."
                  value={dockPrompt}
                  onChange={(e) => setDockPrompt(e.target.value)}
                  disabled={isAiExecuting}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isAiExecuting || !dockPrompt.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isAiExecuting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: RIGHT INSPECTOR (PROPERTIES) ───────── */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto z-20">
          {selectedSection ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    Section Inspector
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
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
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
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
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
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
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
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
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
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
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedSection.content.primaryButtonUrl !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Button Link URL</label>
                  <input
                    type="text"
                    value={selectedSection.content.primaryButtonUrl || ""}
                    onChange={(e) => updateSelectedContent("primaryButtonUrl", e.target.value)}
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Background Image with Cloudinary uploader */}
              {selectedSection.content.bgImage !== undefined && (
                <div className="space-y-2">
                  <label className="text-slate-400 font-bold block">Background Image</label>
                  <input
                    type="text"
                    value={selectedSection.content.bgImage || ""}
                    onChange={(e) => updateSelectedContent("bgImage", e.target.value)}
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none text-[11px] font-mono"
                    placeholder="https://..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bgImageInputRef.current?.click()}
                      disabled={uploadingImageField === "bgImage"}
                      className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      {uploadingImageField === "bgImage" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload to Cloudinary</span>
                    </button>
                    <input
                      ref={bgImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, "bgImage")}
                    />
                  </div>
                </div>
              )}

              {/* Feature Image with Cloudinary uploader */}
              {selectedSection.content.image !== undefined && (
                <div className="space-y-2">
                  <label className="text-slate-400 font-bold block">Feature Image</label>
                  <input
                    type="text"
                    value={selectedSection.content.image || ""}
                    onChange={(e) => updateSelectedContent("image", e.target.value)}
                    onBlur={commitContentEdit}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none text-[11px] font-mono"
                    placeholder="https://..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => featureImageInputRef.current?.click()}
                      disabled={uploadingImageField === "image"}
                      className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      {uploadingImageField === "image" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload to Cloudinary</span>
                    </button>
                    <input
                      ref={featureImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, "image")}
                    />
                  </div>
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
              <p className="text-xs">Click on any section in the center canvas to inspect and edit its properties.</p>
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

      {/* ── AI ASSISTANT EXPANDED MODAL ────────────────────── */}
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
                  "Move featured products above categories"
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
                value={dockPrompt}
                onChange={(e) => setDockPrompt(e.target.value)}
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
                disabled={isAiExecuting || !dockPrompt.trim()}
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
