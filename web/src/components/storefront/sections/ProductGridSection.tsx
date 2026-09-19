"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Tag, Sparkles } from "lucide-react";
import { StoreSection, StoreTheme, normalizeStoreProduct } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { toast } from "sonner";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  products: any[];
  currency?: string;
}

export function ProductGridSection({ 
  section, 
  theme, 
  storeSlug, 
  products = [], 
  currency = "SLE" 
}: Props) {
  const content = section.content || {};
  const settings = section.settings || {};
  const { addItem } = useStoreCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const title = content.title || "Featured Catalog";
  const subtitle = content.subtitle || "Explore our top picks, popular essentials, and trending drops";
  const limit = settings.limit || 16;

  // Normalize all incoming products
  const normalizedProducts = (products || []).map(normalizeStoreProduct);

  // Extract unique categories
  const categories = [
    "ALL", 
    ...Array.from(new Set(normalizedProducts.map(p => p.category).filter(Boolean)))
  ];

  // Filter products by selected category
  const filtered = normalizedProducts
    .filter(item => {
      if (selectedCategory === "ALL") return true;
      return item.category.toLowerCase() === selectedCategory.toLowerCase();
    })
    .slice(0, limit);

  const handleAddToCart = (prod: ReturnType<typeof normalizeStoreProduct>) => {
    if (!prod.inStock) {
      toast.error("Item is currently out of stock");
      return;
    }

    addItem({
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      imageUrl: prod.imageUrl || undefined,
      maxStock: prod.stockQuantity || 99,
      sku: prod.sku || undefined,
    });
    toast.success(`Added "${prod.name}" to cart!`);
  };

  return (
    <section id="products" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2.5">
        <h2 
          className="text-2xl sm:text-4xl font-black tracking-tight" 
          style={{ color: theme.colors.text }}
        >
          {title}
        </h2>
        <p 
          className="text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto" 
          style={{ color: theme.colors.mutedText }}
        >
          {subtitle}
        </p>

        {/* Mobile Swipeable Category Pills */}
        {categories.length > 2 && (
          <div className="pt-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 shadow-sm"
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

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Catalog is being curated</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {selectedCategory !== "ALL" 
              ? `No items found in category "${selectedCategory}".` 
              : "Check back shortly or contact our team directly."}
          </p>
          {selectedCategory !== "ALL" && (
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Show All Products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filtered.map(prod => {
            const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
            const discountPct = hasDiscount 
              ? Math.round(((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100) 
              : null;

            return (
              <div
                key={prod.id}
                className="group relative rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900/90"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                {/* Product Thumbnail Container */}
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <ShoppingBag className="w-10 sm:w-12 h-10 sm:h-12 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {prod.customBadge && (
                      <div 
                        className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                        style={{ backgroundColor: theme.colors.accent }}
                      >
                        {prod.customBadge}
                      </div>
                    )}
                    {discountPct && (
                      <div className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                        {discountPct}% OFF
                      </div>
                    )}
                  </div>

                  {/* Out of Stock Overlay */}
                  {!prod.inStock && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center z-20">
                      <span className="px-2.5 sm:px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info & Quick Buy */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 block truncate">
                      {prod.category}
                    </span>
                    <Link href={`/store/${storeSlug}/product/${prod.id}`}>
                      <h3 
                        className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug hover:underline" 
                        style={{ color: theme.colors.text }}
                      >
                        {prod.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Price Row & Cart Trigger */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through block leading-none mb-0.5 font-semibold">
                          {currency} {prod.originalPrice!.toLocaleString()}
                        </span>
                      )}
                      <span 
                        className="font-black text-sm sm:text-base tracking-tight truncate block" 
                        style={{ color: theme.colors.primary }}
                      >
                        {currency} {prod.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      disabled={!prod.inStock}
                      title="Add to Cart"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
