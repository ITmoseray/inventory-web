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

  return (
    <section id="contact" className="py-14 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Reach Out to Us"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {content.subtitle || "We are readily available to assist with orders and inquiries"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.phone && (
          <a
            href={`tel:${content.phone}`}
            className="p-5 rounded-2xl border text-center transition-all hover:shadow-md hover:scale-105 flex flex-col items-center gap-2"
            style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Support</span>
            <span className="font-bold text-xs" style={{ color: theme.colors.text }}>{content.phone}</span>
          </a>
        )}

        {content.whatsapp && (
          <a
            href={`https://wa.me/${content.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border text-center transition-all hover:shadow-md hover:scale-105 flex flex-col items-center gap-2"
            style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Line</span>
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{content.whatsapp}</span>
          </a>
        )}

        {content.email && (
          <a
            href={`mailto:${content.email}`}
            className="p-5 rounded-2xl border text-center transition-all hover:shadow-md hover:scale-105 flex flex-col items-center gap-2"
            style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Us</span>
            <span className="font-bold text-xs line-clamp-1" style={{ color: theme.colors.text }}>{content.email}</span>
          </a>
        )}

        {content.location && (
          <div
            className="p-5 rounded-2xl border text-center flex flex-col items-center gap-2"
            style={{ backgroundColor: theme.colors.surface, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</span>
            <span className="font-bold text-xs" style={{ color: theme.colors.text }}>{content.location}</span>
          </div>
        )}
      </div>
    </section>
  );
}
