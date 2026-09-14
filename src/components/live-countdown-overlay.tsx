"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function LiveCountdownOverlay({ onComplete }: { onComplete?: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    // Play countdown beep if possible
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const tone = (freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        };
        tone(600);
      }
    } catch {}

    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0; // "GO!"
        }
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(c === 2 ? 750 : 1000, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }
        } catch {}
        return c - 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl text-white select-none">
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 blur-3xl animate-pulse" />

      <p className="mb-4 text-sm sm:text-base font-black uppercase tracking-[0.3em] text-cyan-300">
        কুইজ শুরু হচ্ছে
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="relative flex items-center justify-center"
        >
          {count > 0 ? (
            <span className="font-mono text-8xl sm:text-9xl font-black tracking-tight text-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
              {count}
            </span>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-8xl">🚀</span>
              <span className="mt-2 text-5xl sm:text-6xl font-black text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.6)]">
                শুরু!
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-8 text-sm font-semibold text-white/60">
        প্রথম প্রশ্নের জন্য চোখ রাখুন স্ক্রিনে!
      </p>
    </div>
  );
}
