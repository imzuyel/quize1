"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge, Button, Card, cx } from "@/components/ui";
import { getFunnyRemark } from "@/lib/quiz-feedback";

export type CompletedQuizInfo = {
  pin?: string;
  quizTitle?: string;
  score: number;
  rank: number;
  totalPlayers: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  answeredCount?: number;
  completedAt?: number;
};

export function QuizResultFeedbackCard({
  result,
  onDismiss,
  compact = false,
  showActions = true,
  className = "",
}: {
  result: CompletedQuizInfo;
  onDismiss?: () => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}) {
  const remark = useMemo(
    () =>
      getFunnyRemark({
        rank: result.rank,
        totalPlayers: result.totalPlayers,
        accuracy: result.accuracy,
        score: result.score,
      }),
    [result.rank, result.totalPlayers, result.accuracy, result.score],
  );

  return (
    <Card
      className={cx(
        "relative overflow-hidden border-2 shadow-lg transition-all animate-in fade-in-50 zoom-in-95",
        remark.bgClass,
        remark.borderClass,
        className,
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-3xl select-none" role="img" aria-label="icon">
            {remark.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                tone={
                  remark.tier === "champion"
                    ? "gold"
                    : remark.tier === "podium"
                      ? "blue"
                      : remark.tier === "good"
                        ? "teal"
                        : "coral"
                }
                className="text-xs font-black px-2.5 py-0.5 shadow-2xs"
              >
                {remark.badge}
              </Badge>
              {result.totalPlayers > 1 && (
                <span className="text-xs font-semibold text-slate-500">
                  (মোট {result.totalPlayers} জনের মধ্যে)
                </span>
              )}
            </div>
            <h3 className={cx("mt-1 font-black leading-tight", compact ? "text-base" : "text-lg", remark.colorClass)}>
              {result.rank === 1
                ? "🥇 অভিনন্দন! আপনি ১ম স্থান অধিকার করেছেন!"
                : result.rank === 2
                  ? "🥈 দারুণ! আপনি ২য় স্থান অধিকার করেছেন!"
                  : result.rank === 3
                    ? "🥉 দুর্দান্ত! আপনি ৩য় স্থান অধিকার করেছেন!"
                    : `🏁 আপনার পজিশন: #${result.rank} স্থান`}
            </h3>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
            title="বন্ধ করুন"
          >
            ✕
          </button>
        )}
      </div>

      {/* Funny Bangladeshi Student Quote / Roast */}
      <div className="mt-3.5 rounded-2xl bg-white/90 p-3.5 sm:p-4 shadow-sm border border-black/5">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl leading-none">💬</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              মজার রিভিউ ও পারফরম্যান্স মন্তব্য
            </p>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              &ldquo;{remark.quote}&rdquo;
            </p>
            <p className="mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>💡 পরামর্শ:</span>
              <span>{remark.advice}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats Bar */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-white/80 p-2 border border-black/5 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">অর্জিত স্কোর</p>
          <p className="mt-0.5 text-base font-black text-slate-900 tabular-nums">
            {Math.round(result.score)}
          </p>
        </div>
        <div className="rounded-xl bg-white/80 p-2 border border-black/5 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">নির্ভুলতা</p>
          <p
            className={cx(
              "mt-0.5 text-base font-black tabular-nums",
              result.accuracy >= 70
                ? "text-emerald-700"
                : result.accuracy >= 45
                  ? "text-amber-700"
                  : "text-rose-700",
            )}
          >
            {Math.round(result.accuracy)}%
          </p>
        </div>
        <div className="rounded-xl bg-white/80 p-2 border border-black/5 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">সঠিক উত্তর</p>
          <p className="mt-0.5 text-base font-black text-slate-900 tabular-nums">
            <span className="text-emerald-600">{result.correctCount}</span>
            <span className="text-slate-400 font-normal text-xs">
              /{result.totalQuestions || result.answeredCount || 0}
            </span>
          </p>
        </div>
      </div>

      {/* Action CTA Buttons */}
      {showActions && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
          <Link href="/student/practice" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="gold" className="w-full font-bold text-xs text-slate-950">
              📚 দুর্বল বিষয় অনুশীলন করুন
            </Button>
          </Link>
          <Link href="/join" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="w-full font-bold text-xs bg-white">
              🎮 নতুন কুইজে যোগ দিন
            </Button>
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-slate-500 hover:text-slate-800 ml-auto px-2 py-1 font-semibold"
            >
              ঠিক আছে
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
