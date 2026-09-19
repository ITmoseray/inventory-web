"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
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

export function ProductCarouselSection({ 
  section, 
  theme, 
  storeSlug, 
  products = [], 
  currency = "SLE" 
}: Props) {
  const content = section.content || {};
  const { addItem } = useStoreCart();

  if (!products || products.length === 0) return null;

  const normalized = products.map(normalizeStoreProduct);

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
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
            {content.title || "Trending & Recommended"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {content.subtitle || "Handpicked items popular this week"}
          </p>
        </div>
        <Link 
          href={`/store/${storeSlug}#products`}
          className="text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline"
          style={{ color: theme.colors.primary }}
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Snap Scrollable Carousel */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {normalized.slice(0, 10).map(prod => {
          const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;

          return (
            <div
              key={prod.id}
              className="min-w-[190px] sm:min-w-[240px] max-w-[240px] snap-start rounded-2xl border p-3 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900/90 shadow-sm transition-all hover:shadow-md group flex-shrink-0"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3 relative">
                {prod.imageUrl ? (
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}

                {prod.customBadge && (
                  <div 
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    {prod.customBadge}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block truncate">
                  {prod.category}
                </span>
                <Link href={`/store/${storeSlug}/product/${prod.id}`}>
                  <h4 
                    className="font-bold text-xs sm:text-sm line-clamp-1 hover:underline" 
                    style={{ color: theme.colors.text }}
                  >
                    {prod.name}
                  </h4>
                </Link>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="font-black text-sm block" style={{ color: theme.colors.primary }}>
                    {currency} {prod.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {currency} {prod.originalPrice!.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(prod)}
                disabled={!prod.inStock}
                className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> 
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
