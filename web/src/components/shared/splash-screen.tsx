"use client";
import Image from "next/image";
import { useEffect } from "react";

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

    // Deep resonant bass boom on startup
    playTone(80, 0.0, 1.0, 0.25, "triangle");
  } catch (e) {
    // Ignore if browser blocks audio
  }
}

function speakWelcome() {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const sayIt = () => {
      const utterance = new SpeechSynthesisUtterance(
        "Welcome to ProTech Enterprise OS. Initializing your intelligent workspace."
      );
      utterance.rate = 0.88;
      utterance.pitch = 0.85;
      utterance.volume = 1;

      // Pick a deep/premium voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        /google uk english male|david|mark|daniel|aaron|fred/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not load instantly — wait for chime to finish first
    if (window.speechSynthesis.getVoices().length > 0) {
      setTimeout(sayIt, 1000);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setTimeout(sayIt, 1000);
      };
    }
  } catch (e) {
    // Ignore
  }
}

export const SplashScreen = () => {
  useEffect(() => {
    playStartupChime();
    speakWelcome();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-8 group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <Image
            src="/images/PA.png"
            alt="Logo"
            fill
            priority
            sizes="(max-width: 640px) 128px, 192px"
            className="object-contain relative z-10 drop-shadow-[0_0_25px_rgba(79,70,229,0.5)]"
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            <h1 className="text-white text-xl sm:text-2xl font-black tracking-tighter uppercase text-center">
              Protech <span className="text-indigo-500">Enterprise OS</span>
            </h1>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-2 w-48" />
          </div>

          <div className="flex flex-col items-center gap-4">
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
              Initializing Enterprise Systems
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-10 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] z-10">
        Premium Intelligence • v2.0.4
      </div>
    </div>
  );
};
