"use client";

import React from "react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function TextSection({ section, theme }: Props) {
  const content = section.content || {};
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto text-center space-y-4">
      {content.badge && (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
          {content.badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
        {content.title || "Our Promise to You"}
      </h2>
      <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {content.body || content.description || "We bring you high standard merchandise, trusted warranties, and dedicated customer support whenever you need it."}
      </p>
    </section>
  );
}
