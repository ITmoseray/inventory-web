"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

function playStartupChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, volume: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Dramatic cinematic 4-note ascending chime
    playTone(330, 0.0, 0.5, 0.3);
    playTone(415, 0.2, 0.5, 0.3);
    playTone(523, 0.4, 0.6, 0.35);
    playTone(659, 0.65, 1.2, 0.4);
    // Deep resonant bass boom
    playTone(80, 0.0, 1.0, 0.25, "triangle");
  } catch (e) {}
}

const loadingSteps = [
  { text: "ESTABLISHING SECURE CONNECTION...", icon: "lock" },
  { text: "AUTHENTICATING CREDENTIALS...", icon: "fingerprint" },
  { text: "INITIALIZING CORE MODULES...", icon: "cpu" },
  { text: "LOADING ENTERPRISE DATA...", icon: "database" },
  { text: "SYSTEM READY", icon: "shield-check" },
];

const getIconSvg = (name: string) => {
  switch (name) {
    case "lock":
      return <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case "fingerprint":
      return <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>;
    case "cpu":
      return <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>;
    case "database":
      return <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
    case "shield-check":
    default:
      return <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6 1a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
  }
};

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen = ({ onDismiss }: SplashScreenProps) => {
  const [activated, setActivated] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleActivate = () => {
    if (activated) return;
    setActivated(true);
    playStartupChime();
    
    // Cycle through loading steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < loadingSteps.length) {
        setStepIndex(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 700);

    // Dismiss after the chime has played (about 3.5s)
    setTimeout(() => {
      clearInterval(interval);
      onDismiss();
    }, 3500);
  };

  const currentIconName = loadingSteps[stepIndex]?.icon || "shield-check";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030305] overflow-hidden select-none font-sans">
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }}
      />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] bg-blue-700/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md px-6 transition-all duration-1000 translate-y-0 opacity-100">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <div className={`absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 transition-opacity duration-1000 ${activated ? 'opacity-100' : 'opacity-40'}`} />
            <Image
              src="/images/PA.png"
              alt="Logo"
              fill
              priority
              sizes="(max-width: 640px) 128px, 160px"
              className="object-contain relative z-10 drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tighter uppercase text-center flex items-center gap-2 drop-shadow-lg">
              Protech <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">OS</span>
            </h1>
            <div className="h-[1px] w-[120%] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <p className="text-indigo-200/60 text-[9px] sm:text-[11px] font-mono tracking-[0.35em] uppercase mt-1">
              Enterprise Intelligence System
            </p>
          </div>
        </div>

        {/* Interactive Section */}
        <div className="h-32 flex flex-col items-center justify-center w-full">
          {!activated ? (
            <button
              onClick={handleActivate}
              className="group relative flex flex-col items-center gap-5 cursor-pointer focus:outline-none transform transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <div className="relative w-16 h-16 rounded-full border border-indigo-500/30 bg-indigo-950/40 flex items-center justify-center overflow-hidden backdrop-blur-md transition-all duration-300 group-hover:border-indigo-400/80 group-hover:bg-indigo-900/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                <div className="text-indigo-400 group-hover:text-white transition-colors duration-300 w-7 h-7">
                  {getIconSvg("fingerprint")}
                </div>
                
                {/* Scanner Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-[50%] -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animation: 'scan 2s linear infinite' }} />
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-indigo-300 text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase group-hover:text-indigo-200 transition-colors">
                  Initialize System
                </span>
                <span className="text-indigo-500/50 text-[8px] sm:text-[9px] font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-500/50 animate-pulse" />
                  Tap to authenticate
                </span>
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Progress Bar Container */}
              <div className="relative h-[2px] w-full max-w-[280px] bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                  style={{ 
                    backgroundSize: "200% 100%",
                    animation: "fillProgress 3.5s ease-in-out forwards"
                  }}
                />
                {/* Glowing tip */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-[6px] -ml-2"
                  style={{ animation: "moveTip 3.5s ease-in-out forwards" }}
                />
              </div>

              {/* Status Text & Icon */}
              <div className="h-6 flex items-center justify-center">
                <div className="flex items-center gap-2.5 text-cyan-400 animate-in fade-in duration-300">
                  <div className="w-3.5 h-3.5">
                    {getIconSvg(currentIconName)}
                  </div>
                  <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.2em] uppercase shadow-black drop-shadow-md">
                    {loadingSteps[stepIndex]?.text || "SYSTEM READY"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-center z-10 transition-opacity duration-1000 delay-1000 opacity-100">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em]">
          Protech Enterprise • Core v2.0.4
        </span>
        <span className="text-slate-700/80 text-[7px] font-mono uppercase tracking-[0.4em] flex items-center gap-1.5">
          <div className="w-2.5 h-2.5">{getIconSvg("shield-check")}</div>
          Secured by Quantum Encryption
        </span>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes moveTip {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};
