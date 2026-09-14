"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, cx } from "./ui";

export interface LiveSessionPacingTimerProps {
  endsAt: string | null;
  totalSeconds: number;
  paused?: boolean;
  questionIndex?: number;
  totalQuestions?: number;
  answeredCount?: number;
  totalPlayers?: number;
  revealed?: boolean;
  onExtend?: (seconds: number) => void;
  onTogglePause?: () => void;
  onReveal?: () => void;
  compact?: boolean;
  className?: string;
}

export function LiveSessionPacingTimer({
  endsAt,
  totalSeconds,
  paused = false,
  questionIndex = 0,
  totalQuestions = 0,
  answeredCount = 0,
  totalPlayers = 0,
  revealed = false,
  onExtend,
  onTogglePause,
  onReveal,
  compact = false,
  className = "",
}: LiveSessionPacingTimerProps) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (revealed) return 0;
    if (!endsAt) return totalSeconds || 20;
    return Math.max(0, (new Date(endsAt).getTime() - Date.now()) / 1000);
  });

  useEffect(() => {
    if (revealed) {
      return;
    }
    if (paused) return;

    const tick = () => {
      if (!endsAt) {
        setRemaining(totalSeconds || 20);
        return;
      }
      const diff = (new Date(endsAt).getTime() - Date.now()) / 1000;
      setRemaining(Math.max(0, diff));
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [endsAt, paused, revealed, totalSeconds]);

  const total = totalSeconds > 0 ? totalSeconds : 20;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const secs = Math.ceil(remaining);

  // Pacing status & styling
  const isExpired = secs <= 0 && !revealed;
  const isUrgent = secs <= 5 && !revealed;
  const isHalfway = secs <= 10 && !isUrgent && !revealed;

  const pacingColor = paused
    ? "amber"
    : revealed
      ? "blue"
      : isExpired
        ? "rose"
        : isUrgent
          ? "rose"
          : isHalfway
            ? "amber"
            : "emerald";

  const pacingLabel = paused
    ? "⏸️ টাইমার স্থগিত (Paused)"
    : revealed
      ? "👁️ উত্তর প্রকাশিত হয়েছে"
      : isExpired
        ? "⏰ সময় শেষ — উত্তর লক করা হয়েছে"
        : isUrgent
          ? "🚨 সময় শেষ পর্যায়ে! (Pacing Critical)"
          : isHalfway
            ? "⚡ গতি বাড়ান — শিক্ষার্থীরা ভাবছে"
            : "🟢 স্বাভাবিক গতি (Optimal Pacing)";

  // Answer ratio
  const answerPct = totalPlayers > 0 ? Math.round((answeredCount / totalPlayers) * 100) : 0;
  const everyoneAnswered = totalPlayers > 0 && answeredCount >= totalPlayers;

  // SVG Circular Gauge calculations
  const size = compact ? 54 : 76;
  const strokeWidth = compact ? 5 : 7;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-lg",
        pacingColor === "rose"
          ? "border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-rose-950/60 text-white shadow-rose-900/20"
          : pacingColor === "amber"
            ? "border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-slate-900/90 text-white shadow-amber-900/20"
            : pacingColor === "blue"
              ? "border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-slate-900/90 text-white shadow-cyan-900/20"
              : "border-teal-500/40 bg-gradient-to-r from-teal-950/50 via-slate-900/90 to-indigo-950/50 text-white shadow-teal-900/20",
        className
      )}
    >
      {/* Top ambient glow light */}
      <div
        className={cx(
          "pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-72 rounded-full blur-2xl opacity-60 transition-colors duration-500",
          pacingColor === "rose"
            ? "bg-rose-500"
            : pacingColor === "amber"
              ? "bg-amber-400"
              : pacingColor === "blue"
                ? "bg-cyan-400"
                : "bg-teal-400"
        )}
      />

      <div className={compact ? "p-3" : "p-4 sm:p-5"}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: Question info & Pacing status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">
                প্রশ্ন {questionIndex + 1}/{totalQuestions}
              </span>
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black border backdrop-blur-md",
                  pacingColor === "rose"
                    ? "bg-rose-500/20 border-rose-400/40 text-rose-300 animate-pulse"
                    : pacingColor === "amber"
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                      : pacingColor === "blue"
                        ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                        : "bg-teal-500/20 border-teal-400/40 text-teal-300"
                )}
              >
                {pacingLabel}
              </span>
            </div>

            {/* Answer completion progress */}
            <div className="mt-2 flex items-center gap-3">
              <div className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <span>👥 উত্তর জমা:</span>
                <span className="font-black text-white tabular-nums">
                  {answeredCount}/{totalPlayers}
                </span>
                <span className="text-white/60 font-semibold">({answerPct}%)</span>
              </div>
              {everyoneAnswered && !revealed && (
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full animate-bounce">
                  ✨ সবাই উত্তর দিয়েছে!
                </span>
              )}
            </div>
          </div>

          {/* Right: Circular Visual Countdown Gauge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative grid place-items-center">
              <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
                {/* Background track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={strokeWidth}
                />
                {/* Active progress track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={
                    pacingColor === "rose"
                      ? "#f43f5e"
                      : pacingColor === "amber"
                        ? "#f59e0b"
                        : pacingColor === "blue"
                          ? "#06b6d4"
                          : "#14b8a6"
                  }
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 0.2s linear, stroke 0.4s ease",
                    filter: isUrgent ? "drop-shadow(0 0 6px rgba(244,63,94,0.8))" : undefined,
                  }}
                />
              </svg>

              {/* Centered digits */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={cx(
                    "font-black tracking-tighter tabular-nums leading-none",
                    compact ? "text-lg" : "text-2xl",
                    isUrgent && "animate-ping text-rose-300",
                    pacingColor === "rose"
                      ? "text-rose-300"
                      : pacingColor === "amber"
                        ? "text-amber-300"
                        : "text-white"
                  )}
                >
                  {paused ? "⏸" : revealed ? "✓" : secs}
                </span>
                {!compact && !paused && !revealed && (
                  <span className="text-[9px] font-bold text-white/50 uppercase leading-none mt-0.5">
                    সেকেন্ড
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Linear Countdown Bar with Glowing Pulse */}
        <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full bg-slate-950/70 border border-white/10 shadow-inner">
          <div
            className={cx(
              "h-full rounded-full transition-all duration-200",
              pacingColor === "rose"
                ? "bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                : pacingColor === "amber"
                  ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                  : pacingColor === "blue"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.6)]"
            )}
            style={{ width: `${pct * 100}%` }}
          />
        </div>

        {/* Pacing Management Controls (Quick Adjustments) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-white/60">সময় বাড়ান:</span>
            {[5, 10, 30].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onExtend?.(s)}
                disabled={revealed}
                className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-black text-white hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title={`টাইমারে +${s} সেকেন্ড যুক্ত করুন`}
              >
                +{s}s
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {onTogglePause && !revealed && (
              <button
                type="button"
                onClick={onTogglePause}
                className={cx(
                  "rounded-lg px-3 py-1 text-xs font-black transition active:scale-95 cursor-pointer flex items-center gap-1",
                  paused
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30"
                    : "border border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
                )}
              >
                <span>{paused ? "▶️ চালু করুন" : "⏸️ পজ করুন"}</span>
              </button>
            )}

            {onReveal && !revealed && (
              <button
                type="button"
                onClick={onReveal}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-xs font-black text-white shadow-md hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1"
                title="উত্তর প্রকাশ করে বিশ্লেষণ দেখান"
              >
                <span>👁️ উত্তর দেখান</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
