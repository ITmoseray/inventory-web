"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Sparkles, X, ArrowRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "enterprise_os_receipt_customization_callout_v1";

export function ReceiptFeatureCallout() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if dismissed before
    const hasDismissed = localStorage.getItem(STORAGE_KEY);
    if (hasDismissed) return;

    // Small entrance delay after user logs in/page mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      console.error(e);
    }
  };

  // If already on the receipt settings page, don't show the callout
  if (pathname?.includes("/dashboard/system/settings/business")) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-5 z-50 max-w-[380px] w-[calc(100vw-2.5rem)] sm:w-[380px]"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 shadow-[0_20px_50px_rgba(79,70,229,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 sm:p-6 backdrop-blur-xl">
            {/* Ambient Background Gradient */}
            <div className="absolute -top-12 -right-12 h-36 w-36 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 bg-gradient-to-tr from-sky-500/15 to-indigo-500/15 rounded-full blur-xl pointer-events-none" />

            {/* Close / Cancel Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close notification"
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>New Feature Alert</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 mb-4">
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Full Receipt Customization &amp; Live Preview
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Personalize your POS thermal receipts, add secondary phones, customize header taglines, return policies, and preview changes live!
              </p>
            </div>

            {/* Location Pointer Indicator */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-4">
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                Located at: <strong className="text-slate-900 dark:text-white font-bold">Settings ➔ Receipt Layout</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/system/settings/business?tab=receipt"
                onClick={handleDismiss}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Customize Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="h-10 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
