"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { StoreSection, StoreTheme, normalizeStoreProduct } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { toast } from "sonner";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeSlug: string;
  products: any[];
  currency?: string;
  whatsappNumber?: string;
}

export function FeaturedProductSection({ 
  section, 
  theme, 
  storeSlug, 
  products = [], 
  currency = "SLE",
  whatsappNumber 
}: Props) {
  const content = section.content || {};
  const { addItem } = useStoreCart();

  if (!products || products.length === 0) return null;

  // Normalize products and find the featured item
  const normalized = products.map(normalizeStoreProduct);
  const featured = normalized.find(p => p.isFeatured) || normalized[0];
  if (!featured) return null;

  const hasDiscount = featured.originalPrice && featured.originalPrice > featured.price;
  const discountPct = hasDiscount 
    ? Math.round(((featured.originalPrice! - featured.price) / featured.originalPrice!) * 100) 
    : null;

  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean 
    ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20order%20${encodeURIComponent(featured.name)}%20for%20${currency}%20${featured.price}` 
    : null;

  const handleBuy = () => {
    if (!featured.inStock) {
      toast.error("Item is currently out of stock");
      return;
    }

    addItem({
      id: featured.id,
      productId: featured.id,
      name: featured.name,
      price: featured.price,
      imageUrl: featured.imageUrl || undefined,
      maxStock: featured.stockQuantity || 99,
      sku: featured.sku || undefined,
    });
    toast.success(`Added "${featured.name}" to cart!`);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div 
        className="rounded-3xl sm:rounded-[2.5rem] border p-6 sm:p-10 lg:p-14 overflow-hidden relative shadow-xl"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Spotlight Image Card */}
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center group">
            {featured.imageUrl ? (
              <img 
                src={featured.imageUrl} 
                alt={featured.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <ShoppingBag className="w-16 sm:w-20 h-16 sm:h-20 text-slate-300" />
            )}

            {/* Badges */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-10">
              <div 
                className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: theme.colors.accent }}
              >
                {featured.customBadge || "SPOTLIGHT DEAL"}
              </div>
              {discountPct && (
                <div className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                  {discountPct}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Details & Purchase Controls */}
          <div className="space-y-5 sm:space-y-6">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block">
              {featured.category || "Premium Collection"}
            </span>

            <h2 
              className="text-2xl sm:text-4xl font-black tracking-tight leading-tight" 
              style={{ color: theme.colors.text }}
            >
              {featured.name}
            </h2>

            <p className="text-xs sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              {featured.description || content.description || "Indulge in exceptional craftsmanship and reliable everyday performance. Specially curated for our store."}
            </p>

            {/* Value Guarantees */}
            <div className="space-y-2.5 py-2 border-y border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 
                <span>100% Genuine Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 
                <span>Fast & Reliable Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 
                <span>Cash on Delivery & Verified Online Payments</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="pt-1 flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.primary }}>
                {currency} {featured.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                  {currency} {featured.originalPrice!.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuy}
                disabled={!featured.inStock}
                className="px-8 py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-4 h-4" /> 
                Add to Cart
              </button>

              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order on WhatsApp
                </a>
              ) : (
                <Link
                  href={`/store/${storeSlug}/product/${featured.id}`}
                  className="px-6 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider border transition-all text-center flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{
                    borderColor: "rgba(0,0,0,0.15)",
                    color: theme.colors.text
                  }}
                >
                  View Full Details <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
