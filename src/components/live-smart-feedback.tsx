"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LivePerformanceRemark, MilestoneReview } from "@/lib/quiz-feedback";
import { Button } from "@/components/ui";

/* -------------------------------------------------------------------------- */
/*         1. In-game Live Coach Banner (Hot Streaks & Cold Streaks)          */
/* -------------------------------------------------------------------------- */

interface LiveSmartCoachBannerProps {
  remark: LivePerformanceRemark | null;
  onDismiss?: () => void;
}

export function LiveSmartCoachBanner({ remark, onDismiss }: LiveSmartCoachBannerProps) {
  if (!remark) return null;

  const isHot = remark.type === "hot_streak" || remark.type === "lightning";
  const isCold = remark.type === "cold_streak";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={remark.message}
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`relative overflow-hidden rounded-2xl border ${remark.borderClass} ${remark.bgClass} p-3.5 sm:p-4 text-white shadow-xl backdrop-blur-md`}
      >
        {/* Glow ambient */}
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl ${
            isHot ? "bg-amber-400/20" : isCold ? "bg-rose-500/20" : "bg-cyan-400/20"
          }`}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Animated Emoji Icon */}
            <motion.div
              animate={isHot ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : { y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl shadow-inner ${
                isHot
                  ? "bg-amber-400/20 border border-amber-300/40"
                  : isCold
                    ? "bg-rose-500/20 border border-rose-400/40"
                    : "bg-white/10"
              }`}
            >
              {remark.emoji}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                    isHot
                      ? "bg-amber-400/30 text-amber-200 border border-amber-300/40"
                      : isCold
                        ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                        : "bg-white/20 text-white"
                  }`}
                >
                  {remark.badge}
                </span>
                <span className={`text-xs font-extrabold ${remark.textClass}`}>
                  {remark.title}
                </span>
              </div>

              {/* Humorous / Hype Quote */}
              <p className="mt-1 text-sm sm:text-base font-bold text-white leading-snug">
                &ldquo;{remark.message}&rdquo;
              </p>

              {remark.advice && (
                <p className="mt-1 text-xs text-white/70 font-medium">
                  💡 {remark.advice}
                </p>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/40 hover:text-white transition rounded-lg p-1 text-xs"
              title="বন্ধ করুন"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*         2. Every 5-Questions Milestone Checkpoint Card / Modal             */
/* -------------------------------------------------------------------------- */

interface Milestone5CheckpointModalProps {
  review: MilestoneReview;
  onContinue: () => void;
  open: boolean;
}

export function Milestone5CheckpointModal({
  review,
  onContinue,
  open,
}: Milestone5CheckpointModalProps) {
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") void ctx.resume();

      const isGood = review.correctInBatch >= 4;
      const isBad = review.correctInBatch <= 1;

      if (isGood) {
        // High upbeat fanfare
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }, i * 110);
        });
      } else if (isBad) {
        // Funny comical slide down
        [240, 200, 160].forEach((freq, i) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.025, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
          }, i * 160);
        });
      }
    } catch {}
  }, [open, review.correctInBatch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border ${review.borderClass} ${review.bgClass} p-5 sm:p-7 text-white shadow-2xl`}
      >
        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-4xl shadow-inner ring-1 ring-white/20 animate-bounce">
            {review.emoji}
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 border border-white/10">
            {review.badge}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
            {review.title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/60">
            আসুন দেখে নিই গত ৫টি প্রশ্নে আপনার অগ্রগতি কেমন হলো
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-white/60">গত ৫টিতে সঠিক</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">
              {review.correctInBatch} / {review.totalInBatch}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-white/60">মোট স্কোর</p>
            <p className="mt-1 text-2xl font-black text-amber-300 font-mono">
              {Math.round(review.score).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-white/60">বর্তমান র‍্যাংক</p>
            <p className="mt-1 text-2xl font-black text-cyan-300">
              {review.rank ? `#${review.rank}` : "—"}
            </p>
          </div>
        </div>

        {/* Funny or Praising Feedback */}
        <div className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">
                ৫-প্রশ্ন স্পেশাল রিভিউ
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-white leading-relaxed">
                &ldquo;{review.verdict}&rdquo;
              </p>
              <p className="mt-2 text-xs text-white/70 font-medium">
                🎯 <span className="text-white/90">টিপস:</span> {review.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 mt-6">
          <Button
            size="lg"
            block
            onClick={onContinue}
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            🚀 দারুণ! পরের রাউন্ডের জন্য প্রস্তুত ➔
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
