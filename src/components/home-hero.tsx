"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { triggerAppLoading } from "./top-loader";

const ROTATING_WORDS = [
  {
    word: "রোমাঞ্চকর কুইজ লড়াই ⚡",
    color: "from-teal-300 via-cyan-400 to-emerald-400",
    glow: "rgba(45, 212, 191, 0.6)",
    pillBg: "bg-teal-500/15 border-teal-400/40 text-teal-300",
    desc: "প্রজেক্টরে লাইভ প্রশ্ন আর মোবাইলে দ্রুততম উত্তরের মেধার প্রতিযোগিতা",
  },
  {
    word: "রিয়েল-টাইম গেমিং ব্যাটল 🎮",
    color: "from-fuchsia-300 via-pink-400 to-rose-400",
    glow: "rgba(236, 72, 153, 0.6)",
    pillBg: "bg-pink-500/15 border-pink-400/40 text-pink-300",
    desc: "৫০ms আল্ট্রা-ফাস্ট সিঙ্কে পুরো ক্লাসের সাথে মুখোমুখি মেধার লড়াই",
  },
  {
    word: "স্পিড বোনাস পয়েন্ট ফাইট 🔥",
    color: "from-amber-300 via-orange-400 to-rose-500",
    glow: "rgba(245, 158, 11, 0.6)",
    pillBg: "bg-amber-500/15 border-amber-400/40 text-amber-300",
    desc: "বাকি প্রতি মিলিসেকেন্ডের জন্য এক্সট্রা বোনাস ও লাইটনিং স্ট্রিক পয়েন্ট",
  },
  {
    word: "চ্যাম্পিয়ন ট্রফি বিজয় 🏆",
    color: "from-yellow-300 via-amber-300 to-yellow-500",
    glow: "rgba(250, 204, 21, 0.6)",
    pillBg: "bg-yellow-500/15 border-yellow-400/40 text-yellow-300",
    desc: "১ম, ২য় ও ৩য় স্থানের জন্য রয়্যাল পোডিয়াম, কনফেটি ও ডিজিটাল ট্রফি",
  },
  {
    word: "তীব্র রিফ্লেক্স চ্যালেঞ্জ 🚀",
    color: "from-cyan-300 via-sky-400 to-indigo-400",
    glow: "rgba(56, 189, 248, 0.6)",
    pillBg: "bg-sky-500/15 border-sky-400/40 text-sky-300",
    desc: "ঝটপট সঠিক রঙের বাটনে চাপ দিয়ে সবাইকে ছাড়িয়ে যাওয়ার আনন্দ",
  },
  {
    word: "ইনস্ট্যান্ট লিডারবোর্ড 👑",
    color: "from-violet-300 via-purple-400 to-fuchsia-400",
    glow: "rgba(168, 85, 247, 0.6)",
    pillBg: "bg-purple-500/15 border-purple-400/40 text-purple-300",
    desc: "প্রতিটি প্রশ্নের সাথে সাথে লাইভ র‍্যাঙ্কিং পরিবর্তন ও পোডিয়াম সেলিব্রেশন",
  },
];

export function HomeHero({
  signedIn,
  userRole,
}: {
  signedIn: boolean;
  userRole?: string;
}) {
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [joining, setJoining] = useState(false);

  // Word slider timer (changes only the colored word, keeps website blazing fast)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setAnimating(false);
      }, 200);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = ROTATING_WORDS[wordIndex];

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
    <section className="relative w-full overflow-hidden bg-[#060a1e] text-white pt-10 pb-20 sm:pt-14 sm:pb-28">
      {/* Full Screen Immersive Ambient Backdrop Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[95vw] max-w-[1500px] rounded-full bg-gradient-to-tr from-violet-600/25 via-teal-500/25 to-cyan-500/20 blur-[140px]" />
        <div className="absolute top-1/3 -left-32 h-[480px] w-[480px] rounded-full bg-teal-500/20 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 h-[480px] w-[480px] rounded-full bg-amber-500/15 blur-[140px]" />
        <div className="pg-grid-lines absolute inset-0 opacity-30" />
      </div>

      <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1700px] mx-auto">
        {/* Top Feature Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/15 px-4 py-1.5 text-xs font-black text-teal-300 backdrop-blur-xl shadow-lg shadow-teal-950/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
            </span>
            <span>লাইভ ক্লাসরুম কুইজ গেমিং প্ল্যাটফর্ম</span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-xl transition-all duration-300 ${current.pillBg}`}
          >
            <span>{current.desc}</span>
          </span>
        </div>

        {/* Word Slider Hero Headline: Fixed Main Text + Dynamic Rotating Word in Different Color */}
        <div className="mt-8 text-center max-w-5xl mx-auto">
          <h1 className="text-3xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {/* 1. Main fixed text */}
            <span className="text-white drop-shadow-sm">
              লাইভ ক্লাসরুমে বন্ধুদের সাথে
            </span>

            {/* 2. Word Slider: Changing word in another vibrant color */}
            <span className="relative inline-flex items-center justify-center px-4 py-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-white/15">
              <span
                key={current.word}
                className={`bg-gradient-to-r ${current.color} bg-clip-text text-transparent font-black tracking-wide transition-all duration-300 ${
                  animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                }`}
                style={{
                  filter: `drop-shadow(0 0 24px ${current.glow})`,
                }}
              >
                {current.word}
              </span>
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl md:text-2xl font-bold text-slate-200 max-w-3xl mx-auto leading-relaxed">
            প্রজেক্টরে বড় পর্দায় প্রশ্ন আর মোবাইলের রঙিন বাটনে দ্রুততম উত্তরের মেধার প্রতিযোগিতা!
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto">
            কোনো অ্যাপ বা পাসওয়ার্ডের ঝামেলা নেই · যেকোনো ডিভাইসে ৬ সংখ্যার পিন দিয়ে তাৎক্ষণিক অংশগ্রহণ
          </p>
        </div>

        {/* Prominent Game Entry Arena (Ring Glow Effect & Vector Cards) */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border-2 border-teal-400/60 bg-gradient-to-b from-slate-900/95 via-[#09112a]/90 to-[#060c22] p-6 sm:p-10 ring-2 ring-teal-400/40 shadow-[0_0_50px_rgba(45,212,191,0.25)] hover:ring-teal-300 hover:shadow-[0_0_70px_rgba(45,212,191,0.4)] backdrop-blur-2xl transition-all duration-300">
            {/* Ambient Corner Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

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
                      গেম পিন দিয়ে সরাসরি খেলুন
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  বোর্ডে বা প্রজেক্টরে প্রদর্শিত ৬ সংখ্যার গেম পিন লিখে সাথে সাথে ক্লাসের লাইভ গেমিং ব্যাটেলে প্রবেশ করুন!
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
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
