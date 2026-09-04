"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sliders, Plus, Minus, Layers } from 'lucide-react';

const ADD_ONS = [
  { name: 'Extra Staff Users', price: 10, unit: 'per staff / month' },
  { name: 'Extra Sales Invoices', price: 10, unit: 'per 500 invoices / month' },
  { name: 'Extra Store Branches', price: 25, unit: 'per branch / month' },
  { name: 'Barcode Generation & Labels', price: 15, unit: 'per 1,000 scans / month' },
  { name: 'Additional Dedicated Warehouse', price: 50, unit: 'per warehouse / month' },
];

export function PricingCalculator({ basePrice, currencySymbol = 'NLe', rate = 1 }: { basePrice: number, currencySymbol?: string, rate?: number }) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    ADD_ONS.reduce((acc, addOn) => ({ ...acc, [addOn.name]: 0 }), {})
  );

  const calculateAddOnsTotal = () => {
    return ADD_ONS.reduce((total, addOn) => {
      return total + (quantities[addOn.name] || 0) * (addOn.price * rate);
    }, 0);
  };

  const addOnsTotal = calculateAddOnsTotal();
  const total = basePrice + addOnsTotal;

  return (
    <Card className="w-full max-w-3xl mx-auto rounded-[2.5rem] border-2 border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
              Modular Plan Customizer
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Add individual resource extensions on top of your base license tier
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-8 space-y-4">
        {/* Base Plan Line */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-indigo-500" />
            <span className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Base Tier Rate</span>
          </div>
          <span className="font-[1000] text-sm text-slate-900 dark:text-white">
            {currencySymbol} {Math.round(basePrice).toLocaleString()} /mo
          </span>
        </div>

        {/* Add-ons List */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {ADD_ONS.map((addOn) => {
            const addOnPrice = Math.round(addOn.price * rate);
            const qty = quantities[addOn.name] || 0;
            const subtotal = qty * addOnPrice;

            return (
              <div key={addOn.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{addOn.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    +{currencySymbol} {addOnPrice.toLocaleString()} {addOn.unit}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700" 
                      onClick={() => setQuantities({ ...quantities, [addOn.name]: Math.max(0, qty - 1) })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-black text-xs text-slate-900 dark:text-white">{qty}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700" 
                      onClick={() => setQuantities({ ...quantities, [addOn.name]: qty + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="w-24 text-right font-black text-xs text-indigo-600 dark:text-indigo-400">
                    +{currencySymbol} {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculated Total Footer */}
        <div className="border-t-2 border-slate-200 dark:border-white/10 mt-6 pt-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Configured Plan</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Base + ({Object.values(quantities).reduce((a, b) => a + b, 0)} add-ons)</span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white tracking-tight">
              {currencySymbol} {Math.round(total).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">/ month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
