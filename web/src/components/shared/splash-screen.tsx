"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen = ({ onDismiss }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onDismiss();
    }, 600);
  };

  useEffect(() => {
    // Attempt to start video playback
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was prevented, waiting for user tap or timer:", err);
      });
    }

    // Safety fallback: auto-dismiss after 6 seconds maximum if video doesn't end
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 6000);

    return () => clearTimeout(fallbackTimer);
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#030305] text-white select-none overflow-hidden transition-opacity duration-700 ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none" />
        
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
          }}
        />
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-7xl px-6 py-6 sm:py-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-slate-400 uppercase">
            PROTECH ASSIST • ENTERPRISE OS
          </span>
        </div>

        <button
          onClick={handleFinish}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs font-bold text-slate-300 hover:text-white"
        >
          <span>Skip</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-indigo-400" />
        </button>
      </div>

      {/* Center Animated Logo Video Player */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-1 w-full max-w-3xl px-4 my-auto">
        <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
          {/* Ambient Video Halo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 blur-3xl rounded-full scale-95 animate-pulse" />

          {/* HTML5 Animation Video */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src="/videos/protech_assist_1080p_60fps.webm"
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setVideoLoaded(true)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleFinish}
              className="w-full h-full object-contain rounded-2xl drop-shadow-[0_0_35px_rgba(79,70,229,0.4)]"
            />
          </div>
        </div>

        {/* System Loading Progress Bar */}
        <div className="w-full max-w-xs space-y-2 mt-4">
          <div className="relative h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-slate-400 uppercase">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-indigo-400 animate-pulse" />
              Initializing Core Modules...
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
          <span>Core System v4.3.0 • All Nodes Operational</span>
        </div>
      </div>
    </div>
  );
};
