"use client";

import React from "react";
import Link from "next/link";
import { 
  ShoppingCart, PackagePlus, Receipt, Wallet, 
  Calculator, Sparkles, Plus, ArrowUpRight, BarChart3, RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ProfessionalCalculator } from "@/components/shared/professional-calculator";

interface QuickActionProps {
  businessType?: string;
  onRefresh?: () => void;
}

export function QuickActionCommandBar({ businessType = "SHOP", onRefresh }: QuickActionProps) {
  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Title / Status */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              Executive Command Center
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              Live &amp; Synced
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Instant 1-click operational workflows &amp; trade tools
          </p>
        </div>
      </div>

      {/* Action Buttons Hub */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. New POS Sale */}
        <Link
          href="/dashboard/pos"
          className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>New Sale (POS)</span>
        </Link>

        {/* 2. Add Stock / Purchase */}
        <Link
          href="/dashboard/inventory?action=add"
          className="h-9 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <PackagePlus className="h-3.5 w-3.5 text-indigo-400" />
          <span>Add Stock</span>
        </Link>

        {/* 3. Record Expense */}
        <Link
          href="/dashboard/expenses?action=new"
          className="h-9 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Receipt className="h-3.5 w-3.5 text-rose-400" />
          <span>Record Expense</span>
        </Link>

        {/* 4. Cash Register */}
        <Link
          href="/dashboard/cash-register"
          className="h-9 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <span>Cash Register</span>
        </Link>

        {/* 5. Professional Calculator Dialog */}
        <Dialog>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 font-bold text-xs gap-1.5 cursor-pointer"
              >
                <Calculator className="h-3.5 w-3.5 text-amber-400" />
                <span>Calculator</span>
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[400px] max-w-[95vw] mx-auto p-0 border-none bg-transparent shadow-none">
            <ProfessionalCalculator />
          </DialogContent>
        </Dialog>

        {/* 6. Live Refresh */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Refresh Real-time Metrics"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
