"use client";

import { useCallback, useEffect, useRef } from "react";

/** Small dependency-free classroom sound engine. Audio only starts after a user gesture. */
export function useClassroomSounds(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!enabled || typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, [enabled]);

  const tone = useCallback((frequency: number, duration = 0.12, type: OscillatorType = "sine", volume = 0.035) => {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  return {
    unlock: () => { void getCtx(); },
    countdown: () => tone(720, 0.08, "square", 0.025),
    submit: () => tone(520, 0.12, "sine", 0.03),
    correct: () => { tone(660, 0.11); setTimeout(() => tone(880, 0.16), 80); },
    wrong: () => { tone(220, 0.16, "sawtooth", 0.02); },
    reveal: () => { tone(440, 0.12); setTimeout(() => tone(660, 0.14), 90); },
    complete: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 100); setTimeout(() => tone(784, 0.2), 200); },
  };
}

export function FullscreenButton({ className = "" }: { className?: string }) {
  const toggle = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Browser may block fullscreen; normal layout remains usable.
    }
  };
  return <button type="button" onClick={toggle} className={className} title="Fullscreen">⛶</button>;
}
