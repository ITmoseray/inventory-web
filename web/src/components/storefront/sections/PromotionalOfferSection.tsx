"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  whatsappNumber?: string;
}

export function PromotionalOfferSection({ section, theme, storeSlug, whatsappNumber }: Props) {
  const content = section.content || {};
  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20claim%20the%20promotional%20offer` : "#";

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <div 
        className="rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent || '#F59E0B'} 100%)`
        }}
      >
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20">
            <Sparkles className="w-3 h-3" /> {content.badge || "SPECIAL OFFER"}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            {content.title || "Limited Time Deal: Order Online & Save!"}
          </h3>
          <p className="text-xs sm:text-sm text-white/90">
            {content.description || "Enjoy doorstep delivery and top-quality customer support."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {whatsappNumber && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
          )}
          <Link
            href={`/store/${storeSlug}#products`}
            className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-white text-slate-900 hover:bg-slate-100 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            Shop Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
