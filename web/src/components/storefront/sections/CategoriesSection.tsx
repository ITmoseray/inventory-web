"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  products: any[];
}

export function CategoriesSection({ section, theme, storeSlug, products = [] }: Props) {
  const content = section.content || {};
  const title = content.title || "Shop By Department";
  const subtitle = content.subtitle || "Quickly find whatever you need";

  const catMap = new Map<string, number>();
  products.forEach(p => {
    const name = p.product?.category?.name || "General";
    catMap.set(name, (catMap.get(name) || 0) + 1);
  });

  const categories = Array.from(catMap.entries());
  if (categories.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map(([name, count]) => (
          <Link
            key={name}
            href={`/store/${storeSlug}#products`}
            className="p-5 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-2 group"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
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
