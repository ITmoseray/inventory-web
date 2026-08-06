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

function speakWelcome() {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const sayIt = () => {
      const utterance = new SpeechSynthesisUtterance(
        "Access granted. Welcome back to ProTech Enterprise OS — your intelligent command center is online."
      );
      utterance.rate = 0.80;   // Slower = more gravitas
      utterance.pitch = 0.70;  // Lower = deeper, authoritative
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();

      // Priority list: best professional male voices across Chrome, Edge, Firefox
      const preferred = 
        voices.find(v => /google uk english male/i.test(v.name)) ||
        voices.find(v => /microsoft ryan/i.test(v.name)) ||
        voices.find(v => /microsoft mark/i.test(v.name)) ||
        voices.find(v => /microsoft david/i.test(v.name)) ||
        voices.find(v => /microsoft george/i.test(v.name)) ||
        voices.find(v => /daniel/i.test(v.name) && v.lang === "en-GB") ||
        voices.find(v => /aaron/i.test(v.name)) ||
        voices.find(v => v.lang === "en-GB") ||
        voices.find(v => v.lang === "en-US") ||
        voices[0];

      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setTimeout(sayIt, 900);
    } else {
      window.speechSynthesis.onvoiceschanged = () => setTimeout(sayIt, 900);
    }
  } catch (e) {}
}

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen = ({ onDismiss }: SplashScreenProps) => {
  const [activated, setActivated] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Pulse the "tap" hint
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 800);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = () => {
    if (activated) return;
    setActivated(true);
    playStartupChime();
    speakWelcome();
    // Dismiss after the chime + TTS has played (about 3.5s)
    setTimeout(() => {
      onDismiss();
    }, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden cursor-pointer select-none"
      onClick={handleActivate}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative w-32 h-32 sm:w-48 sm:h-48">
          <div className={`absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full scale-150 transition-opacity duration-700 ${activated ? 'opacity-100' : 'opacity-0'}`} />
          <Image
            src="/images/PA.png"
            alt="Logo"
            fill
            priority
            sizes="(max-width: 640px) 128px, 192px"
            className="object-contain relative z-10 drop-shadow-[0_0_25px_rgba(79,70,229,0.5)]"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-white text-xl sm:text-2xl font-black tracking-tighter uppercase text-center">
            Protech <span className="text-indigo-500">Enterprise OS</span>
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-2 w-48" />
        </div>

        {/* Loading bar — shown after activation */}
        {activated ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative h-1 w-48 sm:w-64 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-indigo-600 animate-[shimmer_1.5s_infinite_linear]"
                style={{
                  backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  backgroundSize: "200% 100%"
                }}
              />
            </div>
            <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[9px] sm:text-[10px] text-center">
              Initializing Enterprise Systems...
            </p>
          </div>
        ) : (
          /* Tap to continue prompt */
          <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${pulse ? 'opacity-100' : 'opacity-40'}`}>
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/60 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <p className="text-slate-400 text-xs font-bold tracking-[0.25em] uppercase">
              Tap anywhere to launch
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-10 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] z-10">
        Premium Intelligence • v2.0.4
      </div>
    </div>
  );
};
