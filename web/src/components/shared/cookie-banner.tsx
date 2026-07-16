"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("protech-cookie-consent");
    if (!consent) {
      // Small delay to let the page load before showing banner
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("protech-cookie-consent", "all");
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem("protech-cookie-consent", "essential");
    setIsVisible(false);
  };

  const handleSettings = () => {
    // For now just accept essential to dismiss, but could open a modal in the future
    localStorage.setItem("protech-cookie-consent", "custom");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[420px] z-50 p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <button 
              onClick={handleRejectNonEssential}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                  Cookie Consent
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  We use cookies to improve your experience on our site. By continuing to use our site, you consent to our use of cookies in accordance with our <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <Button 
                onClick={handleAcceptAll}
                className="flex-1 rounded-xl h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
              >
                Accept All
              </Button>
              <Button 
                onClick={handleRejectNonEssential}
                variant="outline"
                className="flex-1 rounded-xl h-10 font-bold text-[10px] uppercase tracking-wider"
              >
                Reject Non-Essentials
              </Button>
            </div>
            <div className="mt-2 text-center">
              <button 
                onClick={handleSettings}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
