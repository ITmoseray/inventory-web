"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
}

export function BannerSection({ section, theme, storeSlug }: Props) {
  const content = section.content || {};
  const badge = content.badge || "ANNOUNCEMENT";
  const title = content.title || "Special Promotion This Week";
  const description = content.description || "Enjoy fast delivery and exclusive bundled rates across all items.";
  const ctaText = content.ctaText || "Explore Catalog";
  const ctaUrl = content.ctaUrl || `/store/${storeSlug}#products`;

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <div 
        className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary || theme.colors.accent} 100%)`
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3 h-3" /> {badge}
            </span>
          )}
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">{title}</h3>
          <p className="text-xs sm:text-base text-white/90 font-medium">{description}</p>
          <div className="pt-2">
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-white text-slate-900 hover:bg-slate-100 transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {ctaText} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
