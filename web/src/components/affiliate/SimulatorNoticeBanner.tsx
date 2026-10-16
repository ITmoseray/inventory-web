"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert, Sparkles, GraduationCap } from "lucide-react";

interface SimulatorNoticeBannerProps {
  className?: string;
  variant?: "warning" | "compact" | "accent";
}

export function SimulatorNoticeBanner({
  className = "",
  variant = "warning",
}: SimulatorNoticeBannerProps) {
  if (variant === "compact") {
    return (
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-black uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">
            PROTECH TRAINING SIMULATOR — NO REAL MONEY
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold opacity-80 tracking-widest hidden sm:inline">
          Academy Practical Mode
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 p-4 sm:p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                PRACTICAL TRAINING SIMULATOR
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                ProTech Online Academy
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              PROTECH TRAINING SIMULATOR — NO REAL MONEY
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              This interactive environment is designed exclusively for live affiliate marketing practical training. All products, demonstration prices, Orange Money checkout references, and commissions are educational simulations. No actual financial transactions or liabilities occur.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 sm:border-l border-amber-500/20 pt-3 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">
            Demonstration Mode
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Currency: Sierra Leone NLe (Demo)
          </span>
        </div>
      </div>
    </div>
  );
}
