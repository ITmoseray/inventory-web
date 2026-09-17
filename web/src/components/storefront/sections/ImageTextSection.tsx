"use client";

import React from "react";
import Link from "next/link";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function ImageTextSection({ section, theme }: Props) {
  const content = section.content || {};
  const settings = section.settings || {};
  const isReversed = settings.alignImage === "right";

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}>
        <div className="rounded-3xl overflow-hidden aspect-video md:aspect-[4/3] bg-slate-100 shadow-md">
          <img 
            src={content.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"} 
            alt="Feature" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          {content.badge && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              {content.badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
            {content.title || "Crafted for Everyday Excellence"}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {content.description || "Every item we offer is checked for quality, longevity and style. Enjoy smooth shopping and prompt delivery."}
          </p>
          {content.buttonText && (
            <div className="pt-2">
              <Link 
                href={content.buttonUrl || "#products"}
                className="inline-block px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {content.buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
