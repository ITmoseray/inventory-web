"use client";

import React from "react";
import Link from "next/link";
import { Home, LayoutGrid, MessageCircle, ShoppingBag } from "lucide-react";
import { StoreTheme, normalizeStoreTheme } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";

interface Props {
  storeSlug: string;
  whatsappNumber?: string | null;
  theme?: any;
}

export function StoreMobileBottomNav({ storeSlug, whatsappNumber, theme: rawTheme }: Props) {
  const theme = normalizeStoreTheme(rawTheme);
  const c = theme.colors;
  const { getTotalItems, setIsCartOpen } = useStoreCart();
  const totalItems = getTotalItems();

  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean
    ? `https://wa.me/${waClean}?text=${encodeURIComponent("Hello! I am browsing your online store and would like to place an order.")}`
    : null;

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg shadow-2xl transition-all pb-[env(safe-area-inset-bottom)]"
      style={{
        backgroundColor: c.background ? `${c.background}F5` : "rgba(255, 255, 255, 0.95)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="grid grid-cols-4 items-center h-14 max-w-lg mx-auto px-2">
        {/* Home */}
        <Link
          href={`/store/${storeSlug}`}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
          style={{ color: c.mutedText }}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* Catalog */}
        <Link
          href={`/store/${storeSlug}#products`}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
          style={{ color: c.mutedText }}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Catalog</span>
        </Link>

        {/* WhatsApp Chat / Order */}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-emerald-600 dark:text-emerald-400 transition-colors active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </a>
        ) : (
          <Link
            href={`/store/${storeSlug}#contact`}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
            style={{ color: c.mutedText }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Contact</span>
          </Link>
        )}

        {/* Shopping Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 relative transition-colors active:scale-95 cursor-pointer"
          style={{ color: totalItems > 0 ? c.primary : c.mutedText }}
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span 
                className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: c.primary }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>
      </div>
    </div>
  );
}
