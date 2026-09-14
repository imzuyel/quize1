"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionTitle,
  Skeleton,
  StatCard,
} from "@/components/ui";

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

  useEffect(() => {
    fetch("/api/analytics?scope=student").then(async (r) => r.ok && setData(await r.json()));
    fetch("/api/quizzes").then(async (r) => r.ok && setQuizzes((await r.json()).rows.slice(0, 5)));
  }, []);

  if (!data)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );

  const level = [...LEVELS].reverse().find((l) => data.xp >= l.min) ?? LEVELS[0];
  const next = LEVELS[LEVELS.indexOf(level) + 1];

  return (
    <div className="space-y-5">
      <div className="pg-hero-bg pg-shadow relative overflow-hidden rounded-2xl p-5 text-white">
        <div className="pg-grid-lines absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">শিক্ষার্থী ড্যাশবোর্ড</p>
            <h1 className="mt-1 text-2xl font-extrabold">স্বাগতম! আজ কী শিখবেন?</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/join"><Button variant="gold">লাইভ কুইজে যোগ দিন</Button></Link>
              <Link href="/student/practice"><Button variant="outline">অনুশীলন শুরু</Button></Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <p className="text-xs text-white/70">লেভেল</p>
            <p className="text-xl font-black text-[var(--pg-gold)]">{level.bn}</p>
            <p className="mt-1 text-xs">XP {data.xp}</p>
            {next ? (
              <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-[var(--pg-gold)]"
                  style={{ width: `${Math.min(100, ((data.xp - level.min) / (next.min - level.min)) * 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>
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
