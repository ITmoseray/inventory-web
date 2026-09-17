"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle, Menu, X, Store as StoreIcon } from "lucide-react";
import { StoreTheme, StoreNavigation, normalizeStoreTheme } from "@/types/store-builder";
import { useStoreCart } from "@/lib/store-builder/cart-store";

interface Props {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
  theme?: any;
  navigation?: StoreNavigation;
}

export function StoreHeader({
  storeName,
  storeSlug,
  logoUrl,
  whatsappNumber,
  theme: rawTheme,
  navigation,
}: Props) {
  const theme = normalizeStoreTheme(rawTheme);
  const c = theme.colors;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useStoreCart();
  const totalItems = getTotalItems();

  const navItems = navigation?.header || [
    { id: "1", label: "Home", url: `/store/${storeSlug}` },
    { id: "2", label: "Products", url: `/store/${storeSlug}#products` },
    { id: "3", label: "About", url: `/store/${storeSlug}#about` },
    { id: "4", label: "Contact", url: `/store/${storeSlug}#contact` },
  ];

  const waClean = (whatsappNumber || "").replace(/[^0-9]/g, "");
  const waUrl = waClean ? `https://wa.me/${waClean}?text=Hello%2C%20I%20want%20to%20inquire%20about%20your%20products` : null;

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Announcement Bar */}
      {theme.showAnnouncementBar && (
        <div
          className="py-2 px-4 text-center text-xs font-bold transition-all shadow-sm"
          style={{
            backgroundColor: theme.announcementBg || c.primary,
            color: theme.announcementTextColor || "#FFFFFF",
          }}
        >
          {theme.announcementText || "Welcome to our store! Fast delivery available nationwide."}
        </div>
      )}

      {/* Main Navbar */}
      <div 
        className="backdrop-blur-md border-b transition-colors"
        style={{
          backgroundColor: c.headerBg ? `${c.headerBg}F5` : "rgba(255, 255, 255, 0.95)",
          borderColor: "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <Link href={`/store/${storeSlug}`} className="flex items-center gap-3 group">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-9 sm:h-11 w-auto rounded-xl object-contain shadow-sm" />
            ) : (
              <div 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: c.primary }}
              >
                {storeName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-black text-base sm:text-xl tracking-tight leading-none" style={{ color: c.text }}>
              {storeName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition-transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: c.surface,
                borderColor: "rgba(0,0,0,0.1)",
                color: c.text,
              }}
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow-md animate-in zoom-in-50 duration-200"
                  style={{ backgroundColor: c.primary }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border flex items-center justify-center text-slate-700 dark:text-slate-300"
              style={{ backgroundColor: c.surface, borderColor: "rgba(0,0,0,0.1)" }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden border-t px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200"
            style={{ backgroundColor: c.background }}
          >
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold"
                style={{ color: c.text }}
              >
                {item.label}
              </Link>
            ))}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
