"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";

const QUESTION_TYPES = [
  { type: "বহুনির্বাচনী (MCQ)", desc: "৪ বা ৫ অপশনের স্ট্যান্ডার্ড এমসিকিউ সাথে ব্যাখ্যা", badge: "জনপ্রিয়" },
  { type: "সত্য / মিথ্যা (True/False)", desc: "দ্রুত ধারণা ও বেসিক যাচাই", badge: "র‍্যাপিড" },
  { type: "শূন্যস্থান পূরণ (Fill in Blanks)", desc: "সঠিক শব্দ বা সংখ্যা ইনপুট", badge: "মেমোরি" },
  { type: "বাম-ডান মিলকরণ (Matching)", desc: "টেনে এনে অপশন মেলানো", badge: "ইন্টারেক্টিভ" },
  { type: "ক্রম সাজানো (Ordering)", desc: "ধাপগুলো সঠিক ক্রমে ড্র্যাগ অ্যান্ড ড্রপ", badge: "লজিক্যাল" },
  { type: "কোড বা ফর্মুলা সমাধান", desc: "প্রোগ্রামিং সিনট্যাক্স ও গাণিতিক সমীকরণ", badge: "কারিগরি" },
  { type: "ছবি ও ডায়াগ্রাম ভিত্তিক", desc: "যন্ত্রাংশ বা সার্কিট চিহ্নিতকরণ", badge: "ভিজ্যুয়াল" },
  { type: "অডিও লিসেনিং কুইজ", desc: "ভয়েস প্রম্পট শুনে উত্তর নির্ধারণ", badge: "মাল্টিমিডিয়া" },
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300">
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
            {QUESTION_TYPES.map((q, i) => (
              <ScrollReveal key={q.type} variant="fade-up" delay={i * 60} duration={550}>
                <div
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl hover:border-indigo-400/50 hover:bg-slate-900/80 transition-all duration-200 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 text-[10px] font-bold">
                      {q.badge}
                    </span>
                    <span className="text-xs text-slate-500">ফরম্যাট</span>
                  </div>
                  <h4 className="mt-3 text-sm font-black text-white group-hover:text-indigo-200 transition">
                    {q.type}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {q.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
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

