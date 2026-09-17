"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
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

export function ProductGridSection({ section, theme, storeSlug, products = [], currency = "SLE" }: Props) {
  const content = section.content || {};
  const settings = section.settings || {};
  const { addItem } = useStoreCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const title = content.title || "Featured Catalog";
  const subtitle = content.subtitle || "Explore our top picks and popular essentials";
  const limit = settings.limit || 16;

  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.product?.category?.name || "General").filter(Boolean)))];

  const filtered = products
    .filter(item => {
      if (selectedCategory === "ALL") return true;
      const cat = item.product?.category?.name || "General";
      return cat === selectedCategory;
    })
    .slice(0, limit);

  const handleAddToCart = (item: any) => {
    const prod = item.product;
    const price = item.customPrice ? Number(item.customPrice) : Number(prod.unitPrice);
    const stock = Number(prod.stockQuantity) || 0;

    if (stock <= 0) {
      toast.error("Item currently out of stock");
      return;
    }

    addItem({
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      price: price,
      imageUrl: prod.imageUrl,
      maxStock: stock,
      sku: prod.sku,
    });
    toast.success(`Added "${prod.name}" to cart!`);
  };

  return (
    <section id="products" className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.colors.mutedText }}>
          {subtitle}
        </p>

        {categories.length > 2 && (
          <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200"
                style={{
                  backgroundColor: selectedCategory === cat ? theme.colors.primary : theme.colors.surface,
                  color: selectedCategory === cat ? "#FFFFFF" : theme.colors.mutedText,
                  border: `1px solid ${selectedCategory === cat ? theme.colors.primary : 'rgba(0,0,0,0.08)'}`
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Catalog is being updated</h3>
          <p className="text-xs text-slate-500 mt-1">Check back shortly or contact our team directly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map(item => {
            const p = item.product;
            const price = item.customPrice ? Number(item.customPrice) : Number(p.unitPrice);
            const badge = item.customBadge || (p.isFavorite ? "POPULAR" : null);
            const inStock = Number(p.stockQuantity) > 0;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                    </div>
                  )}

                  {badge && (
                    <div 
                      className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                      style={{ backgroundColor: theme.colors.accent }}
                    >
                      {badge}
                    </div>
                  )}

                  {!inStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      {p.category?.name || "General"}
                    </span>
                    <Link href={`/store/${storeSlug}/product/${p.id}`}>
                      <h3 className="font-bold text-sm line-clamp-2 hover:underline" style={{ color: theme.colors.text }}>
                        {p.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Price</span>
                      <span className="font-black text-base sm:text-lg" style={{ color: theme.colors.primary }}>
                        {currency} {price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!inStock}
                      title="Add to Cart"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
