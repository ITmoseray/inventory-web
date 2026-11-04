"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle, Menu, X, ShieldCheck } from "lucide-react";
import { StoreTheme, StoreNavigation, normalizeStoreTheme } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { useStoreViewport } from "./StoreThemeWrapper";

interface Props {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
  theme?: any;
  navigation?: StoreNavigation;
  viewport?: "desktop" | "tablet" | "mobile";
}

export function StoreHeader({
  storeName,
  storeSlug,
  logoUrl,
  whatsappNumber,
  theme: rawTheme,
  navigation,
  viewport,
}: Props) {
  const contextViewport = useStoreViewport();
  const effectiveViewport = viewport || contextViewport;
  const isForcedMobile = effectiveViewport === "mobile";
  const isForcedDesktop = effectiveViewport === "desktop";

  const theme = normalizeStoreTheme(rawTheme);
  const c = theme.colors;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useStoreCart();
  const totalItems = getTotalItems();

  const navItems = navigation?.header || [
    { id: "1", label: "Home", url: `/store/${storeSlug}` },
    { id: "2", label: "Catalog", url: `/store/${storeSlug}#products` },
    { id: "3", label: "Collections", url: `/store/${storeSlug}#categories` },
    { id: "4", label: "Contact", url: `/store/${storeSlug}#contact` },
  ];

  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20inquire%20about%20your%20products` : null;

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Announcement Bar */}
      {theme.showAnnouncementBar && (
        <div
          className="py-1.5 sm:py-2 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-bold transition-all shadow-sm leading-snug"
          style={{
            backgroundColor: theme.announcementBg || c.primary,
            color: theme.announcementTextColor || "#FFFFFF",
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="truncate">
              {theme.announcementText || "✨ Special welcome offer: Fast doorstep delivery available nationwide!"}
            </span>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div 
        className="backdrop-blur-md border-b transition-colors"
        style={{
          backgroundColor: c.headerBg ? `${c.headerBg}FA` : "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo & Brand Name */}
          <Link href={`/store/${storeSlug}`} className="flex items-center gap-2 sm:gap-3 group min-w-0 max-w-[65%] sm:max-w-none">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={storeName} 
                className={`${isForcedMobile ? "h-7 max-w-[100px]" : "h-8 sm:h-11 max-w-[120px]"} w-auto rounded-xl object-contain shadow-sm flex-shrink-0`} 
              />
            ) : (
              <div 
                className={`${isForcedMobile ? "w-8 h-8 text-[11px]" : "w-9 h-9 sm:w-11 sm:h-11 text-xs sm:text-sm"} rounded-xl flex items-center justify-center font-black text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0`}
                style={{ backgroundColor: c.primary }}
              >
                {storeName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span 
              className={`font-black tracking-tight leading-tight truncate ${isForcedMobile ? "text-xs xs:text-sm max-w-[140px]" : "text-sm sm:text-lg lg:text-xl max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md"}`} 
              style={{ color: c.text }}
            >
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {!isForcedMobile && (
            <nav className={`${isForcedDesktop ? "flex" : "hidden md:flex"} items-center gap-6 lg:gap-8`}>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="text-xs sm:text-sm font-bold tracking-wide transition-colors hover:opacity-80"
                  style={{ color: c.mutedText }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Header Action Controls */}
          <div className={`flex items-center flex-shrink-0 ${isForcedMobile ? "gap-1.5" : "gap-2 sm:gap-3"}`}>
            {waUrl && !isForcedMobile && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className={`${isForcedDesktop ? "flex" : "hidden sm:flex"} items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition-all hover:scale-105 border border-emerald-500/20`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm ${
                isForcedMobile ? "p-1.5" : "p-2 sm:p-2.5"
              }`}
              style={{
                backgroundColor: c.surface,
                borderColor: "rgba(0,0,0,0.1)",
                color: c.text,
              }}
              title="Open Shopping Cart"
            >
              <ShoppingBag className={`${isForcedMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"}`} />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow-md animate-in zoom-in-50 duration-200"
                  style={{ backgroundColor: c.primary }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            {(isForcedMobile || !isForcedDesktop) && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${isForcedMobile ? "flex p-1.5" : "md:hidden flex p-2"} rounded-xl border items-center justify-center text-slate-700 dark:text-slate-300 transition-all`}
                style={{ backgroundColor: c.surface, borderColor: "rgba(0,0,0,0.1)" }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className={`${isForcedMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                ) : (
                  <Menu className={`${isForcedMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div 
            className={`${isForcedMobile ? "block" : "md:hidden"} border-t px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl`}
            style={{ backgroundColor: c.background }}
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-sm font-bold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: c.text }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {waUrl && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" /> 
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
