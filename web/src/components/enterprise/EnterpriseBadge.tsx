"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Clock, 
  ShieldCheck, 
  Package 
} from "lucide-react";

export type BadgeVariant = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "neutral" 
  | "primary" 
  | "accent";

export type BadgeSize = "sm" | "md" | "lg";

interface EnterpriseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  neutral: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-slate-400",
  primary: "bg-primary",
  accent: "bg-purple-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

export function EnterpriseBadge({
  variant = "neutral",
  size = "md",
  icon,
  dot,
  pulse,
  className,
  children,
  ...props
}: EnterpriseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-wider rounded-md border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotStyles[variant],
            pulse && "animate-pulse"
          )} 
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}

// Preset Helper Badges
export function StockStatusBadge({ stock, minStock }: { stock: number; minStock?: number }) {
  const min = minStock ?? 10;
  if (stock <= 0) {
    return <EnterpriseBadge variant="danger" dot pulse>Out of Stock</EnterpriseBadge>;
  }
  if (stock <= min) {
    return <EnterpriseBadge variant="warning" dot>Low Stock ({stock})</EnterpriseBadge>;
  }
  return <EnterpriseBadge variant="success" dot>In Stock ({stock})</EnterpriseBadge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "PAID" || s === "COMPLETED") {
    return <EnterpriseBadge variant="success">Paid</EnterpriseBadge>;
  }
  if (s === "PARTIAL" || s === "PARTIALLY_PAID") {
    return <EnterpriseBadge variant="warning">Partial</EnterpriseBadge>;
  }
  if (s === "OVERDUE" || s === "FAILED") {
    return <EnterpriseBadge variant="danger">Overdue</EnterpriseBadge>;
  }
  if (s === "CREDIT" || s === "UNPAID") {
    return <EnterpriseBadge variant="info">Credit</EnterpriseBadge>;
  }
  return <EnterpriseBadge variant="neutral">{status}</EnterpriseBadge>;
}

export function UserRoleBadge({ role }: { role: string }) {
  const r = (role || "").toUpperCase();
  if (r === "SUPERADMIN") {
    return <EnterpriseBadge variant="accent" icon={<ShieldCheck className="w-3 h-3" />}>Super Admin</EnterpriseBadge>;
  }
  if (r === "ADMIN" || r === "OWNER") {
    return <EnterpriseBadge variant="primary" icon={<ShieldCheck className="w-3 h-3" />}>Admin</EnterpriseBadge>;
  }
  if (r === "MANAGER") {
    return <EnterpriseBadge variant="info">Manager</EnterpriseBadge>;
  }
  if (r === "CASHIER") {
    return <EnterpriseBadge variant="success">Cashier</EnterpriseBadge>;
  }
  return <EnterpriseBadge variant="neutral">{role}</EnterpriseBadge>;
}
