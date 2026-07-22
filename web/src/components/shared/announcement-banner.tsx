"use client";

import { useEffect, useState, useRef } from "react";
import { Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");
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
        const newUpdatedAt = data.updatedAt ?? "";
        
        // If the banner text changes (e.g. new broadcast), show it immediately
        if (newBanner !== "" && newBanner !== bannerRef.current) {
           setIsVisible(true);
        }
        
        setBanner(newBanner);
        setUpdatedAt(newUpdatedAt);
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

  // Check if the banner has expired (past 23:00 PM local time on day of posting)
  const isExpired = () => {
    if (!updatedAt) return false;
    const updateDate = new Date(updatedAt);
    const currentDate = new Date();
    
    // Bypass check if announcement was posted in the last 60 minutes
    const diffMs = currentDate.getTime() - updateDate.getTime();
    if (diffMs < 60 * 60 * 1000) {
      return false;
    }

    const updateYear = updateDate.getFullYear();
    const updateMonth = updateDate.getMonth();
    const updateDay = updateDate.getDate();
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // 1. Roll-over to a future day
    if (currentYear > updateYear) return true;
    if (currentYear === updateYear && currentMonth > updateMonth) return true;
    if (currentYear === updateYear && currentMonth === updateMonth && currentDay > updateDay) return true;
    
    // 2. Same day, past 23:00 PM local time
    if (currentYear === updateYear && currentMonth === updateMonth && currentDay === updateDay) {
      if (currentDate.getHours() >= 23) {
         return true;
      }
    }
    
    return false;
  };

  const shouldRender = isVisible && banner !== "" && !isExpired();

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
            <div className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 px-4 text-center text-sm font-medium tracking-wide flex items-center justify-center gap-3 border-b border-slate-800 dark:border-indigo-500 shadow-sm transition-colors duration-300">
              <Megaphone className="h-4 w-4 text-indigo-300 dark:text-white animate-pulse flex-shrink-0" />
              <div className="overflow-hidden max-w-4xl w-full text-center">
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
              <Megaphone className="h-4 w-4 text-indigo-300 dark:text-white animate-pulse flex-shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
