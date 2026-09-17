"use client";

import React from "react";
import { Star } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function TestimonialsSection({ section, theme }: Props) {
  const content = section.content || {};
  const reviews = content.reviews || [
    { author: "Aminata S.", comment: "Superb product quality and super fast delivery. The WhatsApp assistance was so helpful!", city: "Freetown" },
    { author: "Mohamed K.", comment: "Everything was packaged properly. Cash on delivery gave me 100% confidence.", city: "Bo" },
    { author: "Kadiatu T.", comment: "Authentic goods at very fair prices. Highly recommended!", city: "Kenema" },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Loved by Customers"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {content.subtitle || "Real ratings and reviews from verified shoppers"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r: any, idx: number) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
              "{r.comment}"
            </p>
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs" style={{ color: theme.colors.text }}>{r.author}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{r.city}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
