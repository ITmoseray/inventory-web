"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Package, Search, Inbox, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnterpriseEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<{ className?: string }>;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EnterpriseEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EnterpriseEmptyStateProps) {
  return (
    <div
      className={cn(
        "py-12 sm:py-16 px-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center max-w-lg mx-auto my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm mb-4">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <ActionIcon className="w-3.5 h-3.5" />
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
