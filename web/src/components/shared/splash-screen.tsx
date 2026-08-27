"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen = ({ onDismiss }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onDismiss();
    }, 500);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((err) => {
        console.log("Autoplay video:", err);
      });
    }

    // Safety fallback: auto dismiss after 5.5 seconds maximum
    const timer = setTimeout(() => {
      handleFinish();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress(Math.min(100, Math.round((current / duration) * 100)));
    }
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999999] flex flex-col items-center justify-between bg-black text-white select-none overflow-hidden cursor-pointer transition-all duration-700 ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-7xl px-6 py-6 sm:py-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-slate-400 uppercase">
            PROTECH ASSIST • ENTERPRISE OS
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 transition-all text-xs font-bold text-slate-200 hover:text-white backdrop-blur-md shadow-lg"
        >
          <span>Skip</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-indigo-400" />
        </button>
      </div>

      {/* Center Animated Logo Video Player */}
      <div className="relative z-30 flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-4 my-auto">
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center bg-black">
          {/* HTML5 Animation Video */}
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              className="w-full h-full object-contain bg-black"
            >
              <source src="/videos/protech_assist_1080p_60fps.webm" type="video/webm" />
              <source src="/protech_assist_1080p_60fps.webm" type="video/webm" />
            </video>
          </div>
        </div>

        {/* System Loading Progress Bar */}
        <div className="w-full max-w-xs space-y-2 mt-4">
          <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400 animate-pulse" />
              Initializing System Core...
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-20 border-t border-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Secured by Quantum Enterprise Encryption</span>
        </div>

        <div>
          <span>Tap anywhere to continue • Core v4.3.0</span>
        </div>
      </div>
    </div>
  );
};
