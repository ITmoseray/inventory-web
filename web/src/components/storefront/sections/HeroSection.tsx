"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  whatsappNumber?: string;
}

export function HeroSection({ section, theme, storeSlug, whatsappNumber }: Props) {
  const content = section.content || {};
  const settings = section.settings || {};

  const badge = content.badge || "NEW COLLECTION 2026";
  const title = content.headline || content.title || "Discover Our Curated Collection";
  const subtitle = content.subheadline || content.subtitle || "Handpicked premium essentials and verified quality items delivered fast to your doorstep.";
  
  const primaryButtonText = content.primaryCtaText || content.primaryButtonText || "Shop Now";
  const primaryButtonUrl = content.primaryCtaLink || content.primaryButtonUrl || `/store/${storeSlug}#products`;
  
  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20shop%20from%20your%20store` : "#";
  
  const secondaryButtonText = content.secondaryCtaText || content.secondaryButtonText || (whatsappNumber ? "Order on WhatsApp" : "Browse Categories");
  const secondaryButtonUrl = whatsappNumber 
    ? waUrl 
    : (content.secondaryCtaLink || content.secondaryButtonUrl || `/store/${storeSlug}#categories`);

  const bgImage = content.imageUrl || content.bgImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80";
  const stats: Array<{ label: string; value: string }> = content.stats || [
    { label: "Verified Quality", value: "100%" },
    { label: "Doorstep Delivery", value: "Fast & Safe" },
    { label: "Customer Rating", value: "4.9 ★" },
  ];

  const isSplitLayout = settings.alignment === "left" || (stats && stats.length > 0 && settings.alignment !== "center");

  return (
    <section className="relative overflow-hidden min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
      {/* Background Media with Dark Scrim */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 100%)`,
          backdropFilter: "blur(2px)"
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {isSplitLayout ? (
          /* Split Modern Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {badge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {badge}
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
                {title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-white/90 font-medium max-w-2xl leading-relaxed drop-shadow-sm">
                {subtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href={primaryButtonUrl}
                  className="px-8 py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: "#FFFFFF",
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {primaryButtonText}
                </Link>

                {whatsappNumber ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-105 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {secondaryButtonText}
                  </a>
                ) : (
                  <Link
                    href={secondaryButtonUrl}
                    className="px-7 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95"
                  >
                    {secondaryButtonText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Trust Stats Row */}
              {stats && stats.length > 0 && (
                <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg">
                  {stats.map((st, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-lg sm:text-2xl font-black text-white block tracking-tight">
                        {st.value}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70 block">
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md group">
                <img
                  src={bgImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Micro Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg">
                  
                  Featured Collection
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                      <ShieldCheck className="w-4 h-4" /> Verified Quality
                    </div>
                    <p className="text-xs text-white/80 mt-0.5 font-medium">Ready for instant dispatch</p>
                  </div>
                  <Link
                    href={primaryButtonUrl}
                    className="p-2.5 rounded-xl bg-white text-slate-900 font-bold transition-transform hover:scale-110 active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Centered Editorial Layout */
          <div className="max-w-3xl mx-auto text-center text-white space-y-6 animate-in fade-in zoom-in-95 duration-700">
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {badge}
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {title}
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              {subtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={primaryButtonUrl}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: "#FFFFFF",
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                {primaryButtonText}
              </Link>

              {whatsappNumber ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  {secondaryButtonText}
                </a>
              ) : (
                <Link
                  href={secondaryButtonUrl}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95"
                >
                  {secondaryButtonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Stats Row in Centered Hero */}
            {stats && stats.length > 0 && (
              <div className="pt-8 flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
                {stats.map((st, i) => (
                  <div key={i} className="text-center">
                    <span className="text-xl sm:text-3xl font-black text-white block">
                      {st.value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70 block">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
