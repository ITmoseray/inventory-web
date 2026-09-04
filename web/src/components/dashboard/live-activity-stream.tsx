"use client";

import React from "react";
import { format } from "date-fns";
import { 
  Activity, ShoppingCart, User, Smartphone, 
  Wallet, CreditCard, Clock, ChevronRight 
} from "lucide-react";

interface ActivityStreamProps {
  recentSales?: any[];
  onSelectSale?: (sale: any) => void;
}

export function LiveActivityStream({ recentSales = [], onSelectSale }: ActivityStreamProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Live Register Stream
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Latest {recentSales.slice(0, 5).length} Sales
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {recentSales.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No register transactions recorded yet today.
          </div>
        ) : (
          recentSales.slice(0, 6).map((sale) => {
            const timeStr = sale.createdAt ? format(new Date(sale.createdAt), "hh:mm a") : "Just now";
            const cashier = sale.user?.name || "Cashier Counter";
            const itemsCount = sale.items?.length || 1;
            const amount = parseFloat(sale.totalAmount || "0");

            return (
              <div
                key={sale.id}
                onClick={() => onSelectSale && onSelectSale(sale)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sale.receiptNumber || `Sale #${sale.id.slice(-5)}`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {cashier} • {itemsCount} {itemsCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    Le {amount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {timeStr}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
