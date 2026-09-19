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
  const badge = content.badge || "LIMITED TIME SPECIAL";
  const title = content.title || "Special Promotion This Week";
  const description = content.description || "Enjoy fast doorstep delivery, guaranteed authentic quality, and exclusive bundled rates.";
  const ctaText = content.ctaText || "Explore Catalog";
  const ctaUrl = content.ctaUrl || content.ctaLink || `/store/${storeSlug}#products`;
  const bgImage = content.bgImage || content.imageUrl;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div 
        className="rounded-3xl p-6 sm:p-12 lg:p-14 text-center text-white relative overflow-hidden shadow-2xl"
        style={{
          background: bgImage 
            ? `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%), url('${bgImage}') center/cover`
            : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary || theme.colors.accent} 100%)`
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300" /> {badge}
            </span>
          )}

          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            {title}
          </h3>

          <p className="text-xs sm:text-base text-white/90 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-sm">
            {description}
          </p>

          <div className="pt-3">
            <Link
              href={ctaUrl}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-white text-slate-900 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              {ctaText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
