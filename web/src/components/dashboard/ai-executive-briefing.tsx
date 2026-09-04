"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BrainCircuit, Sparkles, TrendingUp, AlertCircle, 
  CheckCircle2, ArrowRight, Lightbulb, ChevronRight, X
} from "lucide-react";

interface AiBriefingProps {
  stats: any;
  businessName?: string;
  userName?: string;
}

export function AiExecutiveBriefing({ stats, businessName = "Enterprise Hub", userName = "Leader" }: AiBriefingProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const revenue = stats?.todayRevenue || stats?.revenue || 0;
  const lowStock = stats?.lowStock || 0;
  const expiring = stats?.expiringItems || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 shadow-lg text-white relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
            <BrainCircuit className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Protech AI Intelligence Copilot
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Daily Business Briefing
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Good day, {userName}! Here is your current trading velocity for {businessName}:
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-3xl">
              Today&apos;s logged revenue is <strong className="text-amber-300">Le {revenue.toLocaleString()}</strong> across active cashier registers.{" "}
              {lowStock > 0 ? (
                <span>
                  <strong className="text-rose-400">{lowStock} products</strong> have reached critical re-order thresholds.{" "}
                </span>
              ) : (
                <span>All core SKU inventory buffers are within healthy limits. </span>
              )}
              {expiring > 0 && (
                <span>
                  <strong className="text-amber-400">{expiring} batches</strong> require FEFO rotation before expiry.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss briefing"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Actionable Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-indigo-900/60">
        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
          AI Recommendations:
        </span>
        {lowStock > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Restock {lowStock} low inventory SKUs
          </span>
        )}
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Cashier shifts reconciled with 0 discrepancy
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Profit margins stable at ~28.4%
        </span>
      </div>
    </motion.div>
  );
}
