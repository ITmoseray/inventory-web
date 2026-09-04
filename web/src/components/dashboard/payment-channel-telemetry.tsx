"use client";

import React from "react";
import { Smartphone, Wallet, CreditCard, ShieldCheck, ArrowUpRight } from "lucide-react";

interface PaymentTelemetryProps {
  recentSales?: any[];
  totalRevenue?: number;
}

export function PaymentChannelTelemetry({ recentSales = [], totalRevenue = 0 }: PaymentTelemetryProps) {
  // Aggregate payment channels
  let orangeMoneyTotal = 0;
  let afriMoneyTotal = 0;
  let cashTotal = 0;
  let cardTotal = 0;

  recentSales.forEach((sale) => {
    const method = (sale.paymentMethod || "CASH").toUpperCase();
    const amount = parseFloat(sale.totalAmount || "0");
    if (method.includes("ORANGE")) orangeMoneyTotal += amount;
    else if (method.includes("AFRI")) afriMoneyTotal += amount;
    else if (method.includes("CARD") || method.includes("STRIPE")) cardTotal += amount;
    else cashTotal += amount;
  });

  const aggregate = orangeMoneyTotal + afriMoneyTotal + cashTotal + cardTotal || totalRevenue || 1;

  const channels = [
    {
      name: "Cash in Register",
      amount: cashTotal,
      percentage: Math.round((cashTotal / aggregate) * 100),
      icon: Wallet,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-500",
      bgBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      name: "Orange Money",
      amount: orangeMoneyTotal,
      percentage: Math.round((orangeMoneyTotal / aggregate) * 100),
      icon: Smartphone,
      color: "from-orange-500 to-amber-600",
      textColor: "text-orange-500",
      bgBadge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
    {
      name: "AfriMoney",
      amount: afriMoneyTotal,
      percentage: Math.round((afriMoneyTotal / aggregate) * 100),
      icon: Smartphone,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-500",
      bgBadge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      name: "Bank Cards / POS",
      amount: cardTotal,
      percentage: Math.round((cardTotal / aggregate) * 100),
      icon: CreditCard,
      color: "from-purple-500 to-violet-600",
      textColor: "text-purple-500",
      bgBadge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Tender &amp; Payment Gateway Breakdown
          </h3>
          <p className="text-xs text-slate-400">Real-time mobile money and register cash reconciliations</p>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Total: <strong className="text-slate-900 dark:text-white">Le {aggregate.toLocaleString()}</strong>
        </span>
      </div>

      {/* Progress Bar Multi-Segment */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
        {channels.map((ch, i) => (
          <div
            key={i}
            style={{ width: `${Math.max(ch.percentage, ch.amount > 0 ? 5 : 0)}%` }}
            className={`h-full bg-gradient-to-r ${ch.color} transition-all duration-500`}
            title={`${ch.name}: ${ch.percentage}%`}
          />
        ))}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {channels.map((ch, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{ch.name}</span>
              <ch.icon className={`h-3.5 w-3.5 ${ch.textColor}`} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              Le {ch.amount.toLocaleString()}
            </p>
            <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${ch.bgBadge}`}>
              {ch.percentage}% share
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
