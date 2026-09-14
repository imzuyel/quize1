"use client";

import React, { ReactNode, useMemo } from "react";
import { QuizPlateId, resolveQuizPlate, QUIZ_PLATES } from "@/lib/quiz-plates";
import { cx } from "./ui";

export interface QuizPlateProps {
  plateStyle?: string | null;
  questionIndex: number;
  totalQuestions?: number;
  questionText: string;
  options: string[];
  type?: string;
  selected?: (string | number)[];
  onSelect?: (index: number) => void;
  disabled?: boolean;
  reveal?: boolean;
  correct?: (string | number)[];
  hidden?: number[];
  hint?: string | null;
  explanation?: string | null;
  timerNode?: ReactNode;
  headerBadge?: ReactNode;
  footerNode?: ReactNode;
  mode?: "host" | "player" | "preview";
  className?: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizPlate({
  plateStyle,
  questionIndex,
  totalQuestions,
  questionText,
  options,
  type = "single_choice",
  selected = [],
  onSelect,
  disabled = false,
  reveal = false,
  correct = [],
  hidden = [],
  hint,
  explanation,
  timerNode,
  headerBadge,
  footerNode,
  mode = "player",
  className = "",
}: QuizPlateProps) {
  // Resolve actual plate (if teacher picked 'auto' or nothing, rotates per question!)
  const actualPlate = useMemo(() => {
    return resolveQuizPlate(plateStyle, questionIndex);
  }, [plateStyle, questionIndex]);

  const multi = type === "multi_select" || type === "poll";
  const isHost = mode === "host";

  // Normalize correct indices
  const correctIndices = useMemo(() => (correct ?? []).map(Number), [correct]);
  const selectedIndices = useMemo(() => (selected ?? []).map(Number), [selected]);

  /* -------------------------------------------------------------------------- */
  /* 1. NEON SUNSET PLATE (Inspired by images (6).jpeg)                          */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "neon_sunset") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-[#090a18] p-5 sm:p-7 border-2 border-transparent",
          "shadow-[0_0_35px_rgba(244,63,94,0.35)]",
          className
        )}
        style={{
          borderImage: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6) 1",
          boxShadow: "0 0 35px rgba(244, 63, 94, 0.35), inset 0 0 30px rgba(236, 72, 153, 0.15)",
        }}
      >
        {/* Subtle background tech grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ec489915_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Top Header / Question Box */}
        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-4 sm:p-6 shadow-[0_8px_25px_rgba(244,63,94,0.4)] text-center">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="rounded-full bg-black/25 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">
              {headerBadge || `প্রশ্ন ${questionIndex + 1}${totalQuestions ? ` / ${totalQuestions}` : ""}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2 className={cx("font-black tracking-wide text-white drop-shadow-md", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
            {questionText}
          </h2>
        </div>

        {/* Layout: Options on left, Big stylized gradient Question Mark on right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 xl:col-span-9 space-y-3">
            {options.map((opt, i) => {
              const isSel = selectedIndices.includes(i);
              const isCor = reveal && correctIndices.includes(i);
              const isWrn = reveal && isSel && !isCor;
              if (hidden.includes(i)) {
                return <div key={i} className="h-14 rounded-full border border-slate-800 bg-black/20" />;
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect?.(i)}
                  className={cx(
                    "group relative flex w-full items-center gap-3.5 rounded-full px-5 py-3.5 text-left transition-all duration-200",
                    "border-2 bg-[#0d1026] text-white shadow-lg",
                    isCor
                      ? "border-emerald-400 bg-emerald-950/80 shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                      : isWrn
                      ? "border-rose-500 bg-rose-950/70 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                      : isSel
                      ? "border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.5)] ring-2 ring-amber-300"
                      : "border-cyan-400/80 hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.5)]",
                    disabled && "cursor-default"
                  )}
                >
                  <span
                    className={cx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black transition-colors",
                      isCor
                        ? "bg-emerald-400 text-slate-950 font-black"
                        : isWrn
                        ? "bg-rose-500 text-white font-black"
                        : isSel
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-cyan-400/20 text-cyan-300 border border-cyan-400/50 group-hover:bg-cyan-400 group-hover:text-slate-950"
                    )}
                  >
                    {OPTION_LETTERS[i % OPTION_LETTERS.length]}
                  </span>
                  <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                  {reveal && isCor && <span className="text-xl">✅</span>}
                  {reveal && isWrn && <span className="text-xl">❌</span>}
                  {!reveal && isSel && <span className="text-amber-300 text-lg">✔</span>}
                </button>
              );
            })}
          </div>

          {/* Big Stylized Neon Question Mark (Direct from Image 1) */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 items-center justify-center">
            <div className="relative select-none">
              <span
                className="text-[140px] xl:text-[170px] font-black leading-none bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 0 24px rgba(244, 63, 94, 0.7))",
                }}
              >
                ?
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-md">
                <span className="text-[140px] xl:text-[170px] font-black leading-none text-rose-500">?</span>
              </div>
            </div>
          </div>
        </div>

        {hint && (
          <div className="relative z-10 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-200">
            💡 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 p-3 text-sm text-cyan-200">
            ✨ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. ROYAL STARLIGHT PLATE (Inspired by images (7).jpeg)                      */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "royal_starlight") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#6b21a8] via-[#581c87] to-[#3b0764] p-5 sm:p-8 text-white",
          "shadow-[0_0_40px_rgba(147,51,234,0.45)] border border-purple-400/40",
          className
        )}
      >
        {/* Floating Sparkle Stars */}
        <span className="absolute top-4 left-6 text-yellow-300 text-2xl select-none animate-pulse">✦</span>
        <span className="absolute top-8 right-8 text-yellow-300 text-xl select-none animate-bounce">✨</span>
        <span className="absolute bottom-6 left-12 text-yellow-300 text-lg select-none opacity-80">★</span>
        <span className="absolute bottom-10 right-14 text-yellow-300 text-2xl select-none">✦</span>

        {/* Top White Pill Question Banner with Golden Stars on Corners */}
        <div className="relative z-10 mx-auto max-w-4xl mb-7">
          <div className="relative rounded-full bg-white text-purple-950 px-6 sm:px-10 py-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.35)] border-4 border-purple-200">
            {/* Star on Top Left */}
            <div className="absolute -top-3 -left-3 flex items-center justify-center h-9 w-9 rounded-full bg-yellow-400 shadow-lg text-slate-950 font-black text-base border-2 border-white">
              ✦
            </div>
            {/* Star on Top Right */}
            <div className="absolute -top-3 -right-3 flex items-center justify-center h-9 w-9 rounded-full bg-yellow-400 shadow-lg text-slate-950 font-black text-base border-2 border-white">
              ✦
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-black text-purple-900">
                {headerBadge || `QUIZ · প্রশ্ন ${questionIndex + 1}`}
              </span>
              {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
            </div>

            <h2 className={cx("font-black tracking-tight text-purple-950", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
              {questionText}
            </h2>
          </div>
        </div>

        {/* Options in 2x2 Clean Pill Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) {
              return <div key={i} className="h-14 rounded-full bg-white/10" />;
            }

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex items-center gap-3 rounded-full px-5 py-4 text-left transition-all duration-200",
                  "shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-98",
                  isCor
                    ? "bg-emerald-400 text-slate-950 ring-4 ring-emerald-300 font-black"
                    : isWrn
                    ? "bg-rose-500 text-white ring-4 ring-rose-300 font-black"
                    : isSel
                    ? "bg-amber-300 text-slate-950 ring-4 ring-yellow-400 font-black"
                    : "bg-white text-purple-950 hover:bg-purple-50 hover:scale-[1.02]",
                  disabled && "cursor-default"
                )}
              >
                {/* Golden Star Accent on each option pill */}
                <span
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black",
                    isCor
                      ? "bg-slate-950 text-emerald-300"
                      : isWrn
                      ? "bg-slate-950 text-rose-300"
                      : isSel
                      ? "bg-purple-950 text-yellow-300"
                      : "bg-purple-100 text-purple-900 group-hover:bg-yellow-400 group-hover:text-purple-950"
                  )}
                >
                  {OPTION_LETTERS[i % OPTION_LETTERS.length]}:
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl">🌟</span>}
                {reveal && isWrn && <span className="text-xl">❌</span>}
                {!reveal && isSel && <span className="text-purple-950 text-lg">✔</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-5 max-w-4xl mx-auto rounded-2xl bg-white/15 border border-white/20 p-3 text-xs text-yellow-200">
            💡 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 max-w-4xl mx-auto rounded-2xl bg-white/20 border border-white/30 p-3.5 text-sm text-white">
            ⭐ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4 max-w-4xl mx-auto">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. CYBER SYNTHWAVE PLATE (Inspired by images (8).jpeg)                       */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "cyber_synthwave") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-[#090b16] p-5 sm:p-8 text-white",
          "border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)]",
          className
        )}
      >
        {/* Subtle Cyberpunk Neon Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,72,153,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top Dual Neon Pill Box (Blue to Magenta Glow) */}
        <div className="relative z-10 mb-6 rounded-full border-2 border-transparent bg-slate-900/90 p-5 sm:p-7 text-center backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.4),inset_0_0_15px_rgba(6,182,212,0.2)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-0.5 text-xs font-mono font-bold text-cyan-300">
              {headerBadge || `QUESTION // ${String(questionIndex + 1).padStart(2, "0")}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2
            className={cx(
              "font-black tracking-wide text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]",
              isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
            )}
          >
            {questionText}
          </h2>
        </div>

        {/* 2x2 Dual Glow Capsule Pill Options */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) {
              return <div key={i} className="h-14 rounded-full border border-slate-800 bg-slate-950/40" />;
            }

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex items-center gap-3.5 rounded-full px-5 py-4 text-left transition-all duration-200",
                  "bg-slate-950/90 backdrop-blur-md border-2",
                  isCor
                    ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.7)] text-emerald-300 font-black"
                    : isWrn
                    ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.7)] text-rose-300 font-black"
                    : isSel
                    ? "border-fuchsia-400 shadow-[0_0_25px_rgba(232,121,249,0.7)] text-fuchsia-200 font-black"
                    : "border-cyan-400/70 hover:border-fuchsia-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] text-slate-100",
                  disabled && "cursor-default"
                )}
              >
                <span
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-mono font-black",
                    isCor
                      ? "bg-emerald-400 text-slate-950"
                      : isWrn
                      ? "bg-rose-500 text-white"
                      : isSel
                      ? "bg-fuchsia-400 text-slate-950"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 group-hover:border-fuchsia-400 group-hover:text-fuchsia-300"
                  )}
                >
                  {OPTION_LETTERS[i % OPTION_LETTERS.length]}
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl">⚡</span>}
                {reveal && isWrn && <span className="text-xl">❌</span>}
                {!reveal && isSel && <span className="text-fuchsia-300 text-lg">✔</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-2.5 text-xs text-cyan-300">
            ⚡ <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 p-3 text-sm text-fuchsia-200">
            👾 <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 4. 3D CLAYMORPHISM SOFT PLATE (Inspired by images (9).jpeg)                 */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "clay_morphism") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-slate-100 p-6 sm:p-9 text-slate-800",
          "shadow-[16px_16px_36px_rgba(163,177,198,0.6),-16px_-16px_36px_rgba(255,255,255,0.9)] border border-white/80",
          className
        )}
      >
        {/* Subtle Concentric Rings Backdrop Pattern (Direct from Image 4) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
          {[120, 220, 320, 420, 520].map((size, idx) => (
            <div
              key={idx}
              className="absolute rounded-full border border-purple-400/30"
              style={{ width: size, height: size }}
            />
          ))}
        </div>

        {/* Top Magenta-Coral Gradient Tab Header */}
        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-4 sm:p-6 text-white text-center shadow-[0_8px_20px_rgba(219,39,119,0.35)]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-black uppercase text-white tracking-wider">
              {headerBadge || `প্রশ্ন ${questionIndex + 1}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2 className={cx("font-black tracking-tight text-white", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
            {questionText}
          </h2>
        </div>

        {/* 3D Extruded White Clay Option Pills */}
        <div className="relative z-10 space-y-3.5 max-w-3xl mx-auto">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) {
              return <div key={i} className="h-14 rounded-full bg-slate-200/50" />;
            }

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex w-full items-center gap-3.5 rounded-full px-5 py-3.5 text-left transition-all duration-200",
                  isCor
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)]"
                    : isWrn
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_8px_24px_rgba(244,63,94,0.4)]"
                    : isSel
                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-[0_8px_24px_rgba(244,63,94,0.4)] ring-4 ring-pink-300/60"
                    : "bg-white text-slate-800 shadow-[6px_6px_16px_rgba(163,177,198,0.5),-6px_-6px_16px_rgba(255,255,255,0.9)] hover:scale-[1.01]",
                  disabled && "cursor-default"
                )}
              >
                {/* Circular Badge Button (A, B, C) */}
                <span
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black shadow-inner",
                    isCor || isWrn || isSel
                      ? "bg-white text-pink-600 shadow"
                      : "bg-pink-500 text-white"
                  )}
                >
                  {isCor ? "✓" : isWrn ? "✕" : isSel ? "✓" : OPTION_LETTERS[i % OPTION_LETTERS.length]}
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl text-white">✅</span>}
                {reveal && isWrn && <span className="text-xl text-white">❌</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-5 max-w-3xl mx-auto rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-medium">
            💡 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 max-w-3xl mx-auto rounded-2xl bg-purple-50 border border-purple-200 p-3.5 text-sm text-purple-900">
            ✨ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4 max-w-3xl mx-auto">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 5. GOLDEN ROYALE CHAMPION PLATE                                             */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "golden_royale") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-[#0b0c10] p-5 sm:p-8 text-white",
          "border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.35)]",
          className
        )}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

        {/* Shimmering Golden Banner */}
        <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-4 sm:p-6 text-slate-950 text-center shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="rounded-full bg-black/15 px-3 py-0.5 text-xs font-black uppercase text-slate-950 tracking-wider">
              👑 {headerBadge || `ROYAL ROUND · প্রশ্ন ${questionIndex + 1}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2 className={cx("font-black tracking-tight text-slate-950", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
            {questionText}
          </h2>
        </div>

        {/* 2x2 Metallic Champagne Gold Rim Pills */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) return <div key={i} className="h-14 rounded-full bg-black/20 border border-amber-500/20" />;

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex items-center gap-3.5 rounded-full px-5 py-4 text-left transition-all duration-200",
                  "bg-[#141620] border-2",
                  isCor
                    ? "border-emerald-400 bg-emerald-950/80 shadow-[0_0_20px_rgba(52,211,153,0.6)] text-emerald-200 font-black"
                    : isWrn
                    ? "border-rose-500 bg-rose-950/80 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-rose-200 font-black"
                    : isSel
                    ? "border-amber-300 bg-amber-950/50 shadow-[0_0_20px_rgba(251,191,36,0.6)] text-amber-200 font-black"
                    : "border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] text-slate-100",
                  disabled && "cursor-default"
                )}
              >
                <span
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black",
                    isCor
                      ? "bg-emerald-400 text-slate-950"
                      : isWrn
                      ? "bg-rose-500 text-white"
                      : isSel
                      ? "bg-amber-400 text-slate-950"
                      : "bg-amber-500/20 text-amber-300 border border-amber-400/40 group-hover:bg-amber-400 group-hover:text-slate-950"
                  )}
                >
                  ◆ {OPTION_LETTERS[i % OPTION_LETTERS.length]}
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl">🏆</span>}
                {reveal && isWrn && <span className="text-xl">❌</span>}
                {!reveal && isSel && <span className="text-amber-400 text-lg">✔</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300">
            👑 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 rounded-xl bg-amber-950/40 border border-amber-500/40 p-3 text-sm text-amber-200">
            ✨ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 6. EMERALD CYBER MATRIX (Gamer HUD)                                         */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "emerald_matrix") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-[#04110e] p-5 sm:p-8 text-emerald-200",
          "border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] font-mono",
          className
        )}
      >
        {/* Tactical HUD corners */}
        <div className="absolute top-2 left-2 text-[10px] text-emerald-400/60 select-none">{"[SYS_ACTIVE]"}</div>
        <div className="absolute top-2 right-2 text-[10px] text-emerald-400/60 select-none">{"[SEC_CLEARED]"}</div>

        {/* Matrix HUD Question Banner */}
        <div className="relative z-10 mb-6 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 p-4 sm:p-6 text-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <div className="flex items-center justify-between gap-2 mb-2 font-mono">
            <span className="rounded px-2.5 py-0.5 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {headerBadge || `TACTICAL // ${String(questionIndex + 1).padStart(2, "0")}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2 className={cx("font-black tracking-wide text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
            {questionText}
          </h2>
        </div>

        {/* Option Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) return <div key={i} className="h-14 rounded-xl bg-black/40 border border-emerald-900/40" />;

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex items-center gap-3.5 rounded-xl px-5 py-4 text-left transition-all duration-150",
                  "bg-slate-950/80 border-2",
                  isCor
                    ? "border-emerald-400 bg-emerald-900/60 shadow-[0_0_20px_rgba(52,211,153,0.7)] text-emerald-100 font-black"
                    : isWrn
                    ? "border-rose-500 bg-rose-950/70 shadow-[0_0_20px_rgba(244,63,94,0.7)] text-rose-200 font-black"
                    : isSel
                    ? "border-teal-300 bg-teal-950/60 shadow-[0_0_20px_rgba(45,212,191,0.6)] text-teal-100 font-black"
                    : "border-emerald-500/40 hover:border-emerald-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-100",
                  disabled && "cursor-default"
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-emerald-500/20 border border-emerald-400/50 text-xs font-black text-emerald-300">
                  {OPTION_LETTERS[i % OPTION_LETTERS.length]}
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl">🟢</span>}
                {reveal && isWrn && <span className="text-xl">❌</span>}
                {!reveal && isSel && <span className="text-teal-300 text-lg">✔</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
            🟢 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 rounded-xl bg-teal-950/60 border border-teal-500/40 p-3 text-sm text-teal-200">
            ⚡ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 7. COSMIC AURORA GALAXY                                                     */
  /* -------------------------------------------------------------------------- */
  if (actualPlate === "cosmic_aurora") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06152b] via-[#0e1b3d] to-[#1a0c33] p-5 sm:p-8 text-white",
          "border border-teal-400/40 shadow-[0_0_40px_rgba(45,212,191,0.3)]",
          className
        )}
      >
        {/* Aurora Glow */}
        <div className="pointer-events-none absolute -top-20 left-1/3 h-52 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-52 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        {/* Aurora Header Banner */}
        <div className="relative z-10 mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 text-center shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="rounded-full bg-teal-400/20 border border-teal-400/30 px-3 py-0.5 text-xs font-black text-teal-300">
              🌌 {headerBadge || `AURORA · প্রশ্ন ${questionIndex + 1}`}
            </span>
            {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
          </div>
          <h2 className={cx("font-black tracking-tight text-white drop-shadow-lg", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
            {questionText}
          </h2>
        </div>

        {/* Frosted Glass Pills */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, i) => {
            const isSel = selectedIndices.includes(i);
            const isCor = reveal && correctIndices.includes(i);
            const isWrn = reveal && isSel && !isCor;
            if (hidden.includes(i)) return <div key={i} className="h-14 rounded-full bg-white/5 border border-white/10" />;

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(i)}
                className={cx(
                  "group relative flex items-center gap-3.5 rounded-full px-5 py-4 text-left transition-all duration-200",
                  "bg-white/10 backdrop-blur-xl border-2",
                  isCor
                    ? "border-emerald-400 bg-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.6)] text-emerald-200 font-black"
                    : isWrn
                    ? "border-rose-500 bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-rose-200 font-black"
                    : isSel
                    ? "border-teal-300 bg-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.6)] text-teal-100 font-black"
                    : "border-white/20 hover:border-teal-400/80 hover:bg-white/15 text-slate-100",
                  disabled && "cursor-default"
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/40 text-xs font-black">
                  {OPTION_LETTERS[i % OPTION_LETTERS.length]}
                </span>
                <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
                {reveal && isCor && <span className="text-xl">✨</span>}
                {reveal && isWrn && <span className="text-xl">❌</span>}
                {!reveal && isSel && <span className="text-teal-300 text-lg">✔</span>}
              </button>
            );
          })}
        </div>

        {hint && (
          <div className="relative z-10 mt-4 rounded-xl bg-teal-500/10 border border-teal-500/30 p-2.5 text-xs text-teal-200">
            🌌 <b>হিন্ট:</b> {hint}
          </div>
        )}
        {reveal && explanation && (
          <div className="relative z-10 mt-4 rounded-xl bg-white/10 border border-white/20 p-3 text-sm text-slate-200">
            ✨ <b>ব্যাখ্যা:</b> {explanation}
          </div>
        )}
        {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 8. CANDY POP 3D VIBRANT (Default fallback)                                  */
  /* -------------------------------------------------------------------------- */
  const CANDY_COLORS = [
    { bg: "bg-pink-500", border: "border-pink-300", text: "text-white" },
    { bg: "bg-indigo-600", border: "border-indigo-300", text: "text-white" },
    { bg: "bg-amber-400", border: "border-amber-200", text: "text-slate-950" },
    { bg: "bg-emerald-500", border: "border-emerald-300", text: "text-white" },
    { bg: "bg-purple-600", border: "border-purple-300", text: "text-white" },
    { bg: "bg-cyan-500", border: "border-cyan-200", text: "text-slate-950" },
  ];

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-3xl bg-slate-950 p-5 sm:p-8 text-white",
        "border-2 border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.3)]",
        className
      )}
    >
      <div className="relative z-10 mb-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-4 sm:p-6 text-center shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-full bg-black/25 px-3 py-0.5 text-xs font-black uppercase text-pink-200 tracking-wider">
            {headerBadge || `প্রশ্ন ${questionIndex + 1}`}
          </span>
          {timerNode ? <div className="shrink-0">{timerNode}</div> : null}
        </div>
        <h2 className={cx("font-black tracking-tight text-white drop-shadow-md", isHost ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl")}>
          {questionText}
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const isSel = selectedIndices.includes(i);
          const isCor = reveal && correctIndices.includes(i);
          const isWrn = reveal && isSel && !isCor;
          const candy = CANDY_COLORS[i % CANDY_COLORS.length];
          if (hidden.includes(i)) return <div key={i} className="h-14 rounded-2xl bg-slate-900 border border-slate-800" />;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(i)}
              className={cx(
                "group relative flex items-center gap-3.5 rounded-2xl px-5 py-4 text-left transition-all duration-200 shadow-md",
                isCor
                  ? "bg-emerald-500 text-white ring-4 ring-emerald-300 font-black"
                  : isWrn
                  ? "bg-rose-500 text-white ring-4 ring-rose-300 font-black"
                  : isSel
                  ? "bg-amber-400 text-slate-950 ring-4 ring-white font-black"
                  : `${candy.bg} ${candy.text} hover:scale-[1.01]`,
                disabled && "cursor-default"
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-black/20 text-xs font-black">
                {OPTION_LETTERS[i % OPTION_LETTERS.length]}
              </span>
              <span className="flex-1 font-bold text-sm sm:text-base leading-snug">{opt}</span>
              {reveal && isCor && <span className="text-xl">✅</span>}
              {reveal && isWrn && <span className="text-xl">❌</span>}
              {!reveal && isSel && <span className="text-slate-950 text-lg">✔</span>}
            </button>
          );
        })}
      </div>

      {hint && (
        <div className="relative z-10 mt-4 rounded-xl bg-amber-500/20 border border-amber-500/30 p-2.5 text-xs text-amber-200">
          💡 <b>হিন্ট:</b> {hint}
        </div>
      )}
      {reveal && explanation && (
        <div className="relative z-10 mt-4 rounded-xl bg-purple-950/60 border border-purple-500/30 p-3 text-sm text-purple-200">
          ✨ <b>ব্যাখ্যা:</b> {explanation}
        </div>
      )}
      {footerNode && <div className="relative z-10 mt-4">{footerNode}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Quiz Plate Selector Dropdown / Modal Component for Teacher Controls        */
/* -------------------------------------------------------------------------- */

export function QuizPlateSelector({
  value,
  onChange,
  className = "",
}: {
  value?: string | null;
  onChange: (plateId: QuizPlateId) => void;
  className?: string;
}) {
  const current = value || "auto";

  return (
    <div className={cx("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
          <span>🎨</span>
          <span>কুইজ প্লেট ডিজাইন (Quiz Plate Style)</span>
        </label>
        <span className="text-[11px] font-bold text-teal-400">
          {current === "auto" ? "🎲 সার্ভার অটো-রোটেশন সক্রিয়" : "স্থায়ী প্লেট নির্ধারিত"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {QUIZ_PLATES.map((plate) => {
          const isSelected = current === plate.id;
          return (
            <button
              key={plate.id}
              type="button"
              onClick={() => onChange(plate.id)}
              className={cx(
                "group relative flex flex-col items-start rounded-2xl p-3 text-left transition-all duration-200 border-2 overflow-hidden",
                isSelected
                  ? "border-teal-400 bg-teal-950/50 shadow-[0_0_20px_rgba(45,212,191,0.3)] ring-2 ring-teal-400/40"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-900 text-slate-300"
              )}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1.5">
                <span className="text-xl">{plate.icon}</span>
                <span
                  className={cx(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isSelected ? "bg-teal-400 text-slate-950" : "bg-white/10 text-slate-300"
                  )}
                >
                  {plate.tag}
                </span>
              </div>
              <p className={cx("text-xs font-black leading-tight", isSelected ? "text-white" : "text-slate-200")}>
                {plate.name}
              </p>
              <p className="mt-1 text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {plate.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
