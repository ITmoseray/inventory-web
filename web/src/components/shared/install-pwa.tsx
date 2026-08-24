"use client";

import { useState, useEffect } from "react";
import { Download, X, Monitor, Share2, PlusSquare, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installMode, setInstallMode] = useState<"native" | "instructions" | "ios" | null>(null);

  useEffect(() => {
    // 1. Register Service Worker for PWA compliance and background handling
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("SW registration notice:", err));
    }

    // 2. Check if already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const androidDevice = /android/.test(userAgent);
    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);

    // 4. Capture native beforeinstallprompt for Android & Desktop Chrome/Edge
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallMode("native");

      const lastDismissed = localStorage.getItem("pwa_prompt_dismissed_at");
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > ONE_DAY) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    // 5. Allow opening the install prompt from any "Install App" button in the app
    const openHandler = () => {
      if (iosDevice) {
        setInstallMode("ios");
      } else if (deferredPrompt) {
        setInstallMode("native");
      } else {
        setInstallMode("instructions");
      }
      setShowBanner(true);
    };

    window.addEventListener("open-pwa-install", openHandler);

    // 6. Automatic display for iOS users after a gentle delay if not dismissed recently
    const timer = setTimeout(() => {
      const lastDismissed = localStorage.getItem("pwa_prompt_dismissed_at");
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (lastDismissed && Date.now() - parseInt(lastDismissed) < ONE_DAY) {
        return;
      }

      if (!isStandalone && !deferredPrompt) {
        if (iosDevice) {
          setInstallMode("ios");
          setShowBanner(true);
        }
      }
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("open-pwa-install", openHandler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setInstallMode("ios");
    } else {
      setInstallMode("instructions");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString());
    setShowBanner(false);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px] z-[9999]"
      >
        <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-2xl border border-white/15 text-white relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute -right-8 -top-8 h-32 w-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4 pr-6">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
              {isIOS ? <Smartphone className="h-6 w-6 text-white" /> : <Download className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Install Enterprise OS</h3>
              <p className="text-[11px] text-slate-400 font-medium">Fast, offline-ready &amp; runs like a native app</p>
            </div>
          </div>

          {/* iOS Specific Instructions */}
          {installMode === "ios" ? (
            <div className="space-y-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> How to install on iPhone / iPad:
              </p>
              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/30 text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Tap the <span className="font-black text-white underline">Share</span> button <span className="inline-flex px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-bold">⎋ / 📤</span> at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/30 text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Scroll down and tap <span className="font-black text-white underline">"Add to Home Screen"</span> <span className="inline-flex px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-bold">➕</span>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/30 text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Tap <span className="font-black text-emerald-400">"Add"</span> in the top right corner to install.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="w-full mt-2 h-9 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold"
              >
                Got It, Thanks
              </Button>
            </div>
          ) : installMode === "native" && deferredPrompt ? (
            /* Android / Chrome Native Prompt */
            <div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Install Enterprise OS on your device home screen for lightning-fast access, fullscreen mode, and instant alerts.
              </p>
              <div className="flex gap-2.5">
                <Button
                  onClick={handleInstall}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Install App Now
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-11 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-bold text-xs"
                >
                  Later
                </Button>
              </div>
            </div>
          ) : (
            /* General Browser Instructions */
            <div className="space-y-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <p className="text-xs text-slate-300 leading-relaxed">
                To install on your phone or computer, tap your browser's menu <span className="font-bold text-white">(⋮ or ⋯)</span> and select <span className="font-bold text-white underline">"Install app"</span> or <span className="font-bold text-white underline">"Add to Home Screen"</span>.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="w-full h-9 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
