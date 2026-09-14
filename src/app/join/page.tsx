"use client";
// NOTE: metadata lives in the sibling layout because this is a client page.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button, Card, Field, Input, useToast } from "@/components/ui";

function JoinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { push } = useToast();
  const [pin, setPin] = useState(params.get("pin") ?? "");
  const [joinMode, setJoinMode] = useState<"code" | "keyword">("code");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pg_nickname");
    if (saved) setNickname(saved);
  }, []);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const joinKey = pin.trim();
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "join",
          ...(joinMode === "code" ? { pin: joinKey } : { keyword: joinKey }),
          nickname: nickname.trim(),
          // Reuse the player record after refresh instead of creating a second
          // lobby entry for the same browser.
          playerId: localStorage.getItem(`pg_player_${joinKey}`) ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "যোগ দেওয়া যায়নি");
      const canonicalPin = String(data.pin || joinKey);
      localStorage.setItem("pg_nickname", String(data.nickname || nickname.trim()));
      localStorage.setItem(`pg_player_${canonicalPin}`, String(data.playerId));
      localStorage.setItem(`pg_player_nickname_${canonicalPin}`, String(data.nickname || nickname.trim()));
      router.push(`/play/${encodeURIComponent(canonicalPin)}`);
    } catch (err) {
      push(err instanceof Error ? err.message : "সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg-hero-bg pg-game-shell min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="pg-game-nav mb-6 flex items-center justify-between gap-3 text-white sm:mb-10">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-400 font-black shadow-lg shadow-fuchsia-950/30">
            PG
            </span>
            <span className="truncate font-black tracking-tight">Quiz Arena</span>
          </Link>
          <div className="hidden items-center gap-2 text-xs font-bold text-white/75 sm:flex"><span className="pg-live-dot" /> LIVE CLASSROOM</div>
          <Link href="/leaderboard" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur hover:bg-white/20">🏆 র‍্যাংকিং</Link>
        </header>

        <main className="grid flex-1 items-center gap-8 pb-8 lg:grid-cols-[1fr_420px] lg:gap-16">
          <section className="hidden text-white lg:block">
            <div className="pg-orb pg-orb-one" />
            <p className="anim-fade text-sm font-black uppercase tracking-[.22em] text-cyan-200">PLAY • LEARN • WIN</p>
            <h1 className="anim-fade mt-4 max-w-xl text-5xl font-black leading-[1.05] tracking-tight">একটি কোড লিখুন,<br /><span className="text-amber-300">খেলা শুরু করুন।</span></h1>
            <p className="anim-fade mt-5 max-w-lg text-lg leading-relaxed text-white/75">লাইভ কুইজে যোগ দিন, সবার আগে উত্তর দিন এবং লিডারবোর্ডে নিজের জায়গা করে নিন।</p>
            <div className="mt-8 flex gap-3">
              {[["⚡", "দ্রুত"], ["🎯", "ইন্টারঅ্যাক্টিভ"], ["🏆", "মজাদার"]].map(([icon, label]) => <span key={label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">{icon} {label}</span>)}
            </div>
          </section>

          <Card className="pg-join-card anim-zoom w-full bg-white/95 p-5 sm:p-7">
          <div className="mb-6 text-center lg:hidden">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--pg-teal)]">LIVE CLASSROOM</p>
            <h1 className="mt-1 text-2xl font-black">কুইজে যোগ দিন</h1>
          </div>
          <div className="mb-6 hidden lg:block">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--pg-teal)]">LIVE CLASSROOM</p>
            <h2 className="mt-1 text-2xl font-black">চলুন খেলি!</h2>
            <p className="mt-1 text-sm text-slate-500">গেম কোড বা কিওয়ার্ড দিন</p>
          </div>
          <form onSubmit={join} className="space-y-4">
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-2xl bg-indigo-50 p-1.5">
              <button type="button" onClick={() => { setJoinMode("code"); setPin(""); }} className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${joinMode === "code" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-indigo-800"}`}>🔢 কোড / PIN</button>
              <button type="button" onClick={() => { setJoinMode("keyword"); setPin(""); }} className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${joinMode === "keyword" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-indigo-800"}`}>🔤 কিওয়ার্ড</button>
            </div>
            <Field label={joinMode === "code" ? "গেম কোড" : "গেম কিওয়ার্ড"} required>
              <Input
                value={pin}
                onChange={(e) => setPin(joinMode === "code" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value.replace(/\s/g, "").toUpperCase().slice(0, 32))}
                inputMode={joinMode === "code" ? "numeric" : "text"}
                placeholder={joinMode === "code" ? "৬ ডিজিটের কোড" : "যেমন: SPARK42"}
                className="pg-pin-input text-center text-2xl font-black tracking-[0.24em] sm:text-3xl sm:tracking-[0.35em]"
                required
              />
            </Field>
            <Field label="আপনার নাম / নিকনেম (ঐচ্ছিক)">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 28))}
                placeholder="ফাঁকা রাখলে যেমন: স্মার্ট পান্ডা 47"
              />
            </Field>
            <p className="-mt-2 text-xs font-medium text-slate-500">নাম না দিলেও সমস্যা নেই—সিস্টেম নিজে একটি সুন্দর নিকনেম তৈরি করবে।</p>
            <Button type="submit" block size="lg" loading={loading}>
              🚀 খেলায় যোগ দিন
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-500"><Link href="/leaderboard" className="text-[var(--pg-teal)]">🏆 লিডারবোর্ড</Link><span>•</span><Link href="/" className="text-[var(--pg-teal)]">হোম</Link></div>
          <p className="mt-2 text-center text-xs text-slate-500">
            শিক্ষক বা শিক্ষার্থী ড্যাশবোর্ড দরকার?{" "}
            <Link href="/" className="font-bold text-[var(--pg-teal)]">
              হোমে ফিরে যান
            </Link>
          </p>
          </Card>
        </main>
        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs font-semibold text-white/60 sm:justify-between">
          <span>কোড নেই? শিক্ষকের স্ক্রিন দেখুন</span><span>© Quiz Arena · শেখা এখন খেলার মতো</span>
        </footer>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="pg-hero-bg min-h-screen" />}>
      <JoinInner />
    </Suspense>
  );
}
