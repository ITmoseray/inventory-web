"use client";

import React from "react";
import Link from "next/link";
import { StoreSection, StoreTheme, StoreNavigation } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
  storeName: string;
  storeSlug: string;
  navigation?: StoreNavigation;
  contactEmail?: string;
  contactPhone?: string;
}

export function FooterSection({ section, theme, storeName, storeSlug, contactEmail, contactPhone }: Props) {
  const content = section.content || {};
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="mt-16 pt-16 pb-12 px-4 border-t"
      style={{
        backgroundColor: theme.colors.footerBg || "#0F172A",
        color: theme.colors.footerText || "#F8FAFC",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="space-y-3">
          <h3 className="font-black text-lg tracking-tight text-white">{storeName}</h3>
          <p className="text-xs text-white/70 leading-relaxed max-w-sm">
            {content.aboutText || "Your trusted destination for verified quality products. Fast delivery and customer satisfaction guaranteed."}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Quick Links</h4>
          <ul className="space-y-2 text-xs text-white/70 font-medium">
            <li><Link href={`/store/${storeSlug}`} className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href={`/store/${storeSlug}#products`} className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href={`/store/${storeSlug}#about`} className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href={`/store/${storeSlug}#contact`} className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Customer Care</h4>
          <ul className="space-y-2 text-xs text-white/70 font-medium">
            {contactPhone && <li>Phone: {contactPhone}</li>}
            {contactEmail && <li>Email: {contactEmail}</li>}
            <li>Doorstep Delivery Available</li>
            <li>Cash on Delivery Accepted</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Enterprise Powered</h4>
          <p className="text-xs text-white/60 leading-relaxed">
            Secured and powered by <strong className="text-white">ProTech Assist Enterprise OS</strong>.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
        <span>© {currentYear} {storeName}. All rights reserved.</span>
        <span>Verified ProTech Enterprise Store</span>
      </div>
    </footer>
  );
}
