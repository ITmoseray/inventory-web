"use client";

import React from "react";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function ContactSection({ section, theme }: Props) {
  const content = section.content || {};

  const phone = content.phone || "+232 76 000 000";
  const whatsapp = content.whatsapp || "+232 76 000 000";
  const email = content.email || "orders@store.sl";
  const location = content.location || "Freetown, Sierra Leone";

  return (
    <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12 space-y-2">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block">
          GET IN TOUCH
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Reach Out to Us"}
        </h2>
        <p className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.mutedText }}>
          {content.subtitle || "We are readily available to assist with orders and customer care"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* WhatsApp Line */}
        <a
          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 sm:p-6 rounded-2xl border text-center transition-all hover:shadow-lg hover:scale-105 flex flex-col items-center gap-2 group"
          style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Line</span>
          <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 truncate max-w-full">
            {whatsapp}
          </span>
        </a>

        {/* Direct Phone */}
        <a
          href={`tel:${phone}`}
          className="p-4 sm:p-6 rounded-2xl border text-center transition-all hover:shadow-lg hover:scale-105 flex flex-col items-center gap-2 group"
          style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Support</span>
          <span className="font-bold text-xs sm:text-sm truncate max-w-full" style={{ color: theme.colors.text }}>
            {phone}
          </span>
        </a>

        {/* Email Support */}
        <a
          href={`mailto:${email}`}
          className="p-4 sm:p-6 rounded-2xl border text-center transition-all hover:shadow-lg hover:scale-105 flex flex-col items-center gap-2 group"
          style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Inquiries</span>
          <span className="font-bold text-xs sm:text-sm truncate max-w-full" style={{ color: theme.colors.text }}>
            {email}
          </span>
        </a>

        {/* Location */}
        <div
          className="p-4 sm:p-6 rounded-2xl border text-center flex flex-col items-center gap-2"
          style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storefront Hub</span>
          <span className="font-bold text-xs sm:text-sm truncate max-w-full" style={{ color: theme.colors.text }}>
            {location}
          </span>
        </div>
      </div>
    </section>
  );
}
