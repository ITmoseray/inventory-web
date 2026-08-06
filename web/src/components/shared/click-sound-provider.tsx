"use client";

import { useEffect, useRef } from "react";

export function ClickSoundProvider() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const playClick = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Very short, snappy high-frequency tick simulating a modern UI click
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);

        // Quick fade out with low volume
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      } catch (err) {
        // Ignore audio errors (e.g. if browser blocks before interaction)
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Check if clicked element is interactive
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [tabindex="0"]');
      
      if (isInteractive) {
        playClick();
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return null;
}
