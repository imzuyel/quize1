"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { triggerAppLoading } from "./top-loader";
import { DEFAULT_HERO_SETTINGS, type HeroSettings } from "@/lib/frontend-config";

export function HomeHero({
  signedIn,
  userRole,
  settings: heroProps,
}: {
  signedIn: boolean;
  userRole?: string;
  settings?: HeroSettings;
}) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [joining, setJoining] = useState(false);

  const c = heroProps ?? DEFAULT_HERO_SETTINGS;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim().toUpperCase();
    if (!clean) {
      setPinError("দয়া করে ৬ সংখ্যার গেম পিন দিন");
      return;
    }
    setPinError("");
    setJoining(true);
    triggerAppLoading(true);
    router.push(`/join?pin=${encodeURIComponent(clean)}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#060a1e] text-white pt-10 pb-20 sm:pt-16 sm:pb-32">
      {/* Full Screen Immersive Ambient Backdrop Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[95vw] max-w-[1600px] rounded-full blur-[150px] opacity-35 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${c.color1} 0%, ${c.color2} 50%, ${c.color3} 100%)`,
          }}
        />
        <div
          className="absolute top-1/3 -left-32 h-[500px] w-[500px] rounded-full blur-[150px] opacity-25"
          style={{ backgroundColor: c.color1 }}
        />
        <div
          className="absolute top-1/2 -right-32 h-[500px] w-[500px] rounded-full blur-[150px] opacity-25"
          style={{ backgroundColor: c.color3 }}
        />
        <div className="pg-grid-lines absolute inset-0 opacity-30" />
      </div>

      <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1700px] mx-auto">
        {/* Top Feature Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {c.badge1 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/15 px-4 py-1.5 text-xs sm:text-sm font-black text-teal-300 backdrop-blur-xl shadow-lg shadow-teal-950/40 ring-1 ring-teal-400/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
              </span>
              <span>{c.badge1}</span>
            </span>
          ) : null}

          {c.badge2 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300 backdrop-blur-xl">
              <span>{c.badge2}</span>
            </span>
          ) : null}

          {c.badge3 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-500/15 px-4 py-1.5 text-xs sm:text-sm font-bold text-pink-300 backdrop-blur-xl">
              <span>{c.badge3}</span>
            </span>
          ) : null}
        </div>

        {/* Beautiful Glowing Multi-Color Hero Headline (Large Typography) */}
        <div className="mt-10 text-center max-w-6xl mx-auto">
          <h1 className="text-4xl font-black leading-[1.1] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] tracking-tight text-white flex flex-col items-center justify-center gap-y-3">
            {/* 1. Main line */}
            {c.titleLine1 ? (
              <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                {c.titleLine1}
              </span>
            ) : null}

            {/* 2. Glowing Colorful Text - 2/3 Color Blend */}
            {c.titleGradientText ? (
              <span className="relative inline-block mt-2">
                {/* Backlight Ambient Glow Layer */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 select-none blur-3xl opacity-70"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${c.color1}, ${c.color2}, ${c.color3})`,
                  }}
                />
                <span
                  className="relative font-black tracking-wide block py-1"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${c.color1}, ${c.color2}, ${c.color3})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: `drop-shadow(0 0 40px ${c.color1}90) drop-shadow(0 0 80px ${c.color2}60)`,
                  }}
                >
                  {c.titleGradientText}
                </span>
              </span>
            ) : null}
          </h1>

          {c.subtitle ? (
            <p className="mt-8 text-lg sm:text-2xl md:text-3xl font-bold text-slate-100 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              {c.subtitle}
            </p>
          ) : null}

          {c.subText ? (
            <p className="mt-3 text-sm sm:text-base text-teal-200/90 font-semibold max-w-3xl mx-auto tracking-wide">
              {c.subText}
            </p>
          ) : null}
        </div>

        {/* Prominent Game Entry Arena (Ring Glow Effect & Vector Cards) */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border-2 border-teal-400/60 bg-gradient-to-b from-slate-900/95 via-[#09112a]/90 to-[#060c22] p-6 sm:p-10 ring-2 ring-teal-400/40 shadow-[0_0_60px_rgba(45,212,191,0.25)] hover:ring-teal-300 hover:shadow-[0_0_80px_rgba(45,212,191,0.4)] backdrop-blur-2xl transition-all duration-300">
            {/* Ambient Corner Glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: c.color1 }}
            />
            <div
              className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: c.color2 }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Side: Direct PIN Input */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-2xl text-slate-950 shadow-lg shadow-teal-500/30">
                    🎮
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-teal-400">
                      ইনস্ট্যান্ট গেম প্লে
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {c.joinTitle}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {c.joinSubtitle}
                </p>

                {/* Quick Join Form */}
                <form onSubmit={handleJoinSubmit} className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.toUpperCase());
                          if (pinError) setPinError("");
                        }}
                        maxLength={10}
                        placeholder="গেম পিন লিখুন (যেমন: 489215)"
                        className="w-full rounded-2xl border-2 border-teal-400/60 bg-slate-950/90 px-4 py-4 text-center sm:text-left text-xl font-black tracking-widest text-teal-300 placeholder:text-slate-500 placeholder:font-normal placeholder:tracking-normal focus:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition shadow-inner"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-teal-400/80 pointer-events-none hidden sm:inline font-mono">
                        GAME PIN
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={joining}
                      className="rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 px-8 py-4 text-lg font-black text-slate-950 shadow-lg shadow-teal-500/40 hover:brightness-110 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ring-2 ring-teal-300/60"
                    >
                      {joining ? (
                        <span>প্রবেশ হচ্ছে...</span>
                      ) : (
                        <>
                          <span>🚀 খেলায় যোগ দিন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {pinError ? (
                    <p className="mt-2 text-xs font-bold text-rose-400 animate-in fade-in">
                      ⚠️ {pinError}
                    </p>
                  ) : null}

                  {/* Quick links & scanner */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>সার্ভার স্ট্যাটাস: আল্ট্রা-লো লেটেন্সি সক্রিয়</span>
                    </span>
                    <Link
                      href="/join"
                      className="text-teal-300 hover:text-teal-200 font-bold underline decoration-teal-400/60 underline-offset-4 flex items-center gap-1"
                    >
                      <span>📷 ক্যামেরা দিয়ে QR কোড স্ক্যান করুন</span>
                      <span>→</span>
                    </Link>
                  </div>
                </form>
              </div>

              {/* Right Side: Visual Mini Game Card Showcase with Ring Glow */}
              <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl shadow-inner space-y-3 ring-2 ring-indigo-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>লাইভ গেম ইন্টারফেস</span>
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                    সক্রিয়
                  </span>
                </div>

                {/* Mini Mockup of Live Plate Selection */}
                <div className="rounded-xl border border-teal-400/40 bg-gradient-to-br from-[#0c1430] to-[#080d24] p-3.5 shadow-md space-y-2.5 ring-1 ring-teal-400/30">
                  <div className="flex items-center justify-between text-[11px] text-teal-300 font-bold">
                    <span>প্রশ্ন ১/১০</span>
                    <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
                      ⏱ ১৫ সেকেন্ড
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">
                    পদার্থের ক্ষুদ্রতম অবিভাজ্য কণার নাম কী?
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="rounded-lg bg-rose-500/20 border border-rose-500/50 p-2 text-[11px] font-bold text-rose-200 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-rose-500 text-[9px] font-black grid place-items-center text-white">A</span>
                      <span>পরমাণু</span>
                    </div>
                    <div className="rounded-lg bg-teal-500/20 border border-teal-400/70 p-2 text-[11px] font-bold text-teal-200 flex items-center gap-1.5 ring-1 ring-teal-400">
                      <span className="h-4 w-4 rounded-full bg-teal-400 text-[9px] font-black grid place-items-center text-slate-950">B</span>
                      <span>অণু</span>
                    </div>
                    <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-2 text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-amber-500 text-[9px] font-black grid place-items-center text-slate-950">C</span>
                      <span>ইলেকট্রন</span>
                    </div>
                    <div className="rounded-lg bg-indigo-500/20 border border-indigo-500/50 p-2 text-[11px] font-bold text-indigo-200 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-indigo-500 text-[9px] font-black grid place-items-center text-white">D</span>
                      <span>প্রোটন</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>🎨 ৮+ কাস্টম কুইজ প্লেট সাপোর্ট</span>
                  <Link href="/join" className="text-teal-400 hover:text-teal-300 font-bold">
                    এখনই টেস্ট করুন →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Teacher Portal Action Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/join"
            className="flex items-center gap-2 rounded-2xl bg-teal-400/15 border border-teal-400/40 px-5 py-2.5 text-xs sm:text-sm font-black text-teal-300 hover:bg-teal-400/25 transition shadow-lg"
          >
            <span>🎮</span>
            <span>কুইজে যোগ দিন</span>
          </Link>
          <Link
            href="/demo?role=teacher&next=/teacher/live"
            className="flex items-center gap-2 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 px-5 py-2.5 text-xs sm:text-sm font-bold text-indigo-200 hover:bg-indigo-600/40 transition shadow-lg"
          >
            <span>👨‍🏫</span>
            <span>শিক্ষক পোর্টাল ও সেশন শুরু</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-400/40 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/25 transition shadow-lg"
          >
            <span>🏆</span>
            <span>লিডারবোর্ড</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

