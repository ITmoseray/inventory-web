"use client";

import { useEffect, useState, useRef } from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Controls the 5-minute cycle
  
  // Keep track of the current banner so the interval can use the latest value
  const bannerRef = useRef(banner);
  bannerRef.current = banner;

  // 1. Poll the API for the text every 20 seconds
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const url = `/api/announcement?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        const data = JSON.parse(text);
        const newBanner = data.banner ?? "";
        
        // If the banner text changes (e.g. new broadcast), show it immediately
        if (newBanner !== "" && newBanner !== bannerRef.current) {
           setIsVisible(true);
        }
        
        setBanner(newBanner);
      } catch (err) {
        console.error("[AnnouncementBanner] fetch error:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchBanner();
    const id = setInterval(fetchBanner, 20_000);
    return () => clearInterval(id);
  }, []);

  // 2. Control the "show for 30s every 5 minutes" cycle
  useEffect(() => {
    if (!loaded) return;

    let hideTimeout: NodeJS.Timeout;

    const startHideTimer = () => {
       hideTimeout = setTimeout(() => {
         setIsVisible(false);
       }, 30_000); // Hide after 30 seconds
    };

    // If it's currently visible, start the countdown to hide it
    if (isVisible) {
      startHideTimer();
    }

    // Set up the recurring 5-minute interval
    // 5 minutes = 300,000 ms
    const showInterval = setInterval(() => {
       if (bannerRef.current !== "") {
         setIsVisible(true);
       }
    }, 300_000);

    return () => {
      clearTimeout(hideTimeout);
      clearInterval(showInterval);
    };
  }, [isVisible, loaded]);

  // Don't render until first fetch completes to avoid flashes
  if (!loaded) return null;

  const shouldRender = isVisible && banner !== "";

  return (
    <div className="w-full relative z-[9999] flex-shrink-0">
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            key="announcement-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden w-full"
          >
            <div className="w-full bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-white py-2.5 px-4 text-center text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 border-b border-indigo-500/20 shadow-md">
              <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
              <div className="overflow-hidden max-w-3xl w-full text-center">
                <motion.span
                  className="inline-block whitespace-nowrap"
                  animate={banner.length > 80 ? { x: ["0%", "-50%"] } : {}}
                  transition={
                    banner.length > 80
                      ? { repeat: Infinity, duration: 18, ease: "linear" }
                      : {}
                  }
                >
                  {banner.length > 80
                    ? `${banner}\u00a0\u00a0\u00a0\u00a0\u00a0${banner}`
                    : banner}
                </motion.span>
              </div>
              <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
