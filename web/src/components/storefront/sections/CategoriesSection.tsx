"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, ArrowRight, Sparkles } from "lucide-react";
import { StoreSection, StoreTheme, normalizeStoreProduct } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  products?: any[];
}

export function CategoriesSection({ section, theme, storeSlug, products = [] }: Props) {
  const content = section.content || {};
  const title = content.title || "Curated Collections";
  const subtitle = content.subtitle || "Explore products grouped for your lifestyle";

  // Check if explicit categories with imagery are provided (e.g. from starter templates)
  const templateCategories: Array<{ name: string; count?: string; image?: string; imageUrl?: string }> = 
    content.categories || [];

  if (templateCategories.length > 0) {
    return (
      <section id="categories" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
            {title}
          </h2>
          <p className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.mutedText }}>
            {subtitle}
          </p>
        </div>

        {/* Editorial Visual Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {templateCategories.map((cat, idx) => {
            const img = cat.image || cat.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80";

            return (
              <Link
                key={idx}
                href={`/store/${storeSlug}#products`}
                className="group relative aspect-[4/3] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md transition-all hover:shadow-2xl flex flex-col justify-end p-4 sm:p-5"
              >
                {/* Background Image */}
                <img
                  src={img}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity group-hover:opacity-90" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1">
                  {cat.count && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 mb-1">
                      {cat.count}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm sm:text-lg text-white leading-tight drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Fallback: aggregate categories from product list
  const normalized = (products || []).map(normalizeStoreProduct);
  const catMap = new Map<string, number>();
  normalized.forEach(p => {
    catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
  });

  const categories = Array.from(catMap.entries());
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.mutedText }}>
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map(([name, count]) => (
          <Link
            key={name}
            href={`/store/${storeSlug}#products`}
            className="p-4 sm:p-5 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-2 group"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
              style={{
                backgroundColor: theme.colors.primary + "15",
                color: theme.colors.primary,
              }}
            >
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs line-clamp-1" style={{ color: theme.colors.text }}>
                {name}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
