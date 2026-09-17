"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { toast } from "sonner";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  products: any[];
  currency?: string;
}

export function ProductCarouselSection({ section, theme, storeSlug, products = [], currency = "SLE" }: Props) {
  const content = section.content || {};
  const { addItem } = useStoreCart();

  if (products.length === 0) return null;

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.colors.text }}>
            {content.title || "Trending & Recommended"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">Handpicked items popular this week</p>
        </div>
        <Link 
          href={`/store/${storeSlug}#products`}
          className="text-xs font-bold flex items-center gap-1 hover:underline"
          style={{ color: theme.colors.primary }}
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto pb-4 no-scrollbar">
        {products.slice(0, 8).map(item => {
          const p = item.product;
          const price = item.customPrice ? Number(item.customPrice) : Number(p.unitPrice);

          return (
            <div
              key={item.id}
              className="min-w-[200px] sm:min-w-[240px] max-w-[240px] rounded-2xl border p-3 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden mb-3">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs line-clamp-1" style={{ color: theme.colors.text }}>
                  {p.name}
                </h4>
                <span className="font-black text-sm block" style={{ color: theme.colors.primary }}>
                  {currency} {price.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  addItem({
                    id: p.id,
                    productId: p.id,
                    name: p.name,
                    price: price,
                    imageUrl: p.imageUrl,
                    maxStock: Number(p.stockQuantity) || 10,
                  });
                  toast.success(`Added "${p.name}" to cart!`);
                }}
                className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-3 h-3" /> Add
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
