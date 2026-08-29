"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
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
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncPendingMutations } = useOfflineSync();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    }
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center select-none print:hidden">
      {/* Header Status Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-9 rounded-xl text-xs font-bold transition-all border cursor-pointer",
          !isOnline
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse"
            : isSyncing
            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            : pendingCount > 0
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200/60 dark:hover:bg-slate-800"
        )}
        title={isOnline ? (pendingCount > 0 ? `${pendingCount} pending offline changes` : "Cloud Connected") : "Offline Mode Active"}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider">Offline</span>
            {pendingCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider">Syncing</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <HardDrive className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider">{pendingCount} Queue</span>
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
            <Cloud className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline text-[11px] font-bold text-slate-600 dark:text-slate-300">Online</span>
            <ChevronDown className="h-3 w-3 text-slate-400 opacity-60 hidden sm:inline" />
          </>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 origin-top-right text-slate-900 dark:text-white"
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Status Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  Local Sync Queue
                </span>
                <span className={cn(
                  "font-mono font-bold px-2 py-0.5 rounded-full text-[10px]",
                  pendingCount > 0 
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  {pendingCount} changes
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Cloud className="h-3.5 w-3.5 text-slate-400" />
                  Last Synchronized
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {lastSyncedAt ? format(lastSyncedAt, "HH:mm:ss") : "Just now"}
                </span>
              </div>
            </div>

            {/* Offline Explanation / Warning */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
              {!isOnline 
                ? "You can still create sales and invoices offline. Changes will auto-sync when internet reconnects."
                : pendingCount > 0
                ? "Pending offline transactions detected. Synchronizing with cloud database."
                : "Real-time bidirectional sync active. Zero pending mutations."
              }
            </p>

            {/* Action Buttons */}
            {isOnline && (
              <div className="pt-1 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => syncPendingMutations()}
                  disabled={isSyncing}
                  className="w-full h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                  {isSyncing ? "Syncing..." : "Sync Cloud Now"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
