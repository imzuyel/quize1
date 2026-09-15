import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSeo } from "@/lib/seo";
import { mergeHeroSettings } from "@/lib/frontend-config";
import { LandingPreviews } from "@/components/landing-previews";
import { RoleGrid } from "@/components/demo-entry";
import { AUTHOR, DeveloperCard, SocialRing } from "@/components/credit";
import { HomeHero } from "@/components/home-hero";
import { HomeGuide } from "@/components/home-guide";
import { HomeFeatures } from "@/components/home-features";
import { HomeGameFeatures } from "@/components/home-game-features";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: "✨", title: "এআই প্রশ্ন জেনারেটর", body: "ক্লাস, ট্রেড, বিষয়, অধ্যায় ও টপিক বেছে ১০ থেকে ১০০০+ প্রশ্ন তৈরি করুন — ব্যাখ্যা, হিন্ট ও কোয়ালিটি চেকসহ।", href: "/demo?next=/teacher/ai" },
  { icon: "📘", title: "বই থেকে প্রশ্ন", body: "সম্পূর্ণ বইয়ের PDF আপলোড করে অধ্যায় বা পেজ রেঞ্জ বেছে প্রশ্ন, শর্ট প্রশ্ন ও পাজল তৈরি করুন।", href: "/demo?next=/teacher/ai%3Ftab%3Ddocument" },
  { icon: "📡", title: "লাইভ ক্লাসরুম কুইজ", body: "গেম পিন ও QR কোডে শিক্ষার্থীরা যোগ দেয়। সার্ভার-অথরিটেটিভ ইঞ্জিন সবাইকে সিঙ্ক রাখে।", href: "/demo?next=/teacher/live" },
  { icon: "📝", title: "ফরমাল অনলাইন পরীক্ষা", body: "প্রশ্ন প্যালেট, মার্ক ফর রিভিউ, অটো-সেভ, নেগেটিভ মার্কিং ও অটো-সাবমিট।", href: "/demo?next=/student/quizzes" },
  { icon: "🎨", title: "টেমপ্লেট স্টুডিও", body: "১৬টি অ্যানিমেটেড থিম — রঙ, পার্টিকেল, টাইমার স্টাইল ও উদযাপন কাস্টমাইজ করুন।", href: "/demo?next=/teacher/templates" },
  { icon: "📈", title: "অ্যানালিটিক্স ও রিপোর্ট", body: "বিষয়ভিত্তিক পারফরম্যান্স, কঠিন প্রশ্ন, এআই শিক্ষণ পরামর্শ ও CSV এক্সপোর্ট।", href: "/demo?next=/teacher/analytics" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const seo = await getSeo();
  const brandingRow = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, "branding")).limit(1);
  const branding = (brandingRow[0]?.value ?? {}) as Record<string, string | boolean>;
  const heroRow = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, "hero")).limit(1);
  const heroSettings = mergeHeroSettings(heroRow[0]?.value);
  const unavailable = sp.demo === "unavailable";
  const user = await getCurrentUser();
  const demoMode = process.env.DEMO_MODE !== "false";
  const home =
    user?.role === "teacher"
      ? "/teacher"
      : user?.role === "admin" || user?.role === "super_admin"
        ? "/admin"
        : user?.role === "parent"
          ? "/parent"
          : "/student";

  return (
    <div className="min-h-screen bg-transparent text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Header - Full Screen Ultra Glass Design */}
      <header className="sticky top-0 z-50 border-b border-teal-500/20 bg-[#060a1e]/45 shadow-2xl backdrop-blur-2xl">
        <div className="w-full max-w-[1700px] mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-indigo-500 to-violet-600 font-black text-white shadow-lg shadow-teal-500/30 text-base group-hover:scale-105 transition-transform">
              🎮
            </span>
            <div className="leading-tight max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-none">
              <p className="text-sm sm:text-base font-black text-white tracking-wide group-hover:text-teal-300 transition-colors truncate">{seo.siteName}</p>
              <p className="hidden text-[10px] text-teal-300/80 font-bold sm:block truncate">{seo.siteNameEn}</p>
            </div>
          </Link>

          {/* Quick Nav Links with Glow & Pill Styling */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 backdrop-blur-md">
            <Link href="/join" className="rounded-full px-3.5 py-1.5 text-xs font-black text-teal-300 hover:bg-teal-500/20 transition">🎮 কুইজে যোগ দিন</Link>
            <Link href="#game-features" className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition">⚡ গেম ফিচার</Link>
            <Link href="/leaderboard" className="rounded-full px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition">🏆 লিডারবোর্ড</Link>
            <Link href="/gallery" className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition">🎨 গ্যালারি</Link>
            <Link href="/reviews" className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition">💬 রিভিউ</Link>
            <Link href="/about" className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition">পরিচিতি</Link>
          </nav>

          {/* Dedicated Student & Teacher Actions */}
          <div className="flex items-center gap-2.5">
            {/* Student Direct Join Button with Glow Pulse */}
            <Link
              href="/join"
              className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-teal-500/30 hover:brightness-110 active:scale-95 transition"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
              <span>🎮 গেম পিন দিন</span>
            </Link>

            {/* Teacher Dedicated Link */}
            <Link
              href={user?.role === "teacher" ? "/teacher" : "/demo?role=teacher&next=/teacher"}
              className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-indigo-400/30 bg-indigo-600/20 px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-200 hover:bg-indigo-600/40 transition"
            >
              <span>👨‍🏫</span>
              <span>শিক্ষক পোর্টাল</span>
            </Link>

            {user ? (
              <Link
                href={home}
                className="rounded-2xl bg-white/10 border border-white/20 px-3 py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
              >
                ড্যাশবোর্ড
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Ticker notice */}
      {heroSettings.showTicker && heroSettings.tickerText ? (
        <div className="border-b border-teal-500/20 bg-gradient-to-r from-teal-950/90 via-slate-950 to-indigo-950/90 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-teal-200 backdrop-blur">
          {heroSettings.tickerText}
        </div>
      ) : null}

      {unavailable ? (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-amber-200">
          ⚠️ ডেমো ডেটা প্রস্তুত হচ্ছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন —{" "}
          <a href="/demo?next=/teacher/ai" className="underline">রিফ্রেশ করুন</a>
        </div>
      ) : null}

      {/* 1. Full-Screen Modern Hero */}
      {heroSettings.showHero ? (
        <HomeHero signedIn={Boolean(user)} userRole={user?.role} settings={heroSettings} />
      ) : null}

      {/* 2. Interactive Step-by-Step Scroll Walkthrough: How to Join & Play */}
      <HomeGuide />

      {/* 3. Ultra-Design Glow Glass Vector Cards & Game Features */}
      <HomeGameFeatures />

      {/* 4. Interactive Live Feature Preview Tab Component */}
      <section className="relative w-full bg-transparent py-16 px-4 sm:px-8 lg:px-14 xl:px-20 border-t border-slate-800/80 overflow-hidden">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-300">
              ⚡ লাইভ ডেমো ও প্রিভিউ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              স্মার্ট কুইজ ও ক্লাস অ্যানালিটিক্স লাইভ দেখুন
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              সিস্টেমটি দেখতে কেমন এবং কুইজ খেলায় কীভাবে শিক্ষার্থীরা লাইভ ইন্টারঅ্যাক্ট করে তা ডানপাশের লাইভ প্রিভিউ ট্যাবে এখনই পরখ করে দেখুন।
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/join"
                className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-black text-slate-950 transition shadow-lg shadow-teal-500/30"
              >
                🎮 লাইভ কুইজে যোগ দিন
              </Link>
              <Link
                href="/demo?role=teacher&next=/teacher/live"
                className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition"
              >
                📡 লাইভ হোস্ট ট্রাই করুন
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <LandingPreviews />
          </div>
        </div>
      </section>

      {/* 5. Full-Screen Vocational Trades & 17+ Question Formats Grid */}
      <HomeFeatures />

      {/* 6. Core Platform Features Bento Grid */}
      <section className="relative w-full bg-transparent py-20 px-4 sm:px-8 lg:px-14 xl:px-20 border-t border-slate-800">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-300">
              🎛️ অল-ইন-ওয়ান কুইজ স্টুডিও
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black text-white tracking-tight">
              রোমাঞ্চকর কুইজ ও মাল্টিপ্লেয়ার গেম স্টুডিও
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              প্রশ্ন ব্যাংক, কুইজ স্টুডিও, লাইভ ইঞ্জিন, পরীক্ষা মোড, অনুশীলন, অ্যানালিটিক্স ও ট্রফি — যেকোনো বিষয়ে তাৎক্ষণিক কুইজ খেলা ও প্র্যাকটিস।
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <a
                key={f.title}
                href={demoMode ? f.href : "/login"}
                className="group relative rounded-3xl border border-teal-500/20 bg-slate-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-400/60 hover:bg-slate-900 shadow-xl overflow-hidden block ring-1 ring-teal-500/10 hover:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/15 border border-teal-400/30 text-2xl group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-black text-white group-hover:text-teal-300 transition">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {f.body}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-teal-400 group-hover:translate-x-1 transition-transform">
                  <span>এখনই দেখুন</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Multi-Role Direct Entry Showcase */}
      {demoMode ? (
        <section id="roles" className="relative w-full scroll-mt-20 border-t border-slate-800 bg-transparent py-16 px-4 sm:px-8 lg:px-14 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                ভূমিকা নির্বাচন
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                সকল স্টেকহোল্ডারের জন্য পৃথক পোর্টাল
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                যেকোনো ভূমিকায় ক্লিক করে সাথে সাথে সেই নির্দিষ্ট ইন্টারফেসে প্রবেশ করুন।
              </p>
            </div>
            <div className="mt-8">
              <RoleGrid />
            </div>
          </div>
        </section>
      ) : null}

      {/* 7. Developer & Institutional Credits */}
      <section className="relative w-full border-t border-slate-800/80 bg-transparent py-16 px-4 sm:px-8 lg:px-14 xl:px-20 overflow-hidden">
        {/* Subtle Ambient Radial Glow Effect */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-teal-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto z-10">
          <div className="text-center mb-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 px-3.5 py-1 text-xs font-extrabold text-teal-300 shadow-[0_0_15px_-3px_rgba(20,184,166,0.4)] backdrop-blur">
              🏛️ কারিগরি নেতৃত্ব ও প্রতিষ্ঠাতা
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              কারিগরি প্রতিষ্ঠাতা ও পরিচিতি
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              শিক্ষার্থীদের উচ্চমানের শিক্ষা ও কারিগরি শিক্ষার ডিজিটাল রূপান্তরের লক্ষ্যে নির্মিত
            </p>
          </div>
          
          {/* Developer Card with subtle ambient shadow & glow container */}
          <div className="relative rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9),0_0_35px_-5px_rgba(20,184,166,0.25)]">
            <DeveloperCard branding={branding} />
          </div>
        </div>
      </section>

      {/* 8. Full-Width Clean Modern Footer */}
      <footer className="border-t border-white/10 bg-[#050816] py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-black text-white text-base">{String(branding.schoolName || seo.siteName)}</p>
              <p className="mt-1 text-xs text-slate-400">{String(branding.contact || "")} {branding.email ? `| ${String(branding.email)}` : ""}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/join" className="text-xs font-bold text-teal-400 hover:underline">কুইজে যোগ দিন</Link>
              <Link href="/leaderboard" className="text-xs font-bold text-slate-300 hover:underline">লিডারবোর্ড</Link>
              <Link href="/demo?role=teacher&next=/teacher" className="text-xs font-bold text-indigo-400 hover:underline">শিক্ষক ড্যাশবোর্ড</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ডেভেলপার ও ইন্সট্রাক্টর</p>
              <p className="mt-0.5 text-sm font-bold text-white/90">{String(branding.developerName || AUTHOR.name)}</p>
              <p className="text-[11px] text-slate-400">{String(branding.developerTitle || AUTHOR.title)}</p>
            </div>
            <SocialRing tone="dark" size={20} />
          </div>
          <p className="mt-6 text-center md:text-left text-xs text-slate-500">
            {String(branding.copyright || "© পঞ্চগড় সরকারি কারিগরি স্কুল ও কলেজ — কারিগরি শিক্ষা অধিদপ্তর")}
          </p>
        </div>
      </footer>
    </div>
  );
}
