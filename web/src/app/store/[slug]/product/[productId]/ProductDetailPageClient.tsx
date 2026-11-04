"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, MessageCircle, ArrowLeft, CheckCircle, 
  Truck, ShieldCheck, Plus, Minus, Share2, Tag, ChevronRight,
  Package, RefreshCw
} from "lucide-react";
import { StoreTheme, StoreSettings, normalizeStoreProduct } from "@/types/store-builder";
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

  // Normalize product to handle both enterprise catalog and standalone store products
  const prod = normalizeStoreProduct(storeProduct);
  const images = prod.images && prod.images.length > 0 ? prod.images : prod.imageUrl ? [prod.imageUrl] : [];
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || "");

  const price = prod.price;
  const originalPrice = prod.originalPrice;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPct = hasDiscount 
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100) 
    : null;
  const savings = hasDiscount ? originalPrice! - price : 0;

  const stock = prod.stockQuantity !== null && prod.stockQuantity !== undefined ? prod.stockQuantity : 99;
  const inStock = prod.inStock;
  const currency = store.currency || "SLE";

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Item is currently out of stock");
      return;
    }
    addItem({
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      price: price,
      imageUrl: selectedImage || prod.imageUrl || undefined,
      maxStock: stock,
      sku: prod.sku || undefined,
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

  const waRaw = store.whatsappPhone || store.business?.whatsappPhone || settings?.whatsappNumber || "";
  const waClean = waRaw.replace(/[^0-9]/g, "");
  const totalPrice = price * quantity;
  const waOrderText = `Hello ${store.name}! I would like to place an order for:\n\n📦 *${prod.name}*` +
    (prod.sku ? ` (SKU: ${prod.sku})` : "") +
    `\n• Quantity: ${quantity}\n• Price: ${currency} ${price.toLocaleString()} each\n• Total: *${currency} ${totalPrice.toLocaleString()}*\n\nPlease confirm availability and delivery to my location.`;
  const waUrl = waClean ? `https://wa.me/${waClean}?text=${encodeURIComponent(waOrderText)}` : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
        <Link
          href={`/store/${store.slug}`}
          className="hover:text-slate-900 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/store/${store.slug}#products`}
          className="hover:text-slate-900 transition-colors"
        >
          {prod.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
          {prod.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Product Media Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-center">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={prod.name} 
                className="w-full h-full object-cover transition-transform duration-300" 
              />
            ) : (
              <ShoppingBag className="w-24 h-24 text-slate-300 dark:text-slate-600" />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {prod.customBadge && (
                <div 
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  {prod.customBadge}
                </div>
              )}
              {discountPct && (
                <div className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                  {discountPct}% OFF
                </div>
              )}
            </div>

            {/* Out of Stock Overlay */}
            {!inStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl">
                  Currently Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Multiple Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img 
                      ? "ring-2 ring-offset-2 border-transparent scale-105" 
                      : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    // @ts-ignore
                    "--tw-ring-color": theme.colors.primary,
                  }}
                >
                  <img src={img} alt={`${prod.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.primary }}
              >
                {prod.category}
              </span>
              {prod.isStandalone && (
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Verified Store Item
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
              {prod.name}
            </h1>
            
            {prod.sku && (
              <span className="text-xs font-mono text-slate-400 block mt-1.5">
                SKU: {prod.sku}
              </span>
            )}
          </div>

          {/* Pricing & Stock Status */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black" style={{ color: theme.colors.primary }}>
                {currency} {price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through font-semibold">
                  {currency} {originalPrice!.toLocaleString()}
                </span>
              )}
              {hasDiscount && savings > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                  Save {currency} {savings.toLocaleString()} ({discountPct}%)
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              {inStock ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {stock <= 5 ? `Hurry! Only ${stock} units remaining` : `In Stock (${stock} available)`}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Out of Stock
                </div>
              )}

              <span className="text-xs text-slate-500">
                Nationwide Delivery
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Product Overview
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {prod.description || "Authentic quality product curated directly from verified suppliers. Inspected and securely packaged before doorstep delivery."}
            </p>
          </div>

          {/* Quantity Controls & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-black text-sm min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={!inStock || quantity >= stock}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-4 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <ShoppingBag className="w-4 h-4" /> 
                Add to Cart ({currency} {totalPrice.toLocaleString()})
              </button>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> 
                  Order on WhatsApp
                </a>
              )}

              <button
                onClick={handleShare}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{settings?.deliveryEstimateDays ? `Delivery: ${settings.deliveryEstimateDays}` : "Fast local delivery"}</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Verified genuine products</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Pay on delivery or mobile money</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Direct WhatsApp customer support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
