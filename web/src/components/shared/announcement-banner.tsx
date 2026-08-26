"use client";

import { useEffect, useState, useRef } from "react";
import { Megaphone, X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const bannerRef = useRef(banner);
  bannerRef.current = banner;

  // Poll for announcements every 20s
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const url = `/api/announcement?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        const newBanner = (data.banner ?? "").trim();

        // Check if user dismissed THIS specific banner text
        const dismissedText = sessionStorage.getItem("dismissed_announcement_banner");
        if (dismissedText === newBanner) {
          setIsDismissed(true);
        } else if (newBanner !== bannerRef.current) {
          // If banner changed or is new, show it
          setIsDismissed(false);
        }

        setBanner(newBanner);
      } catch (err) {
        console.error("[AnnouncementBanner] fetch error:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchBanner();
    const intervalId = setInterval(fetchBanner, 20_000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("dismissed_announcement_banner", banner);
    } catch (e) {
      console.error(e);
    }
  };

  if (!loaded || !banner || isDismissed) return null;

  // Parse markdown style link [Text](url) or special [Refer Now]
  const parseBannerContent = (text: string) => {
    // Check for [Text](url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^\)]+)\)/;
    const mdMatch = text.match(mdLinkRegex);
    if (mdMatch) {
      const beforeText = text.substring(0, mdMatch.index);
      const linkText = mdMatch[1];
      const linkUrl = mdMatch[2];
      const afterText = text.substring((mdMatch.index || 0) + mdMatch[0].length);
      return {
        mainText: `${beforeText} ${afterText}`.trim(),
        action: { label: linkText, url: linkUrl }
      };
    }

    // Check for [Refer Now]
    if (text.includes("[Refer Now]")) {
      return {
        mainText: text.replace("[Refer Now]", "").trim(),
        action: { label: "Refer Now", url: "/dashboard/referrals" }
      };
    }

    // Check for generic [Action Text]
    const genericBracketMatch = text.match(/\[([^\]]+)\]/);
    if (genericBracketMatch) {
      return {
        mainText: text.replace(genericBracketMatch[0], "").trim(),
        action: { label: genericBracketMatch[1], url: "/dashboard" }
      };
    }

    return {
      mainText: text,
      action: null
    };
  };

  const { mainText, action } = parseBannerContent(banner);

  return (
    <div className="w-full relative z-[9999] flex-shrink-0">
      <AnimatePresence>
        <motion.div
          key="announcement-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden w-full"
        >
          <div className="w-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-indigo-500/30 text-white py-2.5 px-4 text-xs font-semibold tracking-wide flex items-center justify-between gap-3 shadow-md">
            {/* Left Megaphone Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider text-indigo-200">
                Broadcast
              </span>
            </div>

            {/* Center Content & Action */}
            <div className="flex-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center min-w-0">
              <span className="text-slate-100 font-medium leading-tight">
                {mainText}
              </span>

              {action && (
                <Link
                  href={action.url}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Right Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="h-6 w-6 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
