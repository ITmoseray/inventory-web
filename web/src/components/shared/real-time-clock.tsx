"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
  return (
    <div className="flex items-center gap-2 md:gap-4 opacity-0">
      {/* Greeting + date: only xl+ */}
      <div className="hidden xl:flex flex-col items-end">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">...</span>
        <span className="text-sm font-bold text-slate-400">...</span>
      </div>
      <div className="hidden xl:block h-10 w-px bg-slate-100 dark:bg-white/10" />
      <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 dark:bg-slate-950/60 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-slate-100 dark:border-white/5">
        <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary" />
        <span className="text-[10px] md:text-xs font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums">00:00:00</span>
      </div>
    </div>
  );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex items-center gap-2 md:gap-4 animate-in fade-in duration-1000">
      {/* Greeting + date column: only xl+ breakpoint */}
      <div className="hidden xl:flex flex-col items-end">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">
          {getGreeting()}
        </span>
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
          {formatDate(time)}
        </span>
      </div>

      <div className="h-8 w-px bg-slate-100 dark:bg-white/10 hidden xl:block" />

      {/* Clock pill: responsive padding/font sizes for mobile */}
      <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 dark:bg-slate-950/60 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-slate-100 dark:border-white/5 shadow-inner dark:shadow-none hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all">
        <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary dark:text-white animate-pulse" />
        <span className="text-[10px] md:text-xs font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums">
          {formatTime(time)}
        </span>
      </div>
    </div>
  );
}
