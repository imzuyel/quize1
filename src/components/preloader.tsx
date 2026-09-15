"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check if preloader already ran in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("pgtsc_preloader_shown")) {
      setHidden(true);
      return;
    }

    // Smooth luxury exit timing
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 400);

    const hideTimer = setTimeout(() => {
      setHidden(true);
      try {
        sessionStorage.setItem("pgtsc_preloader_shown", "1");
      } catch {
        // Ignore private browsing storage errors
      }
    }, 750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] pointer-events-none select-none flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        fading ? "opacity-0 scale-105 filter blur-sm" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient luxury radial glow */}
      <div className="absolute h-96 w-96 rounded-full bg-gradient-to-tr from-teal-500/20 via-indigo-500/15 to-amber-500/20 blur-3xl animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,0.95)_100%)]" />

      {/* Center Preloader Visual */}
      <div className="relative flex flex-col items-center gap-5">
        {/* Dual Orbit Ring & Glass Emblem */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-teal-400/40 border-t-teal-300 animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(45,212,191,0.3)]" />
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-2.5 rounded-2xl border-2 border-amber-400/50 border-b-amber-300 animate-[spin_2s_linear_infinite_reverse] shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
          
          {/* Center Glass Emblem */}
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-slate-900/80 text-2xl font-black text-amber-300 shadow-[0_0_30px_rgba(45,212,191,0.4)] backdrop-blur-md border border-teal-400/50">
            <span className="drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)] animate-bounce">⚡</span>
          </div>
        </div>

        {/* Premium Branding Titles */}
        <div className="text-center space-y-1.5">
          <span className="inline-block rounded-full bg-gradient-to-r from-teal-500/20 via-amber-500/20 to-teal-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-teal-300 border border-teal-400/30 shadow-sm">
            PGTCSC QUIZ ARENA
          </span>
          <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md">
            পিজিটিএসসি কুইজ অ্যারেনা
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            স্মার্ট এআই লার্নিং ও লাইভ গ্যামিফাইড প্ল্যাটফর্ম
          </p>
        </div>

        {/* Shimmer Progress Line */}
        <div className="mt-1 h-1.5 w-44 overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/60 p-0.5 shadow-inner">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-teal-400 via-amber-300 to-cyan-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}


