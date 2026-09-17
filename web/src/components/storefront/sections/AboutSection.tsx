"use client";

import React from "react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function AboutSection({ section, theme }: Props) {
  const content = section.content || {};
  const stats = content.stats || [
    { label: "Happy Shoppers", value: "2,000+" },
    { label: "Inspected Quality", value: "100%" },
    { label: "Doorstep Delivery", value: "Fast & Safe" },
  ];

  return (
    <section id="about" className="py-16 px-4 max-w-7xl mx-auto">
      <div 
        className="rounded-3xl border p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-sm"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
            {content.badge || "OUR JOURNEY"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
            {content.title || "Dedicated to Quality & Integrity"}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {content.description || "We started with a simple belief: every customer deserves genuine products, fair prices, and honest customer care."}
          </p>
          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/60 dark:border-slate-800">
            {stats.map((s: any, i: number) => (
              <div key={i}>
                <span className="text-lg sm:text-2xl font-black block" style={{ color: theme.colors.primary }}>
                  {s.value}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-md">
          <img 
            src={content.image || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80"} 
            alt="About" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </section>
  );
}
