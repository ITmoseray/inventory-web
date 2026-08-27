"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    }, 450);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((err) => {
        console.log("Autoplay notice:", err);
      });
    }

    // Safety fallback auto-dismiss after 5.5 seconds maximum
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
      className={`fixed inset-0 z-[99999999] h-[100dvh] w-screen flex flex-col items-center justify-between bg-black text-white select-none overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
            PROTECH CORE • ONLINE
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.15] active:scale-95 border border-white/10 hover:border-white/20 transition-all duration-200 text-xs font-semibold text-zinc-300 hover:text-white backdrop-blur-md shadow-lg"
        >
          <span>Skip</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 text-indigo-400" />
        </button>
      </header>

      {/* Center Cinematic Stage: Video + Animated Typography + Loading Bar */}
      <main className="relative z-30 flex flex-col items-center justify-center flex-1 w-full max-w-2xl px-4 my-auto shrink-0">
        
        {/* Animated Logo Video Container */}
        <div className="relative w-[240px] xs:w-[280px] sm:w-[340px] md:w-[400px] max-h-[38vh] aspect-square flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleFinish}
            className="w-full h-full object-contain bg-black transform-gpu"
          >
            <source src="/videos/protech_assist_1080p_60fps.webm" type="video/webm" />
            <source src="/protech_assist_1080p_60fps.webm" type="video/webm" />
          </video>
        </div>

        {/* Animated Brand Title & Tagline */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 mt-1 sm:mt-3 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase font-sans">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Protech
              </span>{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                Assist
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-2.5 sm:gap-3"
          >
            <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-cyan-400/60 to-indigo-500/80" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-extrabold tracking-[0.3em] sm:tracking-[0.45em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                Enterprise OS
              </span>
            </div>
            <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-cyan-400/60 to-indigo-500/80" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] sm:tracking-[0.25em] text-zinc-400 uppercase font-medium"
          >
            Autonomous Business &amp; Retail Intelligence
          </motion.p>
        </div>

        {/* System Loading Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-2 mt-4 sm:mt-6 px-4">
          <div className="relative h-1.5 w-full bg-zinc-900/90 rounded-full overflow-hidden border border-white/[0.06] shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(99,102,241,0.9)]"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span>Initializing System Core...</span>
            </span>
            <span className="font-semibold text-zinc-300">{progress}%</span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-6xl px-4 sm:px-8 pb-4 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left z-30 shrink-0 text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Quantum Enterprise Encryption • 256-Bit</span>
        </div>

        <div className="opacity-80 hover:opacity-100 transition-opacity">
          <span className="animate-pulse">Tap anywhere to continue</span>
          <span className="text-zinc-500 ml-2">• v4.3.0</span>
        </div>
      </footer>
    </div>
  );
};
