"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, TrendingUp, ShieldCheck, Clock, DollarSign, 
  Sparkles, ArrowRight, CheckCircle2, AlertTriangle, BarChart3,
  Layers, Lock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RoiCalculatorSection() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000); // in Leones (or thousands)
  const [branches, setBranches] = useState(2);
  const [skuCount, setSkuCount] = useState(350);
  const [currency, setCurrency] = useState<"SLL" | "USD">("SLL");

  // Multiplier logic based on real enterprise stats in Sierra Leone
  // Average stock loss in non-automated retail is ~6-12%
  const exchangeRate = 22.5; // Le 22.5 to $1 USD approx
  const displayRevenue = currency === "SLL" ? monthlyRevenue : Math.round(monthlyRevenue / exchangeRate);
  
  const estimatedStockLossPreventedMonthly = Math.round(monthlyRevenue * 0.08 * (1 + (branches - 1) * 0.15));
  const checkoutTimeSavedHoursMonthly = Math.round(branches * 45); // ~45 hours saved per cashier lane
  const bookkeepingHoursSavedMonthly = Math.round(25 + branches * 15);
  const annualTotalSavings = estimatedStockLossPreventedMonthly * 12;

  const displaySavings = currency === "SLL" ? annualTotalSavings : Math.round(annualTotalSavings / exchangeRate);
  const displayMonthlyStockSaved = currency === "SLL" ? estimatedStockLossPreventedMonthly : Math.round(estimatedStockLossPreventedMonthly / exchangeRate);

  return (
    <section id="roi-calculator" className="py-20 lg:py-28 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 backdrop-blur-md text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest">
            <TrendingUp className="h-3.5 w-3.5" />
            ROI &amp; Profit Optimization Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
            Calculate Your <span className="text-indigo-600 dark:text-indigo-400">Annual Return</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            See how much your business saves by preventing unaccounted stock shrinkage, speeding up cashier lines, and automating tax accounting with Protech Assist.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mt-2">
            <button
              onClick={() => setCurrency("SLL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === "SLL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇸🇱 Sierra Leone Leones (Le)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === "USD"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇺🇸 US Dollars ($)
            </button>
          </div>
        </div>

        {/* Calculator Interactive Grid */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: Interactive Input Sliders (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Enter Your Store Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust the sliders to mirror your current enterprise operations.
              </p>
            </div>

            {/* Slider 1: Monthly Revenue */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Est. Monthly Revenue
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {currency === "SLL" ? "Le " : "$"}{displayRevenue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>{currency === "SLL" ? "Le 10,000" : "$450"}</span>
                <span>{currency === "SLL" ? "Le 250,000" : "$11,000"}</span>
                <span>{currency === "SLL" ? "Le 500,000+" : "$22,000+"}</span>
              </div>
            </div>

            {/* Slider 2: Number of Branches */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Active Branches / Warehouses
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {branches} {branches === 1 ? "Branch" : "Branches"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={branches}
                onChange={(e) => setBranches(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>1 Single Store</span>
                <span>5 Regional Hubs</span>
                <span>15+ Chain Stores</span>
              </div>
            </div>

            {/* Slider 3: SKU Inventory Count */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Estimated Product SKUs
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {skuCount.toLocaleString()} SKUs
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={2500}
                step={50}
                value={skuCount}
                onChange={(e) => setSkuCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>50 SKUs (Boutique)</span>
                <span>1,000 SKUs (Supermarket)</span>
                <span>2,500+ (Wholesale Hub)</span>
              </div>
            </div>

            {/* Assurance Box */}
            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                Audited &amp; verified across 50+ commercial deployments in Sierra Leone.
              </p>
            </div>
          </div>

          {/* Right: Calculated Savings Dashboard (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-indigo-800/40">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block mb-1">
                  Estimated Value Retained
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                  {currency === "SLL" ? "Le " : "$"}{displaySavings.toLocaleString()}
                  <span className="text-xs text-indigo-200 font-semibold block mt-0.5">/ Annual Profit Saved</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3 pt-3 border-t border-indigo-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Stock Loss Prevented
                  </span>
                  <span className="font-bold text-white">
                    {currency === "SLL" ? "Le " : "$"}{displayMonthlyStockSaved.toLocaleString()}/mo
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Checkout Speed Boost
                  </span>
                  <span className="font-bold text-white">
                    +{checkoutTimeSavedHoursMonthly} Hours Saved/mo
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                    Bookkeeping &amp; GST Time
                  </span>
                  <span className="font-bold text-white">
                    +{bookkeepingHoursSavedMonthly} Hours Automated/mo
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <Link
                href="/register"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Claim Your Free 14-Day Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[10px] text-center text-indigo-300/80">
                No credit card required • Instant setup in 2 minutes
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
