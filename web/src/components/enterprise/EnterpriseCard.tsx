"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EnterpriseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  padded?: boolean;
}

export function EnterpriseCard({
  children,
  header,
  subtitle,
  action,
  footer,
  padded = true,
  className,
  ...props
}: EnterpriseCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm transition-all",
        className
      )}
      {...props}
    >
      {(header || action || subtitle) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            {header && (
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                {header}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn(padded && "p-5")}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}

interface EnterpriseKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // percentage change, e.g. +12.5 or -4.2
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  currency?: string;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function EnterpriseKpiCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  iconColor = "text-primary bg-primary/10",
  currency,
  badge,
  className,
  onClick,
}: EnterpriseKpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 flex flex-col justify-between gap-4 relative overflow-hidden group",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {currency && (
              <span className="text-sm sm:text-base font-bold text-slate-400 dark:text-slate-500">
                {currency}
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
          </div>
        </div>

        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-black",
                isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                isNeutral && "bg-slate-500/10 text-slate-600 dark:text-slate-400"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              {change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
            </span>
            <span className="text-slate-400 text-[11px] truncate">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium truncate">{subtitle}</span>
        ) : null}

        {badge && <div className="flex-shrink-0">{badge}</div>}
      </div>
    </div>
  );
}
