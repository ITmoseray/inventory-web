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
  title?: string;
  label?: string; // alias for title
  value: string | number;
  subtitle?: string;
  change?: number | string; // percentage change or status label (e.g. +12.5, -4.2, "+12%", "Operational")
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  tone?: "blue" | "emerald" | "indigo" | "rose" | "amber" | "purple";
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconColor?: string;
  currency?: string;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function EnterpriseKpiCard({
  title,
  label,
  value,
  subtitle,
  change,
  changeLabel,
  trend,
  tone,
  icon,
  iconColor = "text-primary bg-primary/10",
  currency,
  badge,
  className,
  onClick,
}: EnterpriseKpiCardProps) {
  const displayTitle = title || label || "";

  const toneMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  const resolvedIconColor = tone ? toneMap[tone] || iconColor : iconColor;

  let isPositive = false;
  let isNegative = false;
  let isNeutral = true;

  if (trend) {
    isPositive = trend === "up";
    isNegative = trend === "down";
    isNeutral = trend === "neutral";
  } else if (typeof change === "number") {
    isPositive = change > 0;
    isNegative = change < 0;
    isNeutral = change === 0;
  } else if (typeof change === "string") {
    if (change.startsWith("+")) isPositive = true;
    else if (change.startsWith("-")) isNegative = true;
    else isNeutral = true;
  }

  let formattedChange = "";
  if (typeof change === "number") {
    formattedChange = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  } else if (typeof change === "string") {
    formattedChange = change;
  }

  const displayChangeLabel = changeLabel !== undefined 
    ? changeLabel 
    : (typeof change === "number" ? "vs last period" : undefined);

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
            {displayTitle}
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

        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-transparent", resolvedIconColor)}>
            {React.isValidElement(icon) ? (
              icon
            ) : typeof icon === "function" ? (
              React.createElement(icon as React.ComponentType<{ className?: string }>, { className: "w-5 h-5" })
            ) : null}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium">
        {change !== undefined && change !== null && formattedChange !== "" ? (
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
              {formattedChange}
            </span>
            {displayChangeLabel && <span className="text-slate-400 text-[11px] truncate">{displayChangeLabel}</span>}
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium truncate">{subtitle}</span>
        ) : null}

        {badge && <div className="flex-shrink-0">{badge}</div>}
      </div>
    </div>
  );
}
