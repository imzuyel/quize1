"use client";

import { useEffect, useState } from "react";
import { cx } from "./ui";

const TABS = [
  { id: "ai", label: "✨ এআই জেনারেটর" },
  { id: "live", label: "🎮 লাইভ কুইজ" },
  { id: "board", label: "🏆 লিডারবোর্ড" },
  { id: "studio", label: "🎨 টেমপ্লেট" },
  { id: "stats", label: "📊 অ্যানালিটিক্স" },
];

export function LandingPreviews() {
  const [tab, setTab] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const id = setInterval(() => setTab((t) => (t + 1) % TABS.length), 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (TABS[tab].id !== "ai") return;
    setProgress(8);
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 4)), 90);
    return () => clearInterval(id);
  }, [tab]);

  const active = TABS[tab].id;

  return (
    <div className="w-full">
      {/* Tab Navigation Pills */}
      <div className="mb-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setTab(i)}
            className={cx(
              "rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer",
              i === tab
                ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/30 scale-105"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white border border-white/10",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Preview Container with Crystal-Clear High Contrast Dark Glass */}
      <div className="rounded-3xl border-2 border-teal-400/40 bg-[#090f28]/95 p-5 shadow-[0_0_50px_rgba(20,184,166,0.2)] backdrop-blur-2xl text-white">
        {active === "ai" ? (
          <div key="ai" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                এআই অটো-প্রশ্ন জেনারেটর
              </span>
              <span className="text-xs font-black font-mono text-amber-300">
                AI Engine 3.5
              </span>
            </div>
            
            <p className="text-sm font-bold text-white">
              ক্লাস ১০ · কম্পিউটার ও আইসিটি · HTML ফর্ম ও মাল্টিমিডিয়া
            </p>

            <div className="space-y-1">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-teal-400/30 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-teal-300/90 font-mono">
                <span>স্মার্ট প্রশ্ন তৈরি হচ্ছে...</span>
                <span>{progress}% সম্পন্ন</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { title: "MCQ · সহজ স্তর · বাংলা ব্যাখ্যাসহ প্রস্তুত", color: "border-teal-400/30 bg-teal-500/10 text-teal-200" },
                { title: "সত্য/মিথ্যা · মাঝারি স্তর · তাৎক্ষণিক মূল্যায়ন", color: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200" },
                { title: "চিত্র ধাঁধা ও কেস স্টাডি · উচ্চতর দক্ষতা", color: "border-amber-400/30 bg-amber-500/10 text-amber-200" },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-2 rounded-xl border ${item.color} px-3 py-2 text-xs font-bold`}
                >
                  <span>✅</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {active === "live" ? (
          <div key="live" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-xl border border-teal-400/50 bg-teal-500/20 px-3 py-1 text-xs font-black text-teal-300 font-mono">
                PIN: 489215
              </span>
              <span className="text-xs font-black text-amber-300">
                ⏱ প্রশ্ন ৩/১০
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              ওয়েব ফর্মে ইউজার ইনপুট গ্রহণের জন্য কোন HTML ট্যাগ ব্যবহৃত হয়?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "<input>", color: "bg-rose-500/25 border-rose-400/60 text-rose-100", correct: true, opt: "A" },
                { label: "<entry>", color: "bg-blue-500/25 border-blue-400/60 text-blue-100", correct: false, opt: "B" },
                { label: "<field>", color: "bg-amber-500/25 border-amber-400/60 text-amber-100", correct: false, opt: "C" },
                { label: "<submit>", color: "bg-emerald-500/25 border-emerald-400/60 text-emerald-100", correct: false, opt: "D" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-xl border-2 ${item.color} p-3 text-xs font-black shadow-md ${
                    item.correct ? "ring-2 ring-rose-400/80" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-white/20 text-[10px] grid place-items-center font-mono">
                      {item.opt}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.correct ? <span>✅</span> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {active === "board" ? (
          <div key="board" className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-teal-300">
              <span>🏆 শীর্ষ প্রতিযোগী লিডারবোর্ড</span>
              <span className="text-[11px] text-amber-300">লাইভ স্কোর</span>
            </div>

            {[
              { rank: "🥇 ১ম", name: "সাদিয়া আক্তার", score: "8,420 pt", bg: "bg-amber-500/15 border-amber-400/40 text-amber-200" },
              { rank: "🥈 ২য়", name: "রিফাত হোসেন", score: "7,980 pt", bg: "bg-slate-300/15 border-slate-300/40 text-slate-200" },
              { rank: "🥉 ৩য়", name: "নুসরাত জাহান", score: "7,610 pt", bg: "bg-amber-700/20 border-amber-600/40 text-amber-300" },
              { rank: "৪র্থ", name: "মেহেদী হাসান", score: "7,010 pt", bg: "bg-slate-800/40 border-white/10 text-slate-300" },
            ].map((p) => (
              <div
                key={p.name}
                className={`flex items-center justify-between rounded-xl border ${p.bg} px-3.5 py-2 text-xs font-bold`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm">{p.rank}</span>
                  <span className="text-white">{p.name}</span>
                </div>
                <span className="font-mono font-black text-teal-300">{p.score}</span>
              </div>
            ))}
          </div>
        ) : null}

        {active === "studio" ? (
          <div key="studio" className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-teal-300">
              <span>🎨 গেম থিম ও ভিজ্যুয়াল স্টুডিও</span>
              <span className="text-amber-300">৬+ থিম</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "সাইবার নিয়ন", bg: "linear-gradient(135deg, #09112a, #0d9488)" },
                { name: "ভায়োলেট গ্যালাক্সি", bg: "linear-gradient(135deg, #1e1b4b, #7c3aed)" },
                { name: "রোজ এনার্জি", bg: "linear-gradient(135deg, #4c0519, #e11d48)" },
                { name: "এমারেল্ড ফরেস্ট", bg: "linear-gradient(135deg, #022c22, #059669)" },
                { name: "সানসেট গোল্ড", bg: "linear-gradient(135deg, #451a03, #d97706)" },
                { name: "ডিপ ওশান", bg: "linear-gradient(135deg, #082f49, #0284c7)" },
              ].map((theme, i) => (
                <div
                  key={i}
                  className="group relative h-16 rounded-2xl border-2 border-white/20 p-2 flex flex-col justify-end shadow-md transition-all hover:scale-105 cursor-pointer overflow-hidden"
                  style={{ background: theme.bg }}
                >
                  <span className="text-[10px] font-black text-white drop-shadow-md">
                    {theme.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-300 font-medium">
              রঙ, ফন্ট, টাইমার সাউন্ড ইফেক্ট ও ট্রানজিশন প্রতিটি প্রশ্নের জন্য কাস্টমাইজযোগ্য।
            </p>
          </div>
        ) : null}

        {active === "stats" ? (
          <div key="stats" className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-teal-300">
              <span>📊 রিয়েল-টাইম অ্যাকুরেসি রেট</span>
              <span className="text-emerald-400">গড় ৮৪.২%</span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "কম্পিউটার ও আইসিটি", val: 88, color: "from-teal-400 to-emerald-400" },
                { name: "উচ্চতর গণিত", val: 82, color: "from-indigo-400 to-violet-400" },
                { name: "ইলেকট্রনিক্স ইঞ্জিনিয়ারিং", val: 76, color: "from-cyan-400 to-blue-500" },
                { name: "ইংরেজি ব্যাকরণ", val: 90, color: "from-amber-400 to-orange-400" },
              ].map((sub) => (
                <div key={sub.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>{sub.name}</span>
                    <span className="font-mono text-teal-300">{sub.val}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${sub.color}`}
                      style={{ width: `${sub.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
