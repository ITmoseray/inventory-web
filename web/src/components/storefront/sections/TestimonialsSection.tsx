"use client";

import React from "react";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function TestimonialsSection({ section, theme }: Props) {
  const content = section.content || {};
  const rawReviews = content.testimonials || content.reviews || [
    { name: "Aminata S.", role: "Stylist & Fashion Model", comment: "Superb product quality and super fast delivery. The WhatsApp assistance was so helpful!", rating: 5 },
    { name: "Mohamed K.", role: "Verified Shopper", comment: "Everything was packaged properly. Cash on delivery gave me 100% confidence.", rating: 5 },
    { name: "Kadiatu T.", role: "Repeat Customer", comment: "Authentic goods at very fair prices. Delivery arrived within 24 hours. Highly recommended!", rating: 5 },
  ];

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block">
          COMMUNITY & TRUST
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Loved by Verified Customers"}
        </h2>
        <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto" style={{ color: theme.colors.mutedText }}>
          {content.subtitle || "Real ratings and experiences from our shoppers nationwide"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rawReviews.map((r: any, idx: number) => {
          const author = r.name || r.author || "Verified Buyer";
          const role = r.role || r.city || "Verified Shopper";
          const comment = r.comment || r.content || r.quote || "Outstanding service and authentic products.";
          const rating = typeof r.rating === "number" ? r.rating : 5;

          return (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm transition-all hover:shadow-lg relative overflow-hidden group"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <div className="space-y-3">
                {/* Star Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  "{comment}"
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: theme.colors.text }}>
                    {author}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {role}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
