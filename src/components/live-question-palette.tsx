"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, cx } from "@/components/ui";
import type { LivePaletteItem } from "@/lib/quiz-settings";

export function LiveQuestionPalette({
  palette = [],
  currentIndex = 0,
  totalPlayers = 0,
  onJump,
  compact = false,
  className = "",
}: {
  palette?: LivePaletteItem[];
  currentIndex?: number;
  totalPlayers?: number;
  onJump?: (index: number) => void;
  compact?: boolean;
  className?: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [filterStruggleOnly, setFilterStruggleOnly] = useState(false);

  // If none selected, default to inspecting currently active question
  const activeQuestion = palette[currentIndex] ?? null;
  const inspectedIdx = selectedIdx !== null ? selectedIdx : currentIndex;
  const inspectedItem = palette[inspectedIdx] ?? activeQuestion;

  const strugglingCount = useMemo(
    () => palette.filter((p) => p.isStruggling).length,
    [palette],
  );

  const displayedList = useMemo(() => {
    if (filterStruggleOnly) {
      return palette.filter((p) => p.isStruggling);
    }
    return palette;
  }, [palette, filterStruggleOnly]);

  if (!palette.length) {
    return (
      <Card className={cx("bg-white/95 text-slate-900", className)}>
        <p className="text-xs font-bold uppercase text-slate-400">প্রশ্ন প্যালেট</p>
        <p className="mt-2 text-xs text-slate-400">কোনো প্রশ্ন লোড হয়নি</p>
      </Card>
    );
  }

  return (
    <Card className={cx("bg-white/95 text-slate-900 shadow-sm border border-slate-200/80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🗺️</span>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              প্রশ্ন প্যালেট
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {currentIndex + 1}/{palette.length}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            রিয়েল-টাইম অংশগ্রহণ ও নির্ভুলতা বিশ্লেষণ
          </p>
        </div>

        {strugglingCount > 0 ? (
          <button
            onClick={() => setFilterStruggleOnly((v) => !v)}
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black transition shadow-sm",
              filterStruggleOnly
                ? "bg-rose-600 text-white ring-2 ring-rose-300"
                : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300",
            )}
            title="শুধু সমস্যাযুক্ত প্রশ্নগুলো ফিল্টার করুন"
          >
            <span>⚠️</span>
            <span>{strugglingCount} স্ট্রাগল</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <span>✅</span>
            <span>স্বাভাবিক</span>
          </span>
        )}
      </div>

      {/* Real-time Alert Banner if there are struggling questions */}
      {strugglingCount > 0 && !filterStruggleOnly && (
        <div className="mt-2.5 rounded-xl bg-amber-50/90 p-2.5 text-xs text-amber-900 border border-amber-200 flex items-start gap-2">
          <span className="text-base leading-none">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold">শিক্ষার্থীরা কিছু প্রশ্নে সমস্যায় পড়ছে:</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              প্রশ্ন{" "}
              {palette
                .filter((p) => p.isStruggling)
                .map((p) => `#${p.index + 1}`)
                .join(", ")}{" "}
              এর নির্ভুলতা ৫০% এর নিচে। যেকোনো প্রশ্নে ক্লিক করে বিস্তারিত দেখুন।
            </p>
          </div>
        </div>
      )}

      {/* Grid of question tiles - Mirroring the Student Exam Runner Palette */}
      <div className="mt-3">
        <div
          className={cx(
            "grid gap-1.5",
            compact
              ? "grid-cols-5 sm:grid-cols-6"
              : "grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-5 xl:grid-cols-6",
          )}
        >
          {displayedList.map((p) => {
            const isCurrent = p.index === currentIndex;
            const isSelected = p.index === inspectedIdx;
            const hasAccuracy = p.accuracy !== null && p.answeredCount > 0;
            const isMastered = hasAccuracy && p.accuracy! >= 75;
            const isModerate = hasAccuracy && p.accuracy! >= 50 && p.accuracy! < 75;
            const isStruggling = p.isStruggling;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedIdx(p.index)}
                title={`প্রশ্ন ${p.index + 1}: ${p.text} | উত্তর: ${p.answeredCount}/${totalPlayers} | নির্ভুলতা: ${p.accuracy ?? "-"}%`}
                className={cx(
                  "relative flex flex-col items-center justify-center rounded-xl p-1.5 transition-all text-xs font-bold aspect-square select-none",
                  // Current Active Question
                  isCurrent
                    ? "bg-slate-900 text-white shadow-md ring-2 ring-teal-400 ring-offset-2 ring-offset-white z-10 scale-105"
                    : isStruggling
                      ? "bg-rose-100 text-rose-900 border-2 border-rose-400 hover:bg-rose-200"
                      : isMastered
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                        : isModerate
                          ? "bg-sky-100 text-sky-900 border border-sky-300 hover:bg-sky-200"
                          : p.answeredCount > 0
                            ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/70",
                  // Selection border
                  isSelected && !isCurrent && "ring-2 ring-indigo-500 ring-offset-1",
                )}
              >
                {/* Live pulsing dot or warning on top right */}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                  </span>
                )}
                {isStruggling && !isCurrent && (
                  <span className="absolute -top-1 -right-1 text-[10px]" title="শিক্ষার্থীরা সমস্যায় পড়েছে">
                    ⚠️
                  </span>
                )}

                <span className={cx("text-xs font-extrabold", isCurrent ? "text-white" : "")}>
                  {p.index + 1}
                </span>

                {/* Sub-label: Accuracy or Submissions */}
                {p.answeredCount > 0 ? (
                  <span
                    className={cx(
                      "text-[9px] tabular-nums font-semibold leading-none mt-0.5",
                      isCurrent
                        ? "text-teal-300"
                        : isStruggling
                          ? "text-rose-700 font-black"
                          : isMastered
                            ? "text-emerald-700"
                            : "text-slate-500",
                    )}
                  >
                    {p.accuracy !== null ? `${p.accuracy}%` : `${p.answeredCount}`}
                  </span>
                ) : (
                  <span
                    className={cx(
                      "text-[8px] leading-none mt-0.5 opacity-60",
                      isCurrent ? "text-slate-300" : "text-slate-400",
                    )}
                  >
                    {isCurrent ? "চলমান" : "আসন্ন"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend - Mirroring the Student Exam Runner Palette */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-slate-900 ring-1 ring-teal-400" />
          <span>চলমান</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-rose-200 border border-rose-400" />
          <span>⚠️ স্ট্রাগল (&lt;৫০%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-emerald-200 border border-emerald-300" />
          <span>সফল (≥৭৫%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-sky-200 border border-sky-300" />
          <span>মাঝারি</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-slate-100 border border-slate-200" />
          <span>বাকি</span>
        </div>
      </div>

      {/* Detailed Question Inspector Card */}
      {inspectedItem && (
        <div className="mt-3.5 rounded-2xl bg-slate-50 p-3 border border-slate-200 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900">
                  প্রশ্ন {inspectedItem.index + 1}
                </span>
                {inspectedItem.index === currentIndex && (
                  <Badge tone="teal" className="text-[10px] py-0 px-2 font-bold">
                    ⚡ বর্তমান প্রশ্ন
                  </Badge>
                )}
                {inspectedItem.isStruggling && (
                  <Badge tone="coral" className="text-[10px] py-0 px-2 font-black">
                    ⚠️ স্ট্রাগলিং
                  </Badge>
                )}
                <span className="text-[10px] text-slate-500 font-medium">
                  {inspectedItem.type === "multiple_choice"
                    ? "বহুনির্বাচনী"
                    : inspectedItem.type === "true_false"
                      ? "সত্য/মিথ্যা"
                      : inspectedItem.type}
                </span>
                <span className="text-[10px] text-slate-400">
                  {inspectedItem.marks} মার্কস · {inspectedItem.timer}s
                </span>
              </div>
              <p className="mt-1 font-medium text-slate-800 line-clamp-2 leading-relaxed">
                {inspectedItem.text}
              </p>
            </div>
          </div>

          {/* Real-time stats row */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-xl bg-white p-2 border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] text-slate-400">উত্তর জমা</p>
              <p className="text-sm font-black text-slate-800 tabular-nums">
                {inspectedItem.answeredCount}
                <span className="text-[10px] font-normal text-slate-400">/{totalPlayers}</span>
              </p>
            </div>

            <div
              className={cx(
                "rounded-xl p-2 border shadow-2xs",
                inspectedItem.isStruggling
                  ? "bg-rose-50/80 border-rose-200 text-rose-900"
                  : inspectedItem.accuracy !== null && inspectedItem.accuracy >= 75
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                    : "bg-white border-slate-200/80 text-slate-800",
              )}
            >
              <p className="text-[10px] opacity-75">নির্ভুলতা</p>
              <p className="text-sm font-black tabular-nums">
                {inspectedItem.accuracy !== null ? `${inspectedItem.accuracy}%` : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-white p-2 border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] text-slate-400">সঠিক / ভুল</p>
              <p className="text-xs font-black text-slate-800 tabular-nums">
                <span className="text-emerald-600">{inspectedItem.correctCount}</span>
                {" / "}
                <span className="text-rose-600">
                  {Math.max(0, inspectedItem.answeredCount - inspectedItem.correctCount)}
                </span>
              </p>
            </div>
          </div>

          {/* Teacher guidance message if struggling */}
          {inspectedItem.isStruggling && (
            <div className="mt-2 rounded-xl bg-rose-50 p-2 text-[11px] text-rose-800 border border-rose-200/70 flex items-center gap-1.5">
              <span>💡</span>
              <span>
                শিক্ষার্থীরা এই প্রশ্নে বেশি ভুল করেছে। আপনি প্রয়োজনে এই প্রশ্নে গিয়ে বিস্তারিত আলোচনা করতে পারেন।
              </span>
            </div>
          )}

          {/* Jump / Navigate button for teacher */}
          {onJump && inspectedItem.index !== currentIndex && (
            <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500">
                এই প্রশ্নে সেশন নিয়ে যেতে চান?
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs"
                onClick={() => onJump(inspectedItem.index)}
              >
                ➡️ প্রশ্ন #{inspectedItem.index + 1} এ যান
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
