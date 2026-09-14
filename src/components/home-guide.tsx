"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    id: 1,
    title: "গেম পিন বা QR কোড দিয়ে প্রবেশ",
    short: "১. পিন দিন",
    tag: "কোনো লগইন বা অ্যাপ ইনস্টল নেই",
    desc: "শিক্ষার্থী তার নিজস্ব স্মার্টফোন, ট্যাবলেট বা কম্পিউটারের যেকোনো সাধারণ ব্রাউজার থেকে সরাসরি ৬ সংখ্যার পিন লিখবে অথবা প্রজেক্টরে প্রদর্শিত QR কোডটি স্ক্যান করবে। কোনো পাসওয়ার্ড বা অ্যাপ স্টোর ডাউনলোডের প্রয়োজন নেই।",
    icon: "🔑",
    accent: "from-teal-400 to-emerald-500",
    border: "border-teal-500/40",
  },
  {
    id: 2,
    title: "নাম ও প্রিয় অবতার পছন্দ করুন",
    short: "২. অবতার ও নাম",
    tag: "মজার পার্সোনালাইজেশন",
    desc: "লবিতে প্রবেশ করে শিক্ষার্থী তার ডাকনাম বা রোল নম্বর লিখবে এবং নিজের পছন্দের রঙিন অবতার ইমোজি বেছে নিবে। শিক্ষক প্রজেক্টরে রিয়েল-টাইমে সবাইকে পর্দায় যুক্ত হতে দেখতে পাবেন।",
    icon: "🦁",
    accent: "from-violet-400 to-indigo-500",
    border: "border-violet-500/40",
  },
  {
    id: 3,
    title: "প্রজেক্টরে প্রশ্ন ও মোবাইলে দ্রুত উত্তর",
    short: "৩. দ্রুত সঠিক উত্তর",
    tag: "স্পিড বোনাস ও স্ট্রিক",
    desc: "শিক্ষক প্রশ্ন শুরু করলে প্রজেক্টরে এবং শিক্ষার্থীদের নিজস্ব স্ক্রিনে প্রশ্ন ও রঙের ৪টি অপশন প্রদর্শিত হবে। যত দ্রুত সঠিক উত্তর দেওয়া যাবে, তত বেশি স্পিড পয়েন্ট ও স্ট্রিক মাল্টিপ্লায়ার পাওয়া যাবে!",
    icon: "⚡",
    accent: "from-amber-400 to-orange-500",
    border: "border-amber-500/40",
  },
  {
    id: 4,
    title: "লাইভ লিডারবোর্ড ও বিজয়ী পোডিয়াম",
    short: "৪. বিজয়ী সম্মাননা",
    tag: "কনফেটি ও ট্রফি উদযাপন",
    desc: "প্রতিটি প্রশ্নের পর স্বয়ংক্রিয় লাইভ লিডারবোর্ড দেখাবে কে এগিয়ে গেল। কুইজ শেষে ১ম, ২য় ও ৩য় স্থানধারীদের জন্য গোল্ডেন পোডিয়াম, সাউন্ড ইফেক্ট, কনফেটি ও ডিজিটাল পারফরম্যান্স কার্ড প্রদান করা হবে।",
    icon: "🏆",
    accent: "from-yellow-400 to-amber-500",
    border: "border-yellow-500/40",
  },
];

const AVATARS = ["🚀", "🦁", "⚡", "🦅", "🤖", "🎯", "👑", "🦊"];

export function HomeGuide() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState("🚀");
  const [answeredOption, setAnsweredOption] = useState<number | null>(null);
  const [timerCount, setTimerCount] = useState(15);
  const [pinDisplay, setPinDisplay] = useState("489215");

  // Auto cycle timer preview
  useEffect(() => {
    if (activeStep !== 3) return;
    const interval = setInterval(() => {
      setTimerCount((t) => (t <= 1 ? 15 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  const step = STEPS.find((s) => s.id === activeStep) ?? STEPS[0];

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 py-20 px-4 sm:px-8 lg:px-14 xl:px-20 text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-300">
            📖 ধাপে ধাপে নির্দেশিকা
          </span>
          <h2 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            কীভাবে একজন শিক্ষার্থী যুক্ত হবে ও লাইভ কুইজ খেলবে?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            মাত্র চারটি সহজ ধাপে ক্লাসের যে কেউই সেকেন্ডের মধ্যে প্রজেক্টরের সাথে সিঙ্ক হয়ে লাইভ প্রতিযোগিতায় অংশ নিতে পারে।
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((s) => {
            const isCur = s.id === activeStep;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isCur
                    ? "bg-white text-slate-950 shadow-xl shadow-white/10 scale-105"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Step Display Stage */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Step Description */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold text-teal-300">
              <span>ধাপ {step.id} / ৪</span>
              <span>•</span>
              <span>{step.tag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {step.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {step.desc}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-95 transition"
              >
                <span>🚀 এখনই যুক্ত হয়ে দেখুন</span>
              </Link>
              {activeStep < 4 ? (
                <button
                  onClick={() => setActiveStep((p) => p + 1)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  পরবর্তী ধাপ দেখুন →
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(1)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  ↺ প্রথম থেকে দেখুন
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Interactive Simulation Box */}
          <div className="lg:col-span-7">
            <div className={`relative rounded-3xl border-2 ${step.border} bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 min-h-[380px] flex flex-col justify-center`}>
              {/* Step 1 Simulation: PIN Input */}
              {activeStep === 1 && (
                <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/40 grid place-items-center text-3xl">
                    📱
                  </div>
                  <div>
                    <p className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
                      লাইভ স্টুডেন্ট স্ক্রিন
                    </p>
                    <p className="text-lg font-bold text-white">গেম পিন লিখুন</p>
                  </div>

                  <div className="mx-auto max-w-xs">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={pinDisplay}
                        className="w-full text-center text-2xl font-black tracking-widest rounded-2xl border-2 border-teal-400 bg-slate-950 px-4 py-3 text-teal-300 shadow-inner"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-400">
                        ✓ পিন ভ্যালিড
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                      <span>🟢 রুম কানেক্টেড:</span>
                      <span>১০ম শ্রেণি - কম্পিউটার সায়েন্স</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 Simulation: Avatar & Nickname */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-indigo-500/20 border-2 border-indigo-400 text-4xl mb-2 animate-bounce">
                      {selectedAvatar}
                    </div>
                    <p className="text-sm font-bold text-white">নাম: তানভীর আহমেদ (রোল: ০৪)</p>
                    <p className="text-xs text-indigo-300">একটি অবতার ক্লিক করুন:</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        onClick={() => setSelectedAvatar(av)}
                        className={`text-2xl p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          selectedAvatar === av
                            ? "border-indigo-400 bg-indigo-500/30 scale-110 shadow-lg shadow-indigo-500/30"
                            : "border-white/15 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <span className="inline-block rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 px-3 py-1 text-xs font-bold">
                      ✓ আপনি গেম লবিতে যুক্ত হয়েছেন!
                    </span>
                  </div>
                </div>
              )}

              {/* Step 3 Simulation: Fast Answering */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">প্রশ্ন ১/১০ · MCQ</span>
                    <span className="text-sm font-black text-amber-400 tabular-nums bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-xl">
                      ⏱️ {timerCount} সেকেন্ড
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 text-center">
                    <p className="text-sm sm:text-base font-bold text-white">
                      HTML ফর্মে ডেটা প্রেরণের জন্য কোন মেথডটি বেশি নিরাপদ?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 1, text: "GET", color: "from-rose-500 to-red-600", correct: false },
                      { id: 2, text: "POST (সঠিক)", color: "from-emerald-500 to-teal-600", correct: true },
                      { id: 3, text: "PUT", color: "from-amber-500 to-yellow-600", correct: false },
                      { id: 4, text: "DELETE", color: "from-blue-500 to-indigo-600", correct: false },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAnsweredOption(opt.id)}
                        className={`rounded-2xl p-3.5 text-center font-black text-sm text-white bg-gradient-to-r ${opt.color} transition-all cursor-pointer active:scale-95 ${
                          answeredOption === opt.id ? "ring-4 ring-white shadow-xl scale-102" : "opacity-90 hover:opacity-100"
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>

                  {answeredOption === 2 && (
                    <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-2.5 text-center text-xs font-extrabold text-emerald-300 animate-in fade-in">
                      🔥 সঠিক উত্তর! +৯৮৫ পয়েন্ট (স্পিড বোনাস সহ!)
                    </div>
                  )}
                  {answeredOption && answeredOption !== 2 && (
                    <div className="rounded-xl bg-rose-500/20 border border-rose-400/40 p-2.5 text-center text-xs font-extrabold text-rose-300 animate-in fade-in">
                      সঠিক উত্তর ছিল: POST
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 Simulation: Podium & Trophy */}
              {activeStep === 4 && (
                <div className="space-y-4 text-center animate-in fade-in zoom-in-95 duration-300">
                  <span className="text-3xl animate-bounce inline-block">🏆</span>
                  <p className="text-lg font-black text-amber-300">
                    অভিনন্দন! লাইভ কুইজ সমাপ্ত
                  </p>

                  <div className="flex items-end justify-center gap-3 pt-3">
                    {/* 2nd place */}
                    <div className="w-24 rounded-t-2xl bg-gradient-to-b from-slate-400 to-slate-600 p-2.5 text-center border-t-2 border-slate-300">
                      <span className="text-2xl">🥈</span>
                      <p className="text-xs font-black text-white mt-1">সাকিব</p>
                      <p className="text-[11px] text-white/80">৮,৪৫০</p>
                      <div className="h-14 grid place-items-center font-black text-xl text-white/90">২য়</div>
                    </div>

                    {/* 1st place */}
                    <div className="w-28 rounded-t-2xl bg-gradient-to-b from-amber-400 to-yellow-600 p-3 text-center border-t-4 border-amber-200 shadow-xl shadow-amber-500/30">
                      <span className="text-3xl">👑</span>
                      <p className="text-sm font-black text-slate-950 mt-1">তানভীর</p>
                      <p className="text-xs font-extrabold text-slate-900">৯,৮২০</p>
                      <div className="h-20 grid place-items-center font-black text-2xl text-slate-950">১ম</div>
                    </div>

                    {/* 3rd place */}
                    <div className="w-24 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900 p-2.5 text-center border-t-2 border-amber-600">
                      <span className="text-2xl">🥉</span>
                      <p className="text-xs font-black text-white mt-1">রাফসান</p>
                      <p className="text-[11px] text-white/80">৭,৯০০</p>
                      <div className="h-10 grid place-items-center font-black text-lg text-white/90">৩য়</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 pt-2">
                    ✨ সকল অংশগ্রহণকারীর জন্য রিয়েল-টাইম সার্টিফিকেট ও নির্ভুলতা বিশ্লেষণ তৈরি হয়।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
