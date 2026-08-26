"use client";

import React, { useState } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  HardDrive,
  Cloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineSyncIndicator() {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncPendingMutations, initialSync } = useOfflineSync();
  const [expanded, setExpanded] = useState(false);

  // If online and 0 pending, keep collapsed by default to stay out of the way
  return (
    <div className="fixed bottom-4 right-4 z-50 select-none print:hidden">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  isOnline ? "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" : "bg-rose-500 animate-ping"
                )} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isOnline ? "Cloud Node Online" : "Offline Storage Active"}
                </span>
              </div>
              <button 
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Status Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Database className="h-3.5 w-3.5 text-indigo-500" />
                  Queued Offline Records
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black font-mono",
                  pendingCount > 0 
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {pendingCount}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Cloud className="h-3.5 w-3.5 text-blue-500" />
                  Last Cloud Sync
                </span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {lastSyncedAt ? format(lastSyncedAt, "p") : "Just now"}
                </span>
              </div>
            </div>

            {/* Explanatory Note */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight pt-1">
              {isOnline 
                ? "All local IndexedDB catalogs, pricing & stock counters are synchronized with Neon PostgreSQL."
                : "Transactions and sales are saved safely on this device. They will automatically upload when internet reconnects."}
            </p>

            {/* Action Buttons */}
            {isOnline && (
              <div className="pt-1 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => syncPendingMutations()}
                  disabled={isSyncing}
                  className="w-full h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                  {isSyncing ? "Syncing..." : "Sync Cloud Now"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border transition-all hover:scale-105 active:scale-95 text-xs font-black uppercase tracking-wider backdrop-blur-md",
          !isOnline
            ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/25 animate-pulse"
            : pendingCount > 0
            ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/25"
            : isSyncing
            ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/25"
            : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-slate-900/10 hover:border-slate-300"
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-3.5 w-3.5 animate-bounce" />
            <span>Offline ({pendingCount})</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <HardDrive className="h-3.5 w-3.5 text-amber-100" />
            <span>{pendingCount} Pending Sync</span>
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">Online</span>
            <ChevronUp className="h-3 w-3 text-slate-400 ml-0.5" />
          </>
        )}
      </button>
    </div>
  );
}
