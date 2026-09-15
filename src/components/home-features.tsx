"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  ListTodo,
  HelpCircle,
  Type,
  ArrowLeftRight,
  SortAsc,
  Code2,
  Image as ImageIcon,
  Headphones,
} from "lucide-react";

const QUESTION_TYPES = [
  {
    type: "বহুনির্বাচনী (MCQ)",
    desc: "৪ বা ৫ অপশনের স্ট্যান্ডার্ড এমসিকিউ সাথে ব্যাখ্যা",
    badge: "জনপ্রিয়",
    icon: ListTodo,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30 bg-blue-500/10",
    glowClass: "border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.45)]",
    iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    type: "সত্য / মিথ্যা (True/False)",
    desc: "দ্রুত ধারণা ও বেসিক যাচাই",
    badge: "র‍্যাপিড",
    icon: HelpCircle,
    color: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30 bg-teal-500/10",
    glowClass: "border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-gradient-to-br from-teal-950/40 via-slate-950 to-slate-950 hover:border-teal-400 hover:shadow-[0_0_25px_rgba(20,184,166,0.45)]",
    iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
  {
    type: "শূন্যস্থান পূরণ",
    desc: "সঠিক শব্দ বা সংখ্যা টাইপ করে ইনপুট",
    badge: "মেমোরি",
    icon: Type,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 bg-purple-500/10",
    glowClass: "border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.45)]",
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    type: "বাম-ডান মিলকরণ",
    desc: "ইন্টারেক্টিভ উপায়ে টেনে এনে অপশন মেলানো",
    badge: "ম্যাচিং",
    icon: ArrowLeftRight,
    color: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30 bg-rose-500/10",
    glowClass: "border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]",
    iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    type: "ক্রম সাজানো (Ordering)",
    desc: "ধাপগুলো সঠিক ক্রমে ড্র্যাগ অ্যান্ড ড্রপ",
    badge: "লজিক্যাল",
    icon: SortAsc,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 bg-amber-500/10",
    glowClass: "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.45)]",
    iconColor: "text-amber-400 bg-amber-50/10 border-amber-500/20",
  },
  {
    type: "কোড ও ফর্মুলা সমাধান",
    desc: "প্রোগ্রামিং সিনট্যাক্স ও গাণিতিক সমীকরণ",
    badge: "কারিগরি",
    icon: Code2,
    color: "from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/30 bg-violet-500/10",
    glowClass: "border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)] bg-gradient-to-br from-violet-950/40 via-slate-950 to-slate-950 hover:border-violet-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.45)]",
    iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  {
    type: "ছবি ও ডায়াগ্রাম ভিত্তিক",
    desc: "যন্ত্রাংশ, সার্কিট বা ম্যাপ চিহ্নিতকরণ",
    badge: "ভিজ্যুয়াল",
    icon: ImageIcon,
    color: "from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30 bg-sky-500/10",
    glowClass: "border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)] bg-gradient-to-br from-sky-950/40 via-slate-950 to-slate-950 hover:border-sky-400 hover:shadow-[0_0_25px_rgba(14,165,233,0.45)]",
    iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  {
    type: "অডিও লিসেনিং কুইজ",
    desc: "ভয়েস প্রম্পট শুনে সঠিক উত্তর নির্ধারণ",
    badge: "মাল্টিমিডিয়া",
    icon: Headphones,
    color: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    glowClass: "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.45)]",
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
];

export function HomeFeatures() {
  return (
    <section className="relative w-full bg-slate-900 text-white py-20 px-4 sm:px-8 lg:px-14 xl:px-20 overflow-hidden border-t border-slate-800">
      {/* Dynamic backdrop glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-20">
        {/* Section 1: 17+ Question Formats Showcase */}
        <div>
          <ScrollReveal variant="fade-up" duration={600}>
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-sm">
                🎯 বৈচিত্র্যময় মূল্যায়ন
              </span>
              <h2 className="mt-4 text-2xl sm:text-4xl font-black text-white tracking-tight">
                ১৭+ ধরনের আধুনিক প্রশ্নের ফরম্যাট
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300">
                শুধু গতানুগতিক টিক চিহ্ন নয় — ব্যবহারিক দক্ষতা, ডায়াগ্রাম চিহ্নিতকরণ ও সমীকরণ সমাধানের উপযোগী।
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUESTION_TYPES.map((q, i) => {
              const IconComp = q.icon;
              return (
                <ScrollReveal key={q.type} variant="fade-up" delay={i * 50} duration={550}>
                  <div
                    className={`relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1.5 ${q.glowClass}`}
                  >
                    {/* Dynamic SVG Vector grid inside the card */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition duration-300">
                      <svg className="h-full w-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id={`grid-${i}`} width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill={`url(#grid-${i})`} />
                      </svg>
                    </div>

                    <div className="absolute -right-4 -bottom-4 h-24 w-24 text-white/[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-500">
                      <svg className="h-full w-full" fill="currentColor" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" fill="none" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-bold ${q.color}`}>
                        {q.badge}
                      </span>
                      <div className={`p-2 rounded-xl border group-hover:scale-110 transition duration-300 ${q.iconColor}`}>
                        <IconComp size={18} />
                      </div>
                    </div>
                    <h4 className="mt-4 text-base font-black text-white group-hover:text-white transition relative z-10">
                      {q.type}
                    </h4>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition relative z-10">
                      {q.desc}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Section 2: High-Tech Highlights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-b from-teal-950/40 to-slate-950 p-8 relative overflow-hidden group hover:border-teal-400/60 transition">
            <span className="text-3xl">🤖</span>
            <h3 className="mt-4 text-xl font-black text-white">
              এআই প্রশ্ন জেনারেটর
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              যেকোনো পাঠ্যবইয়ের PDF আপলোড করুন অথবা অধ্যায়ের নাম লিখুন। আমাদের এআই সরাসরি সহজ, মাঝারি ও কঠিন তিন স্তরে ব্যাখ্যাসহ প্রশ্ন তৈরি করে দেয়।
            </p>
            <div className="mt-6">
              <Link
                href="/demo?role=teacher&next=/teacher/ai"
                className="inline-flex items-center gap-1.5 text-xs font-black text-teal-300 hover:text-teal-200 underline decoration-2 underline-offset-4"
              >
                এআই টুল ব্যবহার করুন →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950 p-8 relative overflow-hidden group hover:border-indigo-400/60 transition">
            <span className="text-3xl">📡</span>
            <h3 className="mt-4 text-xl font-black text-white">
              সার্ভার-অথরিটেটিভ লাইভ ইঞ্জিন
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              ক্লাসের ৫০ থেকে ৫০০ জন শিক্ষার্থী একসাথে প্রজেক্টরের সাথে ৫০ মিলিসেকেন্ড লেটেন্সিতে সিঙ্ক থাকবে। কারও নেট ড্রপ হলেও স্বয়ংক্রিয় রিকানেক্ট।
            </p>
            <div className="mt-6">
              <Link
                href="/demo?role=teacher&next=/teacher/live"
                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-300 hover:text-indigo-200 underline decoration-2 underline-offset-4"
              >
                লাইভ ডেমো দেখুন →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-slate-950 p-8 relative overflow-hidden group hover:border-amber-400/60 transition">
            <span className="text-3xl">📝</span>
            <h3 className="mt-4 text-xl font-black text-white">
              নিরাপদ অনলাইন পরীক্ষা মোড
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              টাইমার লক, ট্যাব সুইচ সতর্কবার্তা, প্রশ্নের ক্রম এলোমেলো করা (Shuffle) এবং স্বয়ংক্রিয় ও তাৎক্ষণিক ফলাফল ও গ্রেডশিট প্রস্তুতকরণ।
            </p>
            <div className="mt-6">
              <Link
                href="/demo?role=teacher&next=/teacher/quizzes%3Fmode%3Dexam"
                className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 hover:text-amber-200 underline decoration-2 underline-offset-4"
              >
                পরীক্ষা মোড দেখুন →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

