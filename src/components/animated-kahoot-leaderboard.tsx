"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { parsePlayerAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui";

export interface LeaderboardPlayer {
  id: number;
  nickname: string;
  score: number;
  streak?: number;
  correctCount?: number;
  answeredCount?: number;
  connected?: boolean;
}

interface AnimatedKahootLeaderboardProps {
  players: LeaderboardPlayer[];
  currentIndex: number;
  totalQuestions: number;
  onNext?: () => void;
  onClose?: () => void;
  onFinish?: () => void;
  isHost?: boolean;
  limit?: number;
}

export function AnimatedKahootLeaderboard({
  players,
  currentIndex,
  totalQuestions,
  onNext,
  onClose,
  onFinish,
  isHost = true,
  limit = 10,
}: AnimatedKahootLeaderboardProps) {
  // Keep track of previous positions to calculate rank changes (slow motion rank shift)
  const prevRanksRef = useRef<Map<number, number>>(new Map());
  const [rankDeltas, setRankDeltas] = useState<Record<number, number>>({});

  // Sort players by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score).slice(0, limit);

  useEffect(() => {
    const deltas: Record<number, number> = {};
    const nextRanks = new Map<number, number>();

    sorted.forEach((p, idx) => {
      const currentRank = idx + 1;
      nextRanks.set(p.id, currentRank);
      if (prevRanksRef.current.has(p.id)) {
        const prevRank = prevRanksRef.current.get(p.id)!;
        deltas[p.id] = prevRank - currentRank; // positive = moved up
      } else {
        deltas[p.id] = 0;
      }
    });

    setRankDeltas(deltas);
    prevRanksRef.current = nextRanks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-gradient-to-br from-amber-500/20 via-fuchsia-500/20 to-cyan-500/20 blur-3xl" />

      {/* HEADER */}
      <header className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg shadow-amber-950/40">
            🏆
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              লাইভ লিডারবোর্ড
            </h2>
            <p className="text-xs font-semibold text-white/60">
              প্রশ্ন {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions} এর স্কোরবোর্ড
            </p>
          </div>
        </div>

        {isHost && (
          <div className="flex items-center gap-2">
            {onClose ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10"
              >
                ✕ বন্ধ করুন
              </Button>
            ) : null}

            {onNext ? (
              <Button
                size="md"
                onClick={onNext}
                className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-transform"
              >
                {isLastQuestion ? "🏁 ফাইনাল ফলাফল" : `➡️ পরবর্তী প্রশ্ন (${currentIndex + 2}/${totalQuestions})`}
              </Button>
            ) : null}

            {isLastQuestion && onFinish ? (
              <Button
                size="md"
                onClick={onFinish}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black"
              >
                🏁 সমাপ্ত ঘোষণা
              </Button>
            ) : null}
          </div>
        )}
      </header>

      {/* LEADERBOARD LIST WITH SLOW-MOTION LAYOUT ANIMATION */}
      <div className="relative z-10 mt-6 space-y-2.5">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-white/50">
            <p className="text-4xl">⏳</p>
            <p className="mt-2 text-sm font-semibold">এখনো কোনো উত্তর জমা পড়েনি</p>
          </div>
        ) : (
          <ol className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {sorted.map((p, idx) => {
                const rank = idx + 1;
                const { avatar, name, bg } = parsePlayerAvatar(p.nickname, p.id);
                const delta = rankDeltas[p.id] ?? 0;

                // Color styling based on rank
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                const borderClass = isFirst
                  ? "border-amber-400/60 bg-gradient-to-r from-amber-500/25 via-amber-400/10 to-transparent ring-1 ring-amber-400/40"
                  : isSecond
                    ? "border-slate-300/50 bg-gradient-to-r from-slate-400/20 via-slate-300/10 to-transparent"
                    : isThird
                      ? "border-amber-700/50 bg-gradient-to-r from-amber-700/20 via-amber-600/10 to-transparent"
                      : "border-white/10 bg-white/5 hover:bg-white/10";

                return (
                  <motion.li
                    key={p.id}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 45,
                        damping: 14,
                        mass: 1.1,
                      },
                      opacity: { duration: 0.3 },
                    }}
                    className={`group relative flex items-center gap-3 sm:gap-4 rounded-2xl border ${borderClass} p-3 sm:p-4 backdrop-blur-md transition-shadow shadow-md hover:shadow-xl`}
                  >
                    {/* Rank Badge */}
                    <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 font-black text-base sm:text-lg">
                      {isFirst ? (
                        <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">🥇</span>
                      ) : isSecond ? (
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]">🥈</span>
                      ) : isThird ? (
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]">🥉</span>
                      ) : (
                        <span className="font-mono text-white/80">{rank}</span>
                      )}
                    </div>

                    {/* Avatar Icon */}
                    <div
                      className={`relative grid h-11 w-11 sm:h-13 sm:w-13 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${bg} text-2xl sm:text-3xl shadow-lg border border-white/10 overflow-hidden transform group-hover:scale-105 transition-all duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                      <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] select-none z-10">
                        {avatar}
                      </span>
                    </div>

                    {/* Player Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base sm:text-lg font-black text-white">
                          {name}
                        </span>
                        {p.streak && p.streak >= 2 ? (
                          <span className="rounded-full bg-orange-500/20 border border-orange-400/40 px-2 py-0.5 text-[11px] font-bold text-orange-300">
                            🔥 {p.streak}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
                        {p.answeredCount ? (
                          <span>
                            সঠিক: {p.correctCount ?? 0}/{p.answeredCount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Rank Delta Indicator (Slow Motion movement indicator) */}
                    <div className="flex items-center justify-center min-w-[52px]">
                      {delta > 0 ? (
                        <motion.span
                          initial={{ scale: 0.5, y: 5 }}
                          animate={{ scale: [1, 1.25, 1], y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center gap-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-1 text-xs font-black text-emerald-300 shadow"
                          title={`${delta} ধাপ উপরে উঠেছে!`}
                        >
                          ▲ +{delta}
                        </motion.span>
                      ) : delta < 0 ? (
                        <motion.span
                          initial={{ scale: 0.5, y: -5 }}
                          animate={{ scale: 1, y: 0 }}
                          className="flex items-center gap-0.5 rounded-lg bg-rose-500/20 border border-rose-400/40 px-2 py-1 text-xs font-black text-rose-300"
                          title={`${Math.abs(delta)} ধাপ নিচে নেমেছে`}
                        >
                          ▼ {delta}
                        </motion.span>
                      ) : (
                        <span className="text-xs font-bold text-white/30">—</span>
                      )}
                    </div>

                    {/* Score (Animated Ticker) */}
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-amber-300">
                        {Math.round(p.score).toLocaleString()}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                        পয়েন্ট
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>

      {/* FOOTER NOTICE */}
      <footer className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/50">
        <span>💡 প্রতিটি প্রশ্নের দ্রুত সঠিক উত্তরের উপর নির্ভর করে র‍্যাংক নির্ধারিত হয়</span>
        {onNext && (
          <button
            onClick={onNext}
            className="font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
          >
            পরবর্তী প্রশ্নে এগিয়ে যান ➔
          </button>
        )}
      </footer>
    </div>
  );
}
