"use client";

import React, { useState } from "react";
import { 
  X, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sparkles, 
  Check, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Tag
} from "lucide-react";
import { StoreTemplateDTO, StoreSection } from "@/types/store-builder";
import { StoreThemeWrapper } from "@/components/storefront/StoreThemeWrapper";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";

interface Props {
  template: StoreTemplateDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: StoreTemplateDTO) => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

// Generates high quality mock products corresponding to template category
function getMockProductsForTemplate(category: string, count: number = 8) {
  const c = category.toLowerCase();
  
  if (c.includes("fashion") || c.includes("apparel")) {
    return [
      { id: "mp-1", name: "Structured Tailored Blazer", price: 680, salePrice: 550, category: "Apparel", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "HOT" },
      { id: "mp-2", name: "Minimalist Linen Overshirt", price: 340, salePrice: null, category: "Tops", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80", isFeatured: true },
      { id: "mp-3", name: "Pleated Wide-Leg Trousers", price: 420, salePrice: 380, category: "Bottoms", imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-4", name: "Bespoke Silk Midi Dress", price: 890, salePrice: null, category: "Dresses", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "NEW" },
      { id: "mp-5", name: "Premium Leather Crossbody Bag", price: 560, salePrice: null, category: "Bags", imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-6", name: "Chunky Sole Urban Loafers", price: 520, salePrice: 460, category: "Footwear", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80", isFeatured: false },
    ];
  }

  if (c.includes("tech") || c.includes("electronic")) {
    return [
      { id: "mp-1", name: "Pro Studio Wireless ANC Headphones", price: 1850, salePrice: 1590, category: "Audio", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "BESTSELLER" },
      { id: "mp-2", name: "Ultra-Slim 4K OLED Smart TV 55\"", price: 7400, salePrice: 6800, category: "Home Tech", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80", isFeatured: true },
      { id: "mp-3", name: "Flagship 5G Smartphone 256GB", price: 8900, salePrice: null, category: "Phones", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "NEW" },
      { id: "mp-4", name: "Titanium Smartwatch Pro Active", price: 1200, salePrice: 990, category: "Wearables", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-5", name: "M2 Ultra Fast USB-C SSD 2TB", price: 1450, salePrice: null, category: "Accessories", imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-6", name: "Wireless Fast Charging Stand 3-in-1", price: 380, salePrice: 320, category: "Chargers", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80", isFeatured: false },
    ];
  }

  if (c.includes("grocery") || c.includes("supermarket")) {
    return [
      { id: "mp-1", name: "Fresh Harvest Farm Orange Crate (5kg)", price: 120, salePrice: 95, category: "Fruits", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "ORGANIC" },
      { id: "mp-2", name: "Premium Fragrant Jasmine Rice (25kg)", price: 480, salePrice: null, category: "Grains", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80", isFeatured: true },
      { id: "mp-3", name: "Pure Cold Pressed Groundnut Oil (5L)", price: 290, salePrice: 260, category: "Oils", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-4", name: "Fresh Farm Grade-A Eggs (Crate of 30)", price: 95, salePrice: null, category: "Dairy", imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80", isFeatured: true },
      { id: "mp-5", name: "Local Organic Garden Vegetables Basket", price: 80, salePrice: 65, category: "Veggies", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80", isFeatured: false },
      { id: "mp-6", name: "Pure Sierra Honey Jar (500g)", price: 110, salePrice: null, category: "Pantry", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80", isFeatured: false },
    ];
  }

  // Default general high quality mock products
  return [
    { id: "mp-1", name: "Signature Collection Item 01", price: 450, salePrice: 380, category: "Featured", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "BEST VALUE" },
    { id: "mp-2", name: "Signature Collection Item 02", price: 620, salePrice: null, category: "Curated", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", isFeatured: true },
    { id: "mp-3", name: "Signature Collection Item 03", price: 290, salePrice: 240, category: "Essentials", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80", isFeatured: false },
    { id: "mp-4", name: "Signature Collection Item 04", price: 850, salePrice: 790, category: "Premium", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80", isFeatured: true, customBadge: "NEW" },
    { id: "mp-5", name: "Signature Collection Item 05", price: 190, salePrice: null, category: "Standard", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80", isFeatured: false },
    { id: "mp-6", name: "Signature Collection Item 06", price: 340, salePrice: null, category: "Bestseller", imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80", isFeatured: false },
  ];
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: Props) {
  const [device, setDevice] = useState<DeviceMode>("desktop");

  if (!isOpen || !template) return null;

  const mockProducts = getMockProductsForTemplate(template.category);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 text-white z-10 flex-shrink-0">
        {/* Template Info */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: template.themeConfig.colors.primary }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">{template.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {template.category}
              </span>
              <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                {template.style} style
              </span>
            </div>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              device === "desktop"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (1280px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              device === "tablet"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              device === "mobile"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUseTemplate(template)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: template.themeConfig.colors.primary }}
          >
            <Zap className="w-3.5 h-3.5" />
            Use This Template
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center bg-slate-950/60">
        <div
          className={`transition-all duration-300 shadow-2xl overflow-hidden ${
            device === "desktop"
              ? "w-full max-w-6xl rounded-2xl border border-slate-800"
              : device === "tablet"
              ? "w-[768px] rounded-3xl border-8 border-slate-800 ring-2 ring-slate-700"
              : "w-[390px] rounded-[40px] border-[10px] border-slate-800 ring-4 ring-slate-750"
          }`}
        >
          {/* Simulated Browser Bar for Device Preview */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="truncate px-3 py-0.5 rounded bg-slate-800/80 max-w-xs text-slate-300">
              https://protech.store/{template.slug}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
              <Eye className="w-3 h-3" />
              LIVE PREVIEW
            </div>
          </div>

          {/* Actual Live Store Rendering */}
          <StoreThemeWrapper theme={template.themeConfig}>
            {/* Header */}
            <StoreHeader
              storeName={template.name}
              storeSlug={template.slug}
              whatsappNumber="+23279000000"
              theme={template.themeConfig}
              navigation={template.navigation || undefined}
            />

            {/* Sections */}
            <div className="w-full">
              {(template.sections as StoreSection[]).map((sec) => (
                <SectionRenderer
                  key={sec.id}
                  section={sec}
                  theme={template.themeConfig}
                  storeSlug={template.slug}
                  storeName={template.name}
                  products={mockProducts}
                  navigation={template.navigation || undefined}
                  whatsappNumber="+23279000000"
                  currency="SLE"
                />
              ))}
            </div>
          </StoreThemeWrapper>
        </div>
      </div>
    </div>
  );
}
