"use client";
// NOTE: metadata lives in the sibling layout because this is a client page.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import { FUN_AVATARS } from "@/lib/avatar";

function JoinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { push } = useToast();
  const [pin, setPin] = useState(params.get("pin") ?? "");
  const [joinMode, setJoinMode] = useState<"code" | "keyword">("code");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pg_nickname");
    if (saved) {
      // If starts with emoji, extract avatar
      const first = saved.split(" ")[0];
      if (FUN_AVATARS.some((a) => a.emoji === first)) {
        setSelectedAvatar(first);
        setNickname(saved.slice(first.length).trim());
      } else {
        setNickname(saved);
      }
    }
  }, []);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const joinKey = pin.trim();
      const rawName = nickname.trim();
      const fullNickname = rawName ? `${selectedAvatar} ${rawName}` : selectedAvatar;
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "join",
          ...(joinMode === "code" ? { pin: joinKey } : { keyword: joinKey }),
          nickname: fullNickname,
          // Reuse the player record after refresh instead of creating a second
          // lobby entry for the same browser.
          playerId: localStorage.getItem(`pg_player_${joinKey}`) ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "যোগ দেওয়া যায়নি");
      const canonicalPin = String(data.pin || joinKey);
      localStorage.setItem("pg_nickname", String(data.nickname || fullNickname));
      localStorage.setItem(`pg_player_${canonicalPin}`, String(data.playerId));
      localStorage.setItem(`pg_player_nickname_${canonicalPin}`, String(data.nickname || fullNickname));
      router.push(`/play/${encodeURIComponent(canonicalPin)}`);
    } catch (err) {
      push(err instanceof Error ? err.message : "সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent px-4 py-5 sm:px-6 sm:py-8 text-white selection:bg-teal-500 selection:text-slate-950">
      {/* Background Animated Glowing Ambient Orbs and SVGs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
        
        {/* Vector Grid and Radar Circles */}
        <svg className="absolute inset-0 h-full w-full opacity-15" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="join-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#join-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col z-10">
        {/* Navigation Bar */}
        <header className="mb-6 flex items-center justify-between gap-3 text-white sm:mb-10">
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-indigo-500 to-violet-600 font-black shadow-lg shadow-teal-500/30 text-white group-hover:scale-105 transition-transform">
              🎮
            </span>
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-black tracking-tight text-white group-hover:text-teal-300 transition-colors">
                PGTSC Quiz Arena
              </span>
              <span className="hidden text-[10px] font-bold text-teal-300/80 sm:block">
                লাইভ ক্লাসরুম প্লেয়ার
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/10 px-3.5 py-1.5 text-xs font-black text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)] backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
              </span>
              <span>LIVE CLASSROOM</span>
            </div>
            <Link
              href="/leaderboard"
              className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur hover:bg-amber-500/20 transition"
            >
              🏆 লিডারবোর্ড
            </Link>
          </div>
        </header>

        {/* Main Stage Grid */}
        <main className="grid flex-1 items-center gap-8 pb-8 lg:grid-cols-[1fr_450px] lg:gap-14">
          {/* Left Hero Description (High Contrast) */}
          <section className="hidden text-white lg:block space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[.2em] text-cyan-300 backdrop-blur shadow-md">
              <span>⚡</span> PLAY • LEARN • WIN
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight text-white">
              একটি কোড লিখুন,<br />
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(45,212,191,0.3)]">
                খেলা শুরু করুন!
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-slate-300 font-medium">
              লাইভ কুইজে যোগ দিন, প্রজেক্টরের সাথে সরাসরি সিঙ্ক হয়ে সবার আগে উত্তর দিন এবং লিডারবোর্ডে নিজের শীর্ষস্থান দখল করুন।
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {[
                ["⚡", "৫০ms লো-লেটেন্সি", "border-teal-400/40 bg-teal-500/10 text-teal-300"],
                ["🎯", "স্মার্ট অবতার", "border-violet-400/40 bg-violet-500/10 text-violet-300"],
                ["🏆", "রিয়েল-টাইম পোডিয়াম", "border-amber-400/40 bg-amber-500/10 text-amber-300"],
              ].map(([icon, label, clr]) => (
                <span
                  key={label}
                  className={`rounded-2xl border ${clr} px-4 py-3 text-sm font-black backdrop-blur-md shadow-md flex items-center gap-2`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>

            {/* Quick Helper Graphic */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl max-w-md flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-400/20 border border-teal-400/40 grid place-items-center text-2xl">
                💡
              </div>
              <div className="text-xs text-slate-300">
                <p className="font-bold text-white text-sm">কোনো অ্যাকাউন্ট লাগবে না</p>
                <p className="text-slate-400 mt-0.5">শিক্ষকের প্রজেক্টর থেকে ৬ সংখ্যার পিন কোড দেখে টাইপ করলেই যথেষ্ট।</p>
              </div>
            </div>
          </section>

          {/* Right Join Game Card (Ultra-High-Contrast Dark Glass Card) */}
          <div className="relative rounded-3xl border-2 border-teal-400/50 bg-[#0c132e]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(20,184,166,0.3)] ring-1 ring-teal-400/30">
            {/* Header / Title (100% High Contrast & Fully Visible) */}
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/40 bg-teal-500/15 px-3.5 py-1 text-xs font-black uppercase tracking-[.18em] text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.3)]">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                <span>LIVE CLASSROOM</span>
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                চলুন খেলি!
              </h2>
              <p className="mt-1 text-sm font-semibold text-teal-200/90">
                ৬ সংখ্যার গেম পিন অথবা কিওয়ার্ড দিন
              </p>
            </div>

            <form onSubmit={join} className="space-y-4">
              {/* Tab Selector: Code vs Keyword */}
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-950/80 p-1.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setJoinMode("code");
                    setPin("");
                  }}
                  className={`rounded-xl py-2.5 text-xs sm:text-sm font-black transition cursor-pointer ${
                    joinMode === "code"
                      ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔢 কোড / PIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoinMode("keyword");
                    setPin("");
                  }}
                  className={`rounded-xl py-2.5 text-xs sm:text-sm font-black transition cursor-pointer ${
                    joinMode === "keyword"
                      ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔤 কিওয়ার্ড
                </button>
              </div>

              {/* PIN / Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                  {joinMode === "code" ? "গেম পিন (PIN Code)" : "গেম কিওয়ার্ড (Keyword)"} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    value={pin}
                    onChange={(e) =>
                      setPin(
                        joinMode === "code"
                          ? e.target.value.replace(/\D/g, "").slice(0, 6)
                          : e.target.value.replace(/\s/g, "").toUpperCase().slice(0, 32)
                      )
                    }
                    inputMode={joinMode === "code" ? "numeric" : "text"}
                    placeholder={joinMode === "code" ? "• • • • • •" : "যেমন: SPARK42"}
                    className="w-full rounded-2xl border-2 border-teal-400/60 bg-slate-950/90 py-3.5 px-4 text-center text-2xl font-black tracking-[0.24em] sm:text-3xl sm:tracking-[0.35em] text-teal-300 placeholder:text-slate-600 focus:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition shadow-inner font-mono"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200">
                    আপনার অবতার (Avatar) পছন্দ করুন
                  </label>
                  <span className="text-[10px] font-black bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/20">
                    {FUN_AVATARS.length} টি প্রিমিয়াম অবতার
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center p-3 rounded-2xl bg-slate-950/90 border border-white/10 shadow-2xl max-h-[190px] overflow-y-auto pg-scroll">
                  {FUN_AVATARS.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(av.emoji)}
                      className={`group relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${av.bg} text-xl transition-all duration-300 cursor-pointer shadow-md overflow-hidden ${
                        selectedAvatar === av.emoji
                          ? "ring-4 ring-teal-400 ring-offset-2 ring-offset-slate-950 scale-110 text-2xl z-20"
                          : "opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
                      }`}
                      title={av.name}
                    >
                      {/* Glossy Overlay Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                      {/* Core Emoji with Depth Shadow */}
                      <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] select-none z-10 transform group-hover:scale-110 transition-transform duration-200">
                        {av.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nickname Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  আপনার নাম / ডাকনাম (ঐচ্ছিক)
                </label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const foundAv = FUN_AVATARS.find(a => a.emoji === selectedAvatar);
                    const avBg = foundAv ? foundAv.bg : "from-teal-500 via-indigo-500 to-indigo-600";
                    return (
                      <div className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${avBg} text-2xl shadow-xl border border-white/20 overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />
                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none z-10">{selectedAvatar}</span>
                      </div>
                    );
                  })()}
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 28))}
                    placeholder="ফাঁকা রাখলে সিস্টেম নাম বানিয়ে দিবে"
                    className="w-full flex-1 rounded-xl border border-white/20 bg-slate-950/80 px-3.5 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition"
                  />
                </div>
              </div>

              {/* Submit Button with High Voltage Glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 py-4 text-base sm:text-lg font-black text-slate-950 shadow-xl shadow-teal-500/40 hover:brightness-110 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 ring-2 ring-teal-300/80"
              >
                {loading ? (
                  <span>প্রবেশ হচ্ছে...</span>
                ) : (
                  <>
                    <span>🚀 খেলায় যোগ দিন</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Footer Links */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <Link href="/leaderboard" className="text-amber-300 hover:underline">
                🏆 লিডারবোর্ড
              </Link>
              <span>•</span>
              <Link href="/" className="text-teal-300 hover:underline">
                🏠 মূল হোমপেজ
              </Link>
            </div>
          </div>
        </main>

        <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs font-bold text-slate-400 sm:justify-between border-t border-white/10 pt-4">
          <span>কোড নেই? শিক্ষকের প্রজেক্টর বা বড় পর্দা দেখুন</span>
          <span>© PGTSC Quiz Arena · শেখা এখন খেলার মতো আনন্দময়</span>
        </footer>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <JoinInner />
    </Suspense>
  );
}
