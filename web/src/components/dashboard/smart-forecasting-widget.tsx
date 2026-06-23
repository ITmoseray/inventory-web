"use client";

import React, { useEffect, useState } from "react";
import { getInventoryForecast } from "@/lib/actions/forecasting";
import { BrainCircuit, AlertTriangle, TrendingDown, ArrowRight, PackageOpen, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export function SmartForecastingWidget() {
  const { data: session } = useSession();
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      if (session?.user?.businessId) {
        const data = await getInventoryForecast(session.user.businessId);
        setForecast(data);
        setLoading(false);
      }
    }
    loadForecast();
  }, [session?.user?.businessId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-xl h-full flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-500" /> AI Forecasting
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Replenishment</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
          <TrendingDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="flex-1 space-y-3 relative z-10 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {forecast.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-3 border border-emerald-100 dark:border-emerald-800/30">
                <PackageOpen className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Stock levels are optimal!</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">No items are predicted to run out soon.</p>
            </motion.div>
          ) : (
            forecast.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border ${
                    item.status === 'OUT_OF_STOCK' ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400' :
                    item.status === 'CRITICAL' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400' :
                    'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400'
                  }`}>
                    {item.status === 'OUT_OF_STOCK' ? <AlertTriangle className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col max-w-[120px] sm:max-w-[200px]">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</span>
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-0.5 ${
                      item.status === 'OUT_OF_STOCK' ? 'text-rose-500' :
                      item.status === 'CRITICAL' ? 'text-amber-500' :
                      'text-blue-500'
                    }`}>
                      {item.status === 'OUT_OF_STOCK' ? 'Depleted' : `${item.daysUntilDepletion} Days Left`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suggest</span>
                  <button className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    Order {item.suggestedOrderQty} <ArrowRight className="h-3 w-3 hidden sm:block" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
