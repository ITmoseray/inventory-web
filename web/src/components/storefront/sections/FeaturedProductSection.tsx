"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";
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

export function FeaturedProductSection({ section, theme, storeSlug, products = [], currency = "SLE" }: Props) {
  const content = section.content || {};
  const { addItem } = useStoreCart();

  const featured = products.find(p => p.isFeatured) || products[0];
  if (!featured) return null;

  const prod = featured.product;
  const price = featured.customPrice ? Number(featured.customPrice) : Number(prod.unitPrice);

  const handleBuy = () => {
    addItem({
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      price: price,
      imageUrl: prod.imageUrl,
      maxStock: Number(prod.stockQuantity) || 10,
      sku: prod.sku,
    });
    toast.success(`Added "${prod.name}" to cart!`);
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div 
        className="rounded-[2.5rem] border p-6 sm:p-10 lg:p-14 overflow-hidden relative shadow-lg"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
            {prod.imageUrl ? (
              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-20 h-20 text-slate-300" />
            )}
            <div 
              className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: theme.colors.accent }}
            >
              SPOTLIGHT DEAL
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {prod.category?.name || "Premium Collection"}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
              {prod.name}
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {prod.description || content.description || "Indulge in exceptional craftsmanship and reliable everyday performance. Specially curated for our store."}
            </p>

            <div className="space-y-2 py-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> 100% Genuine Quality Guaranteed
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Fast Delivery Nationwide
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Flexible Cash on Delivery
              </div>
            </div>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: theme.colors.primary }}>
                {currency} {price.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuy}
                className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-4 h-4" /> Add to Order
              </button>

              <Link
                href={`/store/${storeSlug}/product/${prod.id}`}
                className="px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider border transition-all text-center"
                style={{
                  borderColor: "rgba(0,0,0,0.15)",
                  color: theme.colors.text
                }}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
