"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function FaqSection({ section, theme }: Props) {
  const content = section.content || {};
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = content.faqs || [
    { q: "How does delivery work?", a: "We deliver across Freetown and regional hubs within 1-2 business days. Our rider contacts you before arrival." },
    { q: "Can I pay with Cash on Delivery?", a: "Yes! You can inspect your package and pay the delivery rider upon delivery in cash or mobile money." },
    { q: "Can I order directly on WhatsApp?", a: "Yes, you can click the WhatsApp button on any item or at checkout to chat with our sales team immediately." },
    { q: "What is your return policy?", a: "If an item is damaged or does not match description, contact us within 48 hours for immediate replacement." },
  ];

  return (
    <section className="py-14 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Frequently Asked Questions"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {content.subtitle || "Everything you need to know about shopping with us"}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq: any, idx: number) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm flex items-center justify-between gap-4"
                style={{ color: theme.colors.text }}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
