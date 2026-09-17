"use client";

import React from "react";
import { StoreSection } from "@/types/store-builder";

interface Props {
  section: StoreSection;
}

export function ImageSection({ section }: Props) {
  const content = section.content || {};
  const imageUrl = content.imageUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <div className="rounded-3xl overflow-hidden aspect-[21/9] max-h-[480px] w-full shadow-lg">
        <img src={imageUrl} alt={content.alt || "Store banner"} className="w-full h-full object-cover" />
      </div>
    </section>
  );
}
