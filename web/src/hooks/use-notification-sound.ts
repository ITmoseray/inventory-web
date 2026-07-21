/**
 * useNotificationSound — plays synthesized tones via Web Audio API.
 * No audio file dependencies. Respects a mute preference stored in localStorage.
 */
"use client";

import { useCallback, useRef } from "react";

export type SoundType = "info" | "warning" | "error" | "success";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/** Plays a short synthesized chime. Pure Web Audio API — no file needed. */
function playSynth(type: SoundType) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.45, now);
  master.connect(ctx.destination);

  const configs: { freq: number; start: number; dur: number; type: OscillatorType }[][] = {
    info: [
      [
        { freq: 1046.5, start: 0, dur: 0.15, type: "sine" }, // C6
        { freq: 1318.5, start: 0.15, dur: 0.3, type: "sine" }, // E6
      ],
    ],
    success: [
      [
        { freq: 1046.5, start: 0, dur: 0.1, type: "triangle" },
        { freq: 1318.5, start: 0.1, dur: 0.1, type: "triangle" },
        { freq: 1567.9, start: 0.2, dur: 0.3, type: "triangle" },
      ],
    ],
    warning: [
      [
        { freq: 440, start: 0, dur: 0.2, type: "square" },
        { freq: 440, start: 0.25, dur: 0.2, type: "square" },
      ],
    ],
    error: [
      [
        { freq: 440, start: 0, dur: 0.15, type: "sawtooth" },
        { freq: 220, start: 0.15, dur: 0.35, type: "sawtooth" },
      ],
    ],
  };

  const notes = configs[type]?.[0] ?? configs.info[0];

  notes.forEach(({ freq, start, dur, type: waveType }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.8, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
}

const MUTE_KEY = "protech_notif_mute";

export function useNotificationSound() {
  const isMuted = useCallback(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
      return false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    try {
      const current = localStorage.getItem(MUTE_KEY) === "true";
      localStorage.setItem(MUTE_KEY, String(!current));
      return !current; // return new muted state
    } catch {
      return false;
    }
  }, []);

  const play = useCallback((type: SoundType = "info") => {
    if (isMuted()) return;
    try {
      playSynth(type);
    } catch (e) {
      console.warn("Notification sound failed:", e);
    }
  }, [isMuted]);

  return { play, isMuted, toggleMute };
}
