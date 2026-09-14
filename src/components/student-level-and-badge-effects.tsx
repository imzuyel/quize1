"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Award, Zap, ChevronRight, X, Star } from "lucide-react";

export interface AchievementItem {
  id: number;
  name: string;
  nameBn: string | null;
  icon: string;
  xp?: number;
  earnedAt?: string;
  description?: string | null;
}

export interface LevelInfo {
  name: string;
  bn: string;
  min: number;
}

interface AnimatedLevelProgressBarProps {
  currentXp: number;
  currentLevel: LevelInfo;
  nextLevel?: LevelInfo;
  onSimulateXpGain?: (amount: number) => void;
}

/** Audio chime for new achievement celebration */
function playAchievementSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonious chord (C5, E5, G5, C6)
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.06, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    });
  } catch {}
}

/**
 * Animated Level Progress Bar with Framer Motion spring transition,
 * glowing shimmer, and numerical XP count-up.
 */
export function AnimatedLevelProgressBar({
  currentXp,
  currentLevel,
  nextLevel,
}: AnimatedLevelProgressBarProps) {
  const [displayXp, setDisplayXp] = useState(0);

  // Smooth numerical count-up
  useEffect(() => {
    let start = 0;
    const end = currentXp;
    if (end === 0) {
      setDisplayXp(0);
      return;
    }
    const duration = 1200;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayXp(end);
        clearInterval(timer);
      } else {
        setDisplayXp(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [currentXp]);

  const levelMin = currentLevel.min;
  const nextMin = nextLevel?.min ?? levelMin + 1000;
  const range = Math.max(1, nextMin - levelMin);
  const progressRatio = Math.min(1, Math.max(0, (currentXp - levelMin) / range));
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <div
      id="student-animated-level-card"
      className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-950/90 p-5 text-white shadow-2xl backdrop-blur-xl min-w-[240px] sm:min-w-[280px]"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">বর্তমান লেভেল</p>
            <h4 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-amber-300">{currentLevel.bn}</span>
              <span className="text-xs font-bold text-slate-400">({currentLevel.name})</span>
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-400/40 px-2.5 py-0.5 text-xs font-black text-teal-300 tabular-nums shadow-sm">
            <Sparkles className="h-3 w-3 text-teal-300" />
            <span>{displayXp} XP</span>
          </span>
        </div>
      </div>

      {nextLevel ? (
        <div className="relative z-10 mt-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 text-slate-400">
              <span>পরবর্তী লেভেল:</span>
              <span className="text-white font-black">{nextLevel.bn}</span>
            </span>
            <span className="text-teal-300 font-extrabold tabular-nums">
              {Math.max(0, nextLevel.min - currentXp)} XP বাকি
            </span>
          </div>

          {/* Smooth Animated Progress Bar Container */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800/90 border border-white/10 p-0.5 shadow-inner">
            {/* Animated Bar with Framer Motion */}
            <motion.div
              id="student-xp-progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1], // Smooth custom easeOutExpo curve
              }}
              className="relative h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 shadow-md"
            >
              {/* Animated Light Shimmer Effect */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              />
            </motion.div>
          </div>

          {/* Progress Markers */}
          <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-slate-400">
            <span>{currentLevel.min} XP</span>
            <span className="text-amber-300 font-bold tabular-nums">{progressPercent}% সম্পন্ন</span>
            <span>{nextLevel.min} XP</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-400/20 p-2 text-center text-xs font-bold text-amber-300">
          👑 আপনি সর্বোচ্চ লেভেলে পৌঁছেছেন!
        </div>
      )}
    </div>
  );
}

/**
 * Achievement Celebration Popup Modal
 * Pops up with confetti-like animations, celebration sound, and badge details.
 */
export function AchievementPopupModal({
  achievement,
  onClose,
}: {
  achievement: AchievementItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (achievement) {
      playAchievementSound();
    }
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <div
          id="achievement-popup-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            id="achievement-popup-card"
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 350,
            }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-center text-white shadow-2xl"
          >
            {/* Ambient Radial Flare */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-500/20 blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Floating Sparkle Elements */}
            <div className="flex justify-center items-center gap-1 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>নতুন অর্জন আনলক হয়েছে!</span>
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>

            {/* Main Badge Avatar with Pop and Rotation */}
            <motion.div
              initial={{ scale: 0.2, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 18,
              }}
              className="mx-auto my-3 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-500 text-5xl shadow-2xl shadow-amber-500/30 ring-4 ring-white/20"
            >
              <motion.span
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                }}
              >
                {achievement.icon || "🏆"}
              </motion.span>
            </motion.div>

            {/* Badge Title */}
            <h3 className="text-2xl font-black text-white mt-4">
              {achievement.nameBn || achievement.name}
            </h3>

            {achievement.description && (
              <p className="mt-1.5 text-xs text-slate-300 px-2 leading-relaxed">
                {achievement.description}
              </p>
            )}

            {/* XP Gain Pill */}
            {achievement.xp ? (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-1.5 text-xs font-black text-slate-950 shadow-lg">
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>+{achievement.xp} বোনাস XP অর্জিত হয়েছে!</span>
              </div>
            ) : null}

            {/* Action CTA */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                id="achievement-popup-claim-btn"
                onClick={onClose}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 py-3 text-sm font-black text-slate-950 shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                🎉 ধন্যবাদ! দারুন হয়েছে
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
