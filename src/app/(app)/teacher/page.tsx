"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Progress,
  SectionTitle,
  Select,
  Skeleton,
  StatCard,
  Table,
  useToast,
  cx,
} from "@/components/ui";

type Analytics = {
  quizzes: { id: number; title: string; mode: string; scheduledAt: string | null; status: string }[];
  totals: {
    quizzes: number;
    results: number;
    averageScore: number;
    accuracy: number;
    participation: number;
    avgResponseMs: number;
    activeSessions: number;
  };
  activeSessions: { id: number; pin: string; state: string; quizId: number }[];
  recentResults: { playerName: string; score: number; accuracy: number; createdAt: string }[];
  insights: string[];
};

const ACTIONS = [
  { href: "/teacher/quizzes?new=1", icon: "➕", label: "নতুন কুইজ তৈরি", tone: "bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 shadow-md shadow-teal-500/20" },
  { href: "/teacher/quizzes", icon: "🎛️", label: "কুইজ স্টুডিও", tone: "bg-gradient-to-br from-teal-500 to-emerald-600" },
  { href: "/teacher/live", icon: "📡", label: "লাইভ কুইজ শুরু", tone: "bg-gradient-to-br from-rose-500 to-orange-500" },
  { href: "/teacher/ai", icon: "✨", label: "এআই দিয়ে তৈরি", tone: "bg-gradient-to-br from-violet-500 to-indigo-600" },
  { href: "/teacher/bank", icon: "🗃️", label: "প্রশ্ন ব্যাংক", tone: "bg-gradient-to-br from-amber-500 to-yellow-600" },
  { href: "/teacher/templates", icon: "🎨", label: "টেমপ্লেট স্টুডিও", tone: "bg-gradient-to-br from-fuchsia-500 to-pink-600" },
  { href: "/teacher/analytics", icon: "📈", label: "অ্যানালিটিক্স", tone: "bg-gradient-to-br from-cyan-500 to-blue-600" },
];

export default function TeacherDashboard() {
  const router = useRouter();
  const { push } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [animateGrid, setAnimateGrid] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [prompt, setPrompt] = useState("ক্লাস ১০ কম্পিউটার, HTML ফর্ম, মাঝারি, ৩০ প্রশ্ন");
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [quizList, setQuizList] = useState<{ id: number; title: string; questionCount: number }[]>([]);
  const [chosen, setChosen] = useState("");
  const [startingQuizId, setStartingQuizId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [sessionToDelete, setSessionToDelete] = useState<{ id: number; pin: string; state?: string } | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/analytics?scope=teacher");
    if (res.ok) setData(await res.json());
    const q = await fetch("/api/quizzes?mine=1");
    if (q.ok) setQuizList((await q.json()).rows);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSession(true);
    try {
      const res = await fetch(`/api/live?pin=${sessionToDelete.pin}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin: sessionToDelete.pin, id: sessionToDelete.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "মুছতে সমস্যা হয়েছে");
      push(`লাইভ সেশন PIN ${sessionToDelete.pin} ও এর সমস্ত ডেটা মুছে ফেলা হয়েছে ✅`, "success");
      setSessionToDelete(null);
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    } finally {
      setDeletingSession(false);
    }
  };

  const startLiveForQuiz = async (quizId: number) => {
    setStartingQuizId(quizId);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "create", quizId }),
      });
      const json = await res.json();
      if (!res.ok) {
        push(json.error ?? "ব্যর্থ", "error");
        setStartingQuizId(null);
        return;
      }
      push(`পিন তৈরি হয়েছে: ${json.pin}`, "success");
      router.push(`/host/${json.pin}`);
    } catch {
      push("লাইভ শুরু করতে সমস্যা হয়েছে", "error");
      setStartingQuizId(null);
    }
  };

  const startLive = async () => {
    if (!chosen) return push("একটি কুইজ বাছাই করুন", "error");
    await startLiveForQuiz(Number(chosen));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    push(`পিন কপি হয়েছে: ${text}`, "success");
  };

  const filteredQuizzes = (data?.quizzes || []).filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === "all" || q.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Hero Banner with Live Engine Pulse */}
      <div className="pg-hero-bg pg-shadow relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-teal-500/30">
        <div className={cx("pg-grid-lines absolute inset-0 opacity-40 transition-all", animateGrid && "pg-grid-animated")} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-1 text-xs font-bold text-teal-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                লাইভ ক্লাসরুম ইঞ্জিন সক্রিয়
              </span>
              <span className="text-xs text-white/60">• পঞ্চগড় সরকারি কারিগরি স্কুল ও কলেজ</span>
              <button
                type="button"
                onClick={() => setAnimateGrid((v) => !v)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer",
                  animateGrid
                    ? "bg-teal-400 text-slate-950 border-teal-300 shadow-sm shadow-teal-400/50"
                    : "bg-white/10 text-white/80 hover:bg-white/20 border-white/20"
                )}
                title="ব্যাকগ্রাউন্ড গ্রিড অ্যানিমেশন চালু/বন্ধ করুন"
              >
                ✨ {animateGrid ? "Animate: ON" : "Animate"}
              </button>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
              শিক্ষক ড্যাশবোর্ড · আজ কী পরিচালনা করবেন?
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              এক ক্লিকে নতুন প্রশ্ন তৈরি, লাইভ ক্লাসরুম প্রতিযোগিতা শুরু অথবা পরীক্ষার ফলাফল পর্যবেক্ষণ করুন।
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/teacher/quizzes?new=1">
                <Button variant="primary" className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/30 hover:brightness-110 cursor-pointer text-sm">
                  ➕ নতুন কুইজ তৈরি করুন
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 font-bold cursor-pointer text-sm"
                onClick={() => setLiveOpen(true)}
              >
                📡 লাইভ কুইজ শুরু (PIN)
              </Button>
              <Button
                variant="gold"
                onClick={() => setSmartOpen(true)}
                className="font-bold cursor-pointer text-sm"
              >
                🤖 স্মার্ট কুইজ তৈরি (AI)
              </Button>
              <Link href="/teacher/quizzes">
                <Button variant="ghost" className="text-white/90 hover:bg-white/10 cursor-pointer text-sm">
                  📋 কুইজ স্টুডিও →
                </Button>
              </Link>
            </div>
          </div>

          {/* Active session counter mini card */}
          {data?.activeSessions && data.activeSessions.length > 0 ? (
            <div className="rounded-2xl border border-teal-400/50 bg-slate-900/90 p-4 text-center backdrop-blur shadow-xl min-w-[200px]">
              <span className="inline-block animate-pulse text-xs font-bold text-teal-400">
                🔴 সেশন চলমান
              </span>
              <p className="text-2xl font-black text-white mt-0.5">
                {data.activeSessions.length} টি সেশন
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">পিন: {data.activeSessions[0].pin}</p>
              <Link href={`/host/${data.activeSessions[0].pin}`}>
                <Button size="sm" className="mt-2.5 w-full bg-teal-500 text-slate-950 font-bold hover:bg-teal-400">
                  হোস্ট রুমে ফিরুন →
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {ACTIONS.map((a, i) => (
          <ScrollReveal key={a.href} variant="fade-up" delay={i * 40} duration={500}>
            <Link href={a.href}>
              <div
                className={`${a.tone} pg-shadow flex h-full min-h-[104px] flex-col justify-between rounded-2xl p-4 text-white transition hover:-translate-y-0.5`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-sm font-bold leading-tight">{a.label}</span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {!data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ScrollReveal variant="fade-up" delay={0} duration={550}>
              <StatCard label="আমার কুইজ" value={data.totals.quizzes} icon="📚" />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={80} duration={550}>
              <StatCard label="গড় স্কোর" value={data.totals.averageScore} sub="সব ফলাফলের গড়" icon="🎯" tone="gold" />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={160} duration={550}>
              <StatCard label="অংশগ্রহণ" value={`${data.totals.participation}%`} icon="👥" tone="blue" />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={240} duration={550}>
              <StatCard
                label="গড় উত্তর সময়"
                value={`${Math.round(data.totals.avgResponseMs / 1000)}s`}
                icon="⏱️"
                tone="coral"
              />
            </ScrollReveal>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionTitle
                title="কুইজ তালিকা ও দ্রুত নিয়ন্ত্রণ"
                subtitle="সরাসরি লাইভ শুরু করুন বা এডিট করুন"
                action={
                  <Link href="/teacher/quizzes">
                    <Button size="sm" variant="outline">
                      সব দেখুন ({data.quizzes.length})
                    </Button>
                  </Link>
                }
              />

              {/* Quick filter & search bar */}
              <div className="mb-4 flex flex-wrap items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="🔍 কুইজ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-[var(--pg-line)] bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1 min-w-[160px]"
                />
                <div className="flex items-center gap-1 text-xs">
                  {["all", "live", "exam", "practice"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMode(m)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        filterMode === m
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {m === "all" ? "সব" : m === "live" ? "লাইভ" : m === "exam" ? "পরীক্ষা" : "অনুশীলন"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredQuizzes.length === 0 ? (
                <EmptyState
                  title={searchQuery ? "কোনো ফলাফল পাওয়া যায়নি" : "এখনো কোনো কুইজ নেই"}
                  description="এআই জেনারেটর বা কুইজ স্টুডিও দিয়ে শুরু করুন।"
                  action={
                    <Link href="/teacher/ai">
                      <Button className="mt-3">এআই দিয়ে তৈরি করুন</Button>
                    </Link>
                  }
                />
              ) : (
                <Table head={["শিরোনাম", "ধরন", "স্ট্যাটাস", ""]}>
                  {filteredQuizzes.slice(0, 7).map((q) => (
                    <tr key={q.id}>
                      <td className="px-3 py-2 font-semibold">
                        <Link href={`/teacher/quizzes/${q.id}`} className="hover:text-teal-600">
                          {q.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={q.mode === "exam" ? "blue" : q.mode === "practice" ? "gold" : "teal"}>
                          {q.mode}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={q.status === "published" ? "green" : "slate"}>{q.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startLiveForQuiz(q.id)}
                            disabled={startingQuizId === q.id}
                            className="rounded-lg bg-teal-500 hover:bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
                          >
                            {startingQuizId === q.id ? "শুরু হচ্ছে..." : "📡 লাইভ"}
                          </button>
                          <Link href={`/teacher/quizzes/${q.id}`}>
                            <Button size="sm" variant="ghost" className="text-xs">
                              এডিট
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>

            <Card>
              <SectionTitle title="🤖 এআই শিক্ষণ পরামর্শ" />
              <ul className="space-y-2 text-sm">
                {data.insights.map((i, idx) => (
                  <li key={idx} className="rounded-xl bg-slate-50 p-3 leading-relaxed border border-slate-100">
                    {i}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold text-slate-500">সামগ্রিক নির্ভুলতা</p>
                <Progress value={data.totals.accuracy} />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <SectionTitle title="সক্রিয় লাইভ সেশন" />
              {data.activeSessions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400">বর্তমানে কোনো লাইভ সেশন চলমান নেই</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 cursor-pointer"
                    onClick={() => setLiveOpen(true)}
                  >
                    📡 এখনই একটি লাইভ শুরু করুন
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.activeSessions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-2xl border-2 border-teal-500/40 bg-teal-500/5 p-3.5 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-slate-950 px-3 py-1 text-lg font-black tracking-widest text-teal-300">
                            {s.pin}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.pin)}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            title="পিন কপি করুন"
                          >
                            📋 কপি
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          স্টেট: <span className="font-bold text-teal-700">{s.state}</span>
                        </p>
                      </div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1.5">
                        <Link href={`/host/${s.pin}`}>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-black">
                            🕹️ কন্ট্রোল রুম
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                          onClick={() => setSessionToDelete(s)}
                        >
                          🗑️ ডিলিট
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionTitle title="সাম্প্রতিক ফলাফল" />
              {data.recentResults.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">এখনো ফলাফল নেই</p>
              ) : (
                <Table head={["শিক্ষার্থী", "স্কোর", "নির্ভুলতা"]}>
                  {data.recentResults.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{r.playerName}</td>
                      <td className="px-3 py-2 font-bold tabular-nums">{Math.round(r.score)}</td>
                      <td className="px-3 py-2">{Math.round(r.accuracy)}%</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          </div>
        </>
      )}

      <Modal
        open={smartOpen}
        onClose={() => setSmartOpen(false)}
        title="স্মার্ট কুইজ তৈরি"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setSmartOpen(false)}>
              বন্ধ
            </Button>
            <Button
              loading={loadingPlan}
              onClick={async () => {
                setLoadingPlan(true);
                const res = await fetch("/api/ai", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ action: "plan", prompt }),
                });
                setPlan(await res.json());
                setLoadingPlan(false);
              }}
            >
              পরিকল্পনা তৈরি করুন
            </Button>
            {plan ? (
              <Button
                variant="gold"
                onClick={() =>
                  router.push(
                    `/teacher/ai?topic=${encodeURIComponent(String(plan.topic ?? ""))}&count=${plan.count}&difficulty=${plan.difficulty}`,
                  )
                }
              >
                এআই জেনারেটরে নিন →
              </Button>
            ) : null}
          </>
        }
      >
        <p className="mb-2 text-sm text-slate-500">
          উদাহরণ: &quot;ক্লাস ১০ কম্পিউটার, HTML ফর্ম, মাঝারি, ৩০ প্রশ্ন&quot;
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] w-full rounded-xl border border-[var(--pg-line)] p-3 text-sm"
        />
        {plan ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-bold">{String(plan.title)}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Badge>প্রশ্ন: {String(plan.count)}</Badge>
              <Badge>ডিফিকাল্টি: {String(plan.difficulty)}</Badge>
              <Badge>টাইমার: {String(plan.timer)}s</Badge>
              <Badge>মার্কস: {String(plan.marks)}</Badge>
            </div>
            <ul className="mt-3 list-disc pl-5 text-xs text-slate-600">
              {(plan.notes as string[]).map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] font-semibold text-amber-700">
              ⚠️ প্রকাশের আগে অবশ্যই রিভিউ করুন।
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={liveOpen}
        onClose={() => setLiveOpen(false)}
        title="লাইভ কুইজ শুরু করুন"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLiveOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={startLive}>পিন তৈরি করুন</Button>
          </>
        }
      >
        <Select value={chosen} onChange={(e) => setChosen(e.target.value)}>
          <option value="">কুইজ বাছাই করুন…</option>
          {quizList.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title} ({q.questionCount} প্রশ্ন)
            </option>
          ))}
        </Select>
      </Modal>

      <Modal
        open={Boolean(sessionToDelete)}
        onClose={() => !deletingSession && setSessionToDelete(null)}
        title="লাইভ সেশন মুছে ফেলা"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900 border border-rose-200">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-sm font-black text-rose-900">
                আপনি কি নিশ্চিত যে PIN <span className="font-mono underline">{sessionToDelete?.pin}</span> এর সেশনটি ডিলিট করবেন?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                এই লাইভ সেশনের সাথে সম্পর্কিত সকল খেলোয়াড়/শিক্ষার্থী, তাদের দেওয়া উত্তর ও তাৎক্ষণিক ফলাফল ডেটাবেজ থেকে সম্পূর্ণ মুছে ফেলা হবে।
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSessionToDelete(null)} disabled={deletingSession}>
              বাতিল
            </Button>
            <Button
              variant="danger"
              className="bg-rose-600 hover:bg-rose-700 text-white font-black"
              loading={deletingSession}
              onClick={handleDeleteSession}
            >
              হ্যাঁ, সম্পূর্ণ ডিলিট করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
