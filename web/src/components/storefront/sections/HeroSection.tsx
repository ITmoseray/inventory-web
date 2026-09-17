"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  whatsappNumber?: string;
}

export function HeroSection({ section, theme, storeSlug, whatsappNumber }: Props) {
  const content = section.content || {};

  const badge = content.badge || "WELCOME";
  const title = content.title || "Discover Our Curated Collection";
  const subtitle = content.subtitle || "Premium products delivered safely to your doorstep.";
  const primaryButtonText = content.primaryButtonText || "Shop Now";
  const primaryButtonUrl = content.primaryButtonUrl || `/store/${storeSlug}#products`;
  const secondaryButtonText = content.secondaryButtonText || "Order on WhatsApp";
  const bgImage = content.bgImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20shop%20from%20your%20store` : "#";

  return (
    <section className="relative overflow-hidden min-h-[500px] md:min-h-[580px] flex items-center justify-center text-center px-4 py-16">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: theme.colors.background === "#FFFFFF" || theme.colors.background === "#FAF6F0" ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(2px)"
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-white space-y-6 animate-in fade-in zoom-in-95 duration-700">
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

          {whatsappNumber && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
