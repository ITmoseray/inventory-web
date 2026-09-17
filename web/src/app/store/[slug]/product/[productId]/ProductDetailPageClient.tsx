"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, MessageCircle, ArrowLeft, CheckCircle, 
  Truck, ShieldCheck, Plus, Minus, Share2 
} from "lucide-react";
import { StoreTheme, StoreSettings } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { toast } from "sonner";

interface Props {
  storeProduct: any;
  store: any;
  theme: StoreTheme;
  settings?: StoreSettings;
}

export function ProductDetailPageClient({ storeProduct, store, theme, settings }: Props) {
  const { addItem } = useStoreCart();
  const [quantity, setQuantity] = useState(1);

  const prod = storeProduct.product;
  const price = storeProduct.customPrice ? Number(storeProduct.customPrice) : Number(prod.unitPrice);
  const stock = Number(prod.stockQuantity) || 0;
  const inStock = stock > 0;
  const currency = store.currency || "SLE";

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Item is out of stock");
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
    }, quantity);
    toast.success(`Added ${quantity}x "${prod.name}" to cart!`);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: prod.name,
        text: `Check out ${prod.name} at ${store.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const waClean = (store.whatsappPhone || store.business?.whatsappPhone || "").replace(/[^0-9]/g, "");
  const waOrderText = `Hello ${store.name}, I would like to order ${quantity}x of "${prod.name}" (${currency} ${price.toLocaleString()}). Is this item available for delivery?`;
  const waUrl = waClean ? `https://wa.me/${waClean}?text=${encodeURIComponent(waOrderText)}` : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <Link
          href={`/store/${store.slug}#products`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Product Media Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 shadow-md flex items-center justify-center">
            {prod.imageUrl ? (
              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-24 h-24 text-slate-300" />
            )}

            {storeProduct.customBadge && (
              <div 
                className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: theme.colors.accent }}
              >
                {storeProduct.customBadge}
              </div>
            )}
          </div>
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
              {prod.category?.name || "General Merchandise"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
              {prod.name}
            </h1>
            {prod.sku && (
              <span className="text-[11px] font-mono text-slate-400 block mt-1">
                SKU: {prod.sku}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-black" style={{ color: theme.colors.primary }}>
              {currency} {price.toLocaleString()}
            </span>
            <div className="ml-auto">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {prod.description || "Authentic quality product curated directly from verified suppliers. Prepared and inspected before delivery."}
            </p>
          </div>

          {/* Quantity Controls & Action */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-black text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-4 h-4" /> Add to Order ({currency} {(price * quantity).toLocaleString()})
              </button>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Order on WhatsApp
                </a>
              )}

              <button
                onClick={handleShare}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500" /> Fast Local Doorstep Delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Quality Guarantee
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500" /> Pay with Cash on Delivery
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-500" /> Direct WhatsApp Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
