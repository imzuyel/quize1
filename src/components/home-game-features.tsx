"use client";

import { useState } from "react";
import Link from "next/link";

const GAME_FEATURES = [
  {
    id: "speed",
    title: "⚡ স্পিড ও রিফ্লেক্স বোনাস",
    badge: "পয়েন্ট বুস্টার",
    tagline: "যত দ্রুত সঠিক উত্তর, তত বেশি পয়েন্ট!",
    desc: "শুধু সঠিক উত্তর দেওয়াই শেষ কথা নয়! বাকি সময়ের প্রতিটি মিলিসেকেন্ডের জন্য অতিরিক্ত বোনাস পয়েন্ট যোগ হয়। ২.৫ সেকেন্ডের মধ্যে উত্তর দিলে মেলে বিশেষ 'লাইটনিং বোনাস'!",
    glow: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-400/40 hover:border-amber-400",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    ringClass: "ring-2 ring-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.25)] hover:ring-amber-300 hover:shadow-[0_0_60px_rgba(251,191,36,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="4" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="282" strokeDashoffset="70" strokeLinecap="round" />
        <path d="M54 22L34 52H50L46 78L68 46H52L58 22Z" fill="#fbbf24" filter="drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))" />
      </svg>
    ),
  },
  {
    id: "battle",
    title: "🎮 রিয়েল-টাইম লাইভ ব্যাটল",
    badge: "৫০ms সিঙ্ক",
    tagline: "পুরো ক্লাসের সাথে সরাসরি মুখোমুখি লড়াই",
    desc: "প্রজেক্টরে বড় পর্দায় প্রশ্ন ভেসে ওঠার সাথে সাথে সবার ফোনে বা ট্যাবলেটে ৪টি রঙিন অপশন সক্রিয় হয়। ৫০ms আল্ট্রা-ফাস্ট সিঙ্কে সবাই একই সাথে লাইভ লড়াইয়ে অংশ নেয়।",
    glow: "from-teal-500/20 via-cyan-500/10 to-transparent",
    border: "border-teal-400/40 hover:border-teal-400",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    iconBg: "bg-gradient-to-br from-teal-400 to-cyan-500",
    ringClass: "ring-2 ring-teal-400/50 shadow-[0_0_35px_rgba(45,212,191,0.25)] hover:ring-teal-300 hover:shadow-[0_0_60px_rgba(45,212,191,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="18" y="28" width="64" height="44" rx="14" fill="#0f766e" stroke="#2dd4bf" strokeWidth="3" />
        {/* D-pad */}
        <path d="M32 44H38V38H42V44H48V48H42V54H38V48H32Z" fill="#ccfbf1" />
        {/* Action Buttons */}
        <circle cx="62" cy="43" r="3.5" fill="#f43f5e" />
        <circle cx="70" cy="50" r="3.5" fill="#3b82f6" />
        <circle cx="62" cy="57" r="3.5" fill="#eab308" />
        <circle cx="54" cy="50" r="3.5" fill="#10b981" />
      </svg>
    ),
  },
  {
    id: "streak",
    title: "🔥 স্ট্রিক কম্বো মাল্টিপ্লায়ার",
    badge: "কম্বো হিট",
    tagline: "ভুল না করে ধরে রাখুন জয়ের ধারা",
    desc: "পরপর সঠিক উত্তর দিলে অন-ফায়ার স্ট্রিক মোড চালু হয়! দ্বিগুণ গতিতে স্কোর লাফিয়ে বাড়ে এবং স্ক্রিনে আগুনের স্পার্ক অ্যানিমেশন জ্বলে ওঠে।",
    glow: "from-rose-500/20 via-red-500/10 to-transparent",
    border: "border-rose-400/40 hover:border-rose-400",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/30",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    ringClass: "ring-2 ring-rose-400/50 shadow-[0_0_35px_rgba(244,63,94,0.25)] hover:ring-rose-300 hover:shadow-[0_0_60px_rgba(244,63,94,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 15C50 15 35 38 35 54C35 68 43 78 50 78C57 78 65 68 65 54C65 38 50 15 50 15Z" fill="#f43f5e" />
        <path d="M50 35C50 35 42 48 42 58C42 66 46 72 50 72C54 72 58 66 58 58C58 48 50 35 50 35Z" fill="#fde047" />
      </svg>
    ),
  },
  {
    id: "podium",
    title: "🏆 চ্যাম্পিয়ন পোডিয়াম ও ট্রফি",
    badge: "গ্র্যান্ড সেলিব্রেশন",
    tagline: "১ম, ২য় ও ৩য় স্থানের রাজকীয় উদযাপন",
    desc: "কুইজের সমাপ্তিতে পর্দা জুড়ে সোনালী পোডিয়াম, ট্রফি, ডিজিটাল ব্যাজ এবং সাউন্ড ইফেক্টসহ কনফেটি বিস্ফোরণ ঘটে। শিক্ষার্থী নিজের সোশ্যাল মিডিয়ার জন্য কাস্টম রেজাল্ট কার্ড ডাউনলোড করতে পারে।",
    glow: "from-yellow-500/20 via-amber-500/10 to-transparent",
    border: "border-yellow-400/40 hover:border-yellow-400",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    ringClass: "ring-2 ring-yellow-400/50 shadow-[0_0_35px_rgba(250,204,21,0.25)] hover:ring-yellow-300 hover:shadow-[0_0_60px_rgba(250,204,21,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Trophy */}
        <path d="M34 26H66V46C66 54 59 61 50 61C41 61 34 54 34 46V26Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        <path d="M34 32H25C22 32 20 34 20 38C20 45 26 50 34 50V46C28 46 24 42 24 38C24 36 25 36 25 36H34V32Z" fill="#eab308" />
        <path d="M66 32H75C78 32 80 34 80 38C80 45 74 50 66 50V46C72 46 76 42 76 38C76 36 75 36 75 36H66V32Z" fill="#eab308" />
        <rect x="46" y="61" width="8" height="12" fill="#ca8a04" />
        <path d="M36 73H64L68 82H32L36 73Z" fill="#a16207" />
        <polygon points="50,33 53,39 60,40 55,45 56,51 50,48 44,51 45,45 40,40 47,39" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: "formats",
    title: "🧩 বৈচিত্র্যময় গেম ফরম্যাট",
    badge: "১৬+ চ্যালেঞ্জ",
    tagline: "শুধু টিক চিহ্ন নয় — পাজল ও চিত্র ধাঁধা",
    desc: "এমসিকিউ, সত্য/মিথ্যা, ড্র্যাগ-অ্যান্ড-ড্রপ ক্রম সাজানো, ছবি দেখে অংশ চিহ্নিতকরণ, বাম-ডান মিলকরণ এবং দ্রুতগতির পোল — প্রতিটি খেলাই সম্পূর্ণ নতুন অভিজ্ঞতায় ভরা।",
    glow: "from-violet-500/20 via-purple-500/10 to-transparent",
    border: "border-violet-400/40 hover:border-violet-400",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-400/30",
    iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
    ringClass: "ring-2 ring-purple-400/50 shadow-[0_0_35px_rgba(168,85,247,0.25)] hover:ring-purple-300 hover:shadow-[0_0_60px_rgba(168,85,247,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="22" y="22" width="24" height="24" rx="6" fill="#8b5cf6" />
        <rect x="54" y="22" width="24" height="24" rx="6" fill="#ec4899" />
        <rect x="22" y="54" width="24" height="24" rx="6" fill="#06b6d4" />
        <rect x="54" y="54" width="24" height="24" rx="6" fill="#10b981" />
        <circle cx="34" cy="34" r="4" fill="#ffffff" />
        <path d="M62 34H70M66 30V38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="34,60 38,68 30,68" fill="#ffffff" />
        <rect x="62" y="62" width="8" height="8" fill="#ffffff" rx="2" />
      </svg>
    ),
  },
  {
    id: "zero-install",
    title: "📱 জিরো-ইনস্টল অ্যাক্সেস",
    badge: "১ ক্লিকে প্রবেশ",
    tagline: "যেকোনো ব্রাউজারে সেকেন্ডেই শুরু",
    desc: "কোনো অ্যাপ্লিকেশন ডাউনলোড বা সাইন আপ করার প্রয়োজন নেই। ক্রোম বা সাফারিতে ৬ সংখ্যার পিন টাইপ করলেই বা QR স্ক্যান করলেই তাৎক্ষণিক খেলা শুরু।",
    glow: "from-sky-500/20 via-blue-500/10 to-transparent",
    border: "border-sky-400/40 hover:border-sky-400",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/30",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-600",
    ringClass: "ring-2 ring-cyan-400/50 shadow-[0_0_35px_rgba(34,211,238,0.25)] hover:ring-cyan-300 hover:shadow-[0_0_60px_rgba(34,211,238,0.45)]",
    vector: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="30" y="16" width="40" height="68" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
        <rect x="36" y="24" width="28" height="46" rx="4" fill="#0f172a" />
        <circle cx="50" cy="76" r="3" fill="#38bdf8" />
        <path d="M44 42L50 48L58 38" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function HomeGameFeatures() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section id="game-features" className="relative w-full overflow-hidden bg-[#070b1e] py-20 px-4 sm:px-8 lg:px-12 xl:px-16 text-white border-t border-slate-800">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute bottom-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="pg-grid-lines absolute inset-0 opacity-20" />
      </div>

      <div className="relative w-full max-w-[1700px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/10 px-4 py-1.5 text-xs font-black text-teal-300 backdrop-blur-md shadow-lg shadow-teal-950/40">
            <span>🎮</span>
            <span>রোমাঞ্চকর কুইজ গেমিং অভিজ্ঞতা</span>
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            কুইজ নয়, যেন সরাসরি <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(45,212,191,0.25)]">
              ই-স্পোর্টস গেমিং টুর্নামেন্ট!
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            বন্ধুদের সাথে লাইভ প্রতিযোগিতা, ইনস্ট্যান্ট পয়েন্ট স্কোরিং, স্পিড বোনাস এবং কনফেটি উদযাপনে প্রতিটি মুহূর্ত হোক আনন্দময়।
          </p>
        </div>

        {/* 6 High-Impact Glowing Glass Vector Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {GAME_FEATURES.map((f) => {
            const isHovered = activeCard === f.id;
            return (
              <div
                key={f.id}
                onMouseEnter={() => setActiveCard(f.id)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative rounded-3xl border-2 ${f.border} ${f.ringClass} bg-slate-900/80 p-7 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2.5 overflow-hidden cursor-default`}
              >
                {/* Dynamic radial glow on hover */}
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${f.glow} blur-3xl transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : "opacity-40"
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  {/* Vector SVG Graphic */}
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-950/70 border border-white/10 p-2 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {f.vector}
                  </div>

                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-teal-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm font-bold text-teal-400/90">
                    {f.tagline}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black text-white/80">
                  <span className="flex items-center gap-1 text-teal-400">
                    <span>লাইভ ইন্টারঅ্যাকশন</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
                  </span>
                  <span className="text-white/40 font-mono">Game Mode 2.0</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Battle Arena Visual Feature Strip */}
        <div className="mt-14 overflow-hidden rounded-3xl border-2 border-teal-400/50 ring-2 ring-teal-400/40 shadow-[0_0_50px_rgba(45,212,191,0.25)] hover:ring-teal-300 hover:shadow-[0_0_70px_rgba(45,212,191,0.4)] bg-gradient-to-r from-teal-950/70 via-slate-900/90 to-indigo-950/70 p-6 sm:p-10 backdrop-blur-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/40 bg-teal-500/20 px-3.5 py-1 text-xs font-black text-teal-300">
                ⚡ ক্লাসে গেমিং বিপ্লব
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white">
                যেকোনো স্মার্টফোন বা ট্যাবলেট দিয়েই খেলা সম্ভব!
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                কোনো ভারী কনফিগুরেশন নেই। প্রজেক্টরে প্রশ্ন ভেসে উঠলেই ক্লাসের সবাই তাদের সাধারণ স্মার্টফোন থেকে উত্তর দিয়ে সরাসরি মেধার লড়াইয়ে যোগ দিতে পারে।
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/join"
                className="w-full text-center rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 px-6 py-4 text-base font-black text-slate-950 shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-95 transition"
              >
                🎮 এখনই গেম পিন দিয়ে যোগ দিন
              </Link>
              <Link
                href="/leaderboard"
                className="w-full text-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition"
              >
                🏆 সেরা লিডারবোর্ড দেখুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
