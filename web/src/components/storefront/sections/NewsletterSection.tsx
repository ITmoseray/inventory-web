"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { StoreSection, StoreTheme } from "@/types/store-builder";
import { toast } from "sonner";

interface Props {
  section: StoreSection;
  theme: StoreTheme;
}

export function NewsletterSection({ section, theme }: Props) {
  const content = section.content || {};
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("Thank you for subscribing!");
  };

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div 
        className="rounded-3xl p-8 sm:p-12 text-center border shadow-sm space-y-4"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="text-2xl font-black tracking-tight" style={{ color: theme.colors.text }}>
          {content.title || "Get Special Offers & New Arrivals"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {content.subtitle || "Subscribe to our VIP list for exclusive flash sales and newly added products."}
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> You're on the list!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email or WhatsApp number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border text-xs bg-white dark:bg-slate-900 focus:outline-none"
              style={{ borderColor: "rgba(0,0,0,0.15)" }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Send className="w-3.5 h-3.5" /> Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
