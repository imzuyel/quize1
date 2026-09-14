"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionTitle,
  Skeleton,
  StatCard,
} from "@/components/ui";
import {
  QuizResultFeedbackCard,
  type CompletedQuizInfo,
} from "@/components/quiz-result-feedback-card";

type Data = {
  results: { id: number; title: string; score: number; accuracy: number; rank: number; createdAt: string; quizId: number }[];
  achievements: { id: number; name: string; nameBn: string | null; icon: string }[];
  rank: number;
  xp: number;
  completedExams: number;
};

const LEVELS = [
  { name: "Beginner", bn: "শিক্ষানবিশ", min: 0 },
  { name: "Learner", bn: "শিক্ষার্থী", min: 300 },
  { name: "Skilled", bn: "দক্ষ", min: 800 },
  { name: "Expert", bn: "বিশেষজ্ঞ", min: 1600 },
  { name: "Master", bn: "মাস্টার", min: 3000 },
];

export default function StudentDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [quizzes, setQuizzes] = useState<{ id: number; title: string; mode: string }[]>([]);
  const [pinInput, setPinInput] = useState("");
  const [recentQuiz, setRecentQuiz] = useState<CompletedQuizInfo | null>(null);
  const [dismissedQuiz, setDismissedQuiz] = useState(false);

  useEffect(() => {
    fetch("/api/analytics?scope=student").then(async (r) => r.ok && setData(await r.json()));
    fetch("/api/quizzes").then(async (r) => r.ok && setQuizzes((await r.json()).rows.slice(0, 5)));

    try {
      const raw = localStorage.getItem("pg_last_completed_quiz");
      if (raw) {
        const parsed = JSON.parse(raw) as CompletedQuizInfo;
        // Keep active if completed within 48 hours
        if (Date.now() - (parsed.completedAt || 0) < 48 * 3600 * 1000) {
          setRecentQuiz(parsed);
        }
      }
    } catch {}
  }, []);

  const activeQuizResult: CompletedQuizInfo | null = useMemo(() => {
    if (dismissedQuiz) return null;
    if (recentQuiz) return recentQuiz;
    const latest = data?.results?.[0];
    if (!latest) return null;
    return {
      quizTitle: latest.title,
      score: latest.score,
      rank: latest.rank || 1,
      totalPlayers: 1,
      accuracy: latest.accuracy,
      correctCount: Math.round(((latest.accuracy || 0) / 100) * 10),
      totalQuestions: 10,
      completedAt: new Date(latest.createdAt).getTime(),
    };
  }, [recentQuiz, data?.results, dismissedQuiz]);

  if (!data)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );

  const level = [...LEVELS].reverse().find((l) => data.xp >= l.min) ?? LEVELS[0];
  const next = LEVELS[LEVELS.indexOf(level) + 1];

  return (
    <div className="space-y-6">
      {/* Post-Quiz Position & Funny Feedback Card */}
      {activeQuizResult ? (
        <QuizResultFeedbackCard
          result={activeQuizResult}
          onDismiss={() => {
            setDismissedQuiz(true);
            try {
              localStorage.removeItem("pg_last_completed_quiz");
            } catch {}
          }}
        />
      ) : null}

      {/* Student Hero */}
      <div className="pg-hero-bg pg-shadow relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30">
        <div className="pg-grid-lines absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-1 text-xs font-bold text-teal-300">
              🎓 শিক্ষার্থী ড্যাশবোর্ড
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black">স্বাগতম! আজ কী শিখবেন?</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              লাইভ ক্লাসরুম কুইজে যোগ দিন, বিষয়ভিত্তিক অনুশীলন করুন এবং লিডারবোর্ডে নিজের অবস্থান উন্নত করুন।
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/join">
                <Button variant="gold" className="font-black text-slate-950 shadow-md">
                  🎮 লাইভ কুইজে যোগ দিন
                </Button>
              </Link>
              <Link href="/student/practice">
                <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 font-bold">
                  📚 স্ব-অনুশীলন
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" className="text-white hover:bg-white/10 font-bold">
                  🏆 সেরা তালিকা
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur shadow-xl min-w-[200px]">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-300">আমার বর্তমান লেভেল</p>
            <p className="mt-1 text-2xl font-black text-[var(--pg-gold)]">{level.bn}</p>
            <p className="mt-1 text-xs font-semibold text-teal-300">{data.xp} XP অর্জিত</p>
            {next ? (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-white/70 mb-1">
                  <span>পরবর্তী: {next.bn}</span>
                  <span>{next.min - data.xp} XP বাকি</span>
                </div>
                <div className="h-2 w-36 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-amber-300"
                    style={{ width: `${Math.min(100, ((data.xp - level.min) / (next.min - level.min)) * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quick PIN Join Banner */}
      <div className="rounded-3xl border-2 border-teal-500/30 bg-gradient-to-r from-teal-950/70 via-slate-900/90 to-indigo-950/70 p-5 shadow-lg backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔑</span>
          <div>
            <h3 className="text-base font-black text-white">ক্লাসে শিক্ষক পিন দিয়েছেন?</h3>
            <p className="text-xs text-slate-300">পিন টাইপ করে সরাসরি লাইভ কুইজে প্রবেশ করুন</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pinInput.trim()) {
              window.location.href = `/join?pin=${encodeURIComponent(pinInput.trim())}`;
            }
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="৬ সংখ্যার PIN..."
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full sm:w-44 rounded-2xl border-2 border-teal-400/60 bg-slate-950 px-4 py-2 text-center text-sm font-black tracking-widest text-teal-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            যুক্ত হন →
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="সম্পন্ন কুইজ" value={data.completedExams} icon="📝" tone="blue" />
        <StatCard label="আমার র‍্যাংক" value={`#${data.rank}`} icon="🏅" tone="gold" />
        <StatCard label="অর্জন" value={data.achievements.length} icon="🏆" tone="coral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="সুপারিশকৃত কুইজ" action={<Link href="/student/quizzes"><Button size="sm" variant="outline">সব</Button></Link>} />
          {quizzes.length === 0 ? (
            <EmptyState title="কোনো কুইজ নেই" />
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <div key={q.id} className="flex items-center gap-2 rounded-xl border border-[var(--pg-line)] p-3">
                  <span className="flex-1 text-sm font-semibold">{q.title}</span>
                  <Badge tone={q.mode === "exam" ? "blue" : "teal"}>{q.mode}</Badge>
                  <Link href="/student/quizzes"><Button size="sm">শুরু</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="সাম্প্রতিক ফলাফল" action={<Link href="/student/results"><Button size="sm" variant="outline">সব</Button></Link>} />
          {data.results.length === 0 ? (
            <EmptyState title="এখনো ফলাফল নেই" />
          ) : (
            <div className="space-y-2">
              {data.results.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-xl border border-[var(--pg-line)] p-3 text-sm">
                  <span className="flex-1 font-semibold">{r.title}</span>
                  <Badge tone="gold">#{r.rank || "-"}</Badge>
                  <span className="font-bold tabular-nums">{Math.round(r.score)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
