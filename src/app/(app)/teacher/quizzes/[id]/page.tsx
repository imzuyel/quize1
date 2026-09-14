"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  Select,
  Tabs,
  Toggle,
  useToast,
  cx,
} from "@/components/ui";
import { QuizTimer } from "@/components/quiz";
import { ThemeStage, ThemedAnswers, ThemedCard } from "@/components/theme-stage";
import { mergeTemplate } from "@/lib/theme";
import { parseQuestions } from "@/lib/parse-questions";
import { DEFAULT_SETTINGS, EXAM_SETTINGS, formatDuration, type QuizSettings } from "@/lib/quiz-settings";
import { QuestionTypeEditor, EMPTY_MANUAL_QUESTION, type ManualQuestionDraft } from "@/components/question-type-editor";
import { QuizPlate, QuizPlateSelector } from "@/components/quiz-plate";

type Q = {
  id: number;
  text: string;
  type: string;
  options: string[];
  correct: (string | number)[];
  marks: number;
  timer: number;
  difficulty: string;
  subjectId: number | null;
  explanation: string | null;
  hint: string | null;
  settings?: Record<string, unknown>;
};

const PAGE_SIZE = 25;

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quizId = Number(id);
  const router = useRouter();
  const { push } = useToast();
  const [quiz, setQuiz] = useState<{ id: number; title: string; description: string | null; mode: string; status: string; durationMinutes: number | null; settings: QuizSettings } | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [rounds, setRounds] = useState<{ id: number; name: string; settings: Record<string, unknown> }[]>([]);
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState("simple");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bankRows, setBankRows] = useState<Q[]>([]);
  const [bankQuery, setBankQuery] = useState("");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop" | "exam">("desktop");
  const [templates, setTemplates] = useState<{ id: number; name: string; config: Record<string, unknown> }[]>([]);
  const [presetName, setPresetName] = useState("");
  const [listQuery, setListQuery] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDiff, setAiDiff] = useState("medium");
  const [aiTypes, setAiTypes] = useState<string[]>(["mcq"]);
  const [aiLang, setAiLang] = useState("bn");
  const [aiBusy, setAiBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [manual, setManual] = useState<ManualQuestionDraft>({ ...EMPTY_MANUAL_QUESTION });
  const [showReveal, setShowReveal] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [liveStarting, setLiveStarting] = useState(false);

  const [pdfSource, setPdfSource] = useState<{ id: number; title: string; originalFilename: string; pageCount: number; storagePath: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/quizzes?id=${quizId}`);
    if (!res.ok) return;
    const data = await res.json();
    setQuiz({ ...data.quiz, settings: { ...DEFAULT_SETTINGS, ...(data.quiz.settings ?? {}) } });
    setQuestions(data.questions);
    setRounds(data.rounds);
    setPdfSource(data.pdfSource || null);
  }, [quizId]);

  useEffect(() => {
    load();
    fetch("/api/templates").then(async (r) => r.ok && setTemplates((await r.json()).rows));
  }, [load]);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      push(data.error ?? "ব্যর্থ", "error");
      return null;
    }
    return data;
  };

  const saveSettings = async (settings: QuizSettings) => {
    setQuiz((q) => (q ? { ...q, settings } : q));
    await post({ op: "update", id: quizId, data: { settings } });
  };

  const searchBank = useCallback(async () => {
    const res = await fetch(`/api/questions?limit=30&q=${encodeURIComponent(bankQuery)}`);
    if (res.ok) setBankRows((await res.json()).rows);
  }, [bankQuery]);

  useEffect(() => {
    if (pickerOpen) searchBank();
  }, [pickerOpen, searchBank]);

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...questions];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
    await post({ op: "reorder", id: quizId, order: next.map((q) => q.id) });
  };

  const current = questions[active];
  const filtered = useMemo(() => {
    const needle = listQuery.trim().toLowerCase();
    return needle
      ? questions.filter((q) => q.text.toLowerCase().includes(needle) || q.type.includes(needle))
      : questions;
  }, [questions, listQuery]);
  const visible = useMemo(
    () => filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filtered, page],
  );
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const totalTime = questions.reduce((s, q) => s + q.timer, 0);
  const mix = useMemo(() => {
    const byDiff: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const byType: Record<string, number> = {};
    for (const q of questions) {
      byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
      byType[q.type] = (byType[q.type] ?? 0) + 1;
    }
    return { byDiff, byType };
  }, [questions]);

  const bulkRemove = async () => {
    if (!picked.length) return;
    await post({ op: "removeQuestion", id: quizId, questionIds: picked });
    setPicked([]);
    load();
    push(`${picked.length}টি প্রশ্ন সরানো হয়েছে`, "success");
  };

  const bulkTiming = async (field: "marks" | "timer", value: number) => {
    if (!picked.length) return;
    for (const qid of picked) {
      const q = questions.find((x) => x.id === qid);
      if (!q) continue;
      await post({
        op: "questionOverride",
        id: quizId,
        questionIds: [qid],
        data: { marks: field === "marks" ? value : q.marks, timer: field === "timer" ? value : q.timer },
      });
    }
    load();
    push("প্রয়োগ হয়েছে ✅", "success");
  };

  const createManual = async () => {
    if (!manual.text.trim()) return push("প্রশ্নটি লিখুন", "error");
    const type = manual.type;
    const options = manual.options.map((x) => x.trim()).filter(Boolean);
    if (["mcq", "multi_select", "true_false"].includes(type) && (options.length < 2 || !manual.correct.length))
      return push("কমপক্ষে ২টি অপশন ও সঠিক উত্তর দিন", "error");
    if (["matching", "ordering"].includes(type) && options.length < 2) return push("কমপক্ষে ২টি item দিন", "error");
    if (["short_answer", "word_answer", "numeric_answer", "puzzle"].includes(type) && !manual.answerText.trim())
      return push("সঠিক উত্তরটি লিখুন", "error");
    const correct = ["numeric_answer", "short_answer", "word_answer", "puzzle"].includes(type)
      ? [manual.answerText.trim()]
      : type === "ordering" ? options.map((_, i) => i)
      : ["poll", "word_cloud", "open_ended"].includes(type) ? []
      : manual.correct.filter((i) => i < options.length);
    const data = await post({ op: "createQuestion", id: quizId, data: {
      text: manual.text.trim(), type, options, correct, marks: manual.marks, timer: manual.timer,
      difficulty: manual.difficulty, explanation: manual.explanation, hint: manual.hint,
      source: "manual", settings: { animation: manual.animation, tolerance: manual.tolerance },
    } });
    if (data) { setManualOpen(false); setManual({ ...EMPTY_MANUAL_QUESTION }); load(); push("প্রশ্ন যোগ হয়েছে ✅", "success"); }
  };

  const importPaste = async () => {
    if (!pasteText.trim()) return push("প্রশ্নের লেখা পেস্ট করুন", "error");
    const report = parseQuestions(pasteText, { difficulty: "medium", marks: 1, timer: s.globalTimer || 30, language: "bn" });
    if (!report.questions.length) return push("কোনো প্রশ্ন শনাক্ত করা যায়নি", "error");
    let added = 0;
    for (const q of report.questions) {
      const data = await post({ op: "createQuestion", id: quizId, data: { ...q, source: "paste" } });
      if (data) added++;
    }
    setPasteOpen(false); setPasteText(""); load();
    push(`${added}টি প্রশ্ন যোগ হয়েছে${report.skipped ? ` · ${report.skipped}টি বাদ` : ""} ✅`, "success");
  };

  const quickAI = async () => {
    if (!aiTopic.trim()) return push("একটি বিষয় লিখুন", "error");
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "quickGenerate",
          quizId,
          params: {
            count: aiCount,
            topic: aiTopic,
            difficulty: aiDiff,
            types: aiTypes,
            language: aiLang,
            marks: 1,
            timer: s.globalTimer || 30,
            withExplanation: true,
            withHint: true,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      push(`${data.added}টি প্রশ্ন যোগ হয়েছে ✅`, "success");
      setAiOpen(false);
      setAiTopic("");
      load();
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    } finally {
      setAiBusy(false);
    }
  };

  const shuffleAll = async () => {
    const next = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(next);
    await post({ op: "reorder", id: quizId, order: next.map((q) => q.id) });
    push("প্রশ্ন এলোমেলো করা হয়েছে", "success");
  };

  if (!quiz) return <p className="p-6 text-sm text-slate-500">লোড হচ্ছে…</p>;
  const s = quiz.settings;
  const theme = mergeTemplate(templates.find((t) => t.id === s.templateId)?.config);

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 p-3 shadow-sm">
        <Link href="/teacher/quizzes">
          <Button size="sm" variant="ghost" className="font-bold text-slate-700 dark:text-slate-200">
            ← ফিরে যান
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <input
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            onBlur={() => post({ op: "update", id: quizId, data: { title: quiz.title } })}
            placeholder="কুইজের শিরোনাম..."
            className="w-full rounded-xl border border-transparent bg-transparent px-2.5 py-1 text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pdfSource && (
            <Badge tone="teal" className="gap-1.5 py-1 px-3">
              <span>📚 সংযুক্ত PDF: <strong>{pdfSource.title}</strong></span>
              <a
                href={pdfSource.storagePath}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-teal-600 font-black ml-1"
              >
                দেখুন ↗
              </a>
            </Badge>
          )}
          <Badge tone={quiz.status === "published" ? "green" : "slate"}>
            {quiz.status === "published" ? "🟢 প্রকাশিত" : "📝 ড্রাফট"}
          </Badge>
          <Badge tone="blue">{questions.length}টি প্রশ্ন</Badge>
          <Badge tone="gold">{totalMarks} মার্কস</Badge>
          <Badge tone="teal">⏱ {formatDuration(totalTime + (s.examBufferSeconds ?? 0))}</Badge>
          
          <Button
            size="sm"
            variant="outline"
            loading={publishing}
            className="font-bold text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600"
            onClick={async () => {
              setPublishing(true);
              try {
                const res = await post({ op: "publish", id: quizId });
                if (res) {
                  push("কুইজ প্রকাশিত হয়েছে! এবার শিক্ষার্থীরা অংশ নিতে পারবে।", "success");
                  load();
                }
              } finally {
                setPublishing(false);
              }
            }}
          >
            {quiz.status === "published" ? "🔄 পুনরায় প্রকাশ" : "🚀 প্রকাশ করুন"}
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm"
            loading={liveStarting}
            onClick={async () => {
              setLiveStarting(true);
              try {
                const res = await fetch("/api/live", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ action: "create", quizId }),
                });
                const data = await res.json();
                if (res.ok) {
                  push(`পিন ${data.pin} প্রস্তুত! লাইভ কন্ট্রোল রুমে যাচ্ছেন...`, "success");
                  router.push(`/host/${data.pin}`);
                } else {
                  push(data.error ?? "ব্যর্থ", "error");
                }
              } finally {
                setLiveStarting(false);
              }
            }}
          >
            📡 লাইভ শুরু
          </Button>
          <Link href={`/student/quizzes`}>
            <Button size="sm" variant="ghost" className="font-bold text-slate-700 dark:text-slate-200">
              👁️ শিক্ষার্থী ভিউ
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Question Creator Banner */}
      <Card className="overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white border-none shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>⚡ দ্রুত প্রশ্ন যোগ করুন</span>
              <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">
                {questions.length}টি তৈরি আছে
              </span>
            </p>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5 font-medium">
              ম্যানুয়ালি লিখুন, এআই দিয়ে বানান, প্রশ্ন ব্যাংক থেকে আনুন অথবা টেক্সট কপি-পেস্ট করুন।
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold shadow-sm" onClick={() => setManualOpen(true)}>
              ✍️ Manual প্রশ্ন
            </Button>
            <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black shadow-sm" onClick={() => setAiOpen(true)}>
              🤖 AI প্রশ্ন জেনারেটর
            </Button>
            <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold" onClick={() => setPasteOpen(true)}>
              📋 Copy-Paste
            </Button>
            <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold" onClick={() => setPickerOpen(true)}>
              📚 প্রশ্ন ব্যাংক
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr_330px]">
        {/* ------------------------------ question list ------------------------------ */}
        <Card padded={false} className="p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                প্রশ্ন তালিকা
              </span>
              <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 text-[11px] font-black text-teal-800 dark:text-teal-200">
                {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={shuffleAll} title="এলোমেলো করুন" className="h-8 px-2 font-bold text-xs">
                🔀
              </Button>
              <Button size="sm" variant="outline" onClick={() => setManualOpen(true)} className="h-8 px-2 font-bold text-xs">
                + প্রশ্ন
              </Button>
            </div>
          </div>

          <Input
            value={listQuery}
            onChange={(e) => { setListQuery(e.target.value); setPage(0); }}
            placeholder="🔍 প্রশ্ন খুঁজুন…"
            className="py-2 text-xs font-medium"
          />

          {questions.length ? (
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <div key={d} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2 py-2">
                  <p className="text-sm font-black tabular-nums text-slate-900 dark:text-slate-100">{mix.byDiff[d] ?? 0}</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {d === "easy" ? "সহজ" : d === "medium" ? "মাঝারি" : "কঠিন"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {picked.length ? (
            <div className="rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/70 p-2.5 shadow-sm">
              <p className="mb-2 text-xs font-black text-teal-950 dark:text-teal-100">{picked.length}টি প্রশ্ন নির্বাচিত</p>
              <div className="flex flex-wrap gap-1">
                {[10, 30, 60].map((t) => (
                  <button key={t} onClick={() => bulkTiming("timer", t)}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-50">⏱{t}s</button>
                ))}
                {[1, 2, 5].map((m) => (
                  <button key={m} onClick={() => bulkTiming("marks", m)}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-50">🎯{m}m</button>
                ))}
                <button onClick={bulkRemove} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-rose-700">সরান</button>
                <button onClick={() => setPicked([])} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">বাতিল</button>
              </div>
            </div>
          ) : null}

          <div className="max-h-[520px] space-y-2 overflow-y-auto pg-scroll pr-0.5">
            {visible.map((q, i) => {
              const index = questions.indexOf(q);
              const isActive = active === index;
              return (
                <div
                  key={q.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
                  onDragLeave={() => setDragOver((d) => (d === index ? null : d))}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const from = Number(e.dataTransfer.getData("text/plain"));
                    if (Number.isNaN(from) || from === index) return;
                    const next = [...questions];
                    const [item] = next.splice(from, 1);
                    next.splice(index, 0, item);
                    setQuestions(next);
                    await post({ op: "reorder", id: quizId, order: next.map((x) => x.id) });
                  }}
                  onClick={() => setActive(index)}
                  className={cx(
                    "cursor-grab rounded-xl border p-2.5 text-xs transition-all shadow-sm",
                    isActive
                      ? "border-teal-500 bg-teal-50/90 dark:bg-teal-950/70 ring-2 ring-teal-400/40"
                      : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-teal-300 dark:hover:border-teal-700",
                    dragOver === index && "border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/50",
                    picked.includes(q.id) && "ring-2 ring-teal-500",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded accent-teal-600 cursor-pointer"
                      checked={picked.includes(q.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setPicked((s2) => (e.target.checked ? [...s2, q.id] : s2.filter((x) => x !== q.id)))
                      }
                      aria-label={`select question ${index + 1}`}
                    />
                    <span className="font-black text-xs text-slate-600 dark:text-slate-300 min-w-[18px]">
                      {index + 1}.
                    </span>
                    <span className="line-clamp-2 flex-1 font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.text}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Badge tone="teal">⏱ {q.timer}s</Badge>
                    <Badge tone="slate">{q.marks}m</Badge>
                    <Badge tone={q.difficulty === "easy" ? "green" : q.difficulty === "hard" ? "coral" : "gold"}>
                      {q.difficulty === "easy" ? "সহজ" : q.difficulty === "hard" ? "কঠিন" : "মাঝারি"}
                    </Badge>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); move(index, -1); }}
                      aria-label="up"
                      title="উপরে নিন"
                      className="h-6 w-6 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); move(index, 1); }}
                      aria-label="down"
                      title="নিচে নিন"
                      className="h-6 w-6 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition"
                    >
                      ↓
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await post({ op: "removeQuestion", id: quizId, questionIds: [q.id] });
                        load();
                      }}
                      className="h-6 w-6 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 flex items-center justify-center transition"
                      aria-label="remove"
                      title="মুছে ফেলুন"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
            {!questions.length ? (
              <div className="py-8 text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">এখনো কোনো প্রশ্ন নেই</p>
                <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black" onClick={() => setAiOpen(true)}>
                  ✨ এআই দিয়ে শুরু করুন
                </Button>
              </div>
            ) : null}
          </div>
          {filtered.length > PAGE_SIZE ? (
            <div className="mt-2 flex items-center justify-between text-xs">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← আগের</button>
              <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span>
              <button
                disabled={(page + 1) * PAGE_SIZE >= filtered.length}
                onClick={() => setPage((p) => p + 1)}
              >
                পরের →
              </button>
            </div>
          ) : null}
        </Card>

        {/* --------------------------------- canvas --------------------------------- */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["desktop", "mobile", "exam"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPreviewMode(m)}
                className={cx(
                  "rounded-xl border px-3.5 py-2 text-xs font-black transition-all shadow-sm",
                  previewMode === m
                    ? "border-teal-600 bg-teal-600 text-white ring-2 ring-teal-500/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                )}
              >
                {m === "desktop" ? "🖥️ ডেস্কটপ" : m === "mobile" ? "📱 মোবাইল" : "📝 পরীক্ষা"}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => { setShowReveal((v) => !v); setRevealKey((k) => k + 1); }}
              className={cx(
                "rounded-xl border px-3.5 py-2 text-xs font-black transition-all shadow-sm",
                showReveal
                  ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-500/20"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
              )}
            >
              {showReveal ? "✅ উত্তর দেখানো হচ্ছে" : "👁 উত্তর রিভিল প্রিভিউ"}
            </button>
          </div>

          <ThemeStage
            config={previewMode === "exam" ? { ...theme, backgroundMotion: "static", particles: "none", background: "#f1f5f9" } : theme}
            className={cx(
              "mx-auto w-full rounded-2xl p-4 shadow-xl transition-all border border-slate-200/50 dark:border-slate-800",
              previewMode === "mobile" && "max-w-sm",
            )}
          >
            {current ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className={cx("text-xs font-extrabold", previewMode === "exam" ? "text-slate-700" : "text-white/90 drop-shadow-sm")}>
                    প্রশ্ন {active + 1} / {questions.length}
                  </span>
                  {previewMode !== "exam" ? (
                    <QuizTimer endsAt={null} total={current.timer} style={theme.timerStyle} color={theme.accent} size={64} />
                  ) : (
                    <span className="text-xs font-black text-slate-700">
                      মোট সময়: {formatDuration(totalTime + (s.examBufferSeconds ?? 0))}
                    </span>
                  )}
                </div>
                <div className="mt-2" key={revealKey}>
                  <QuizPlate
                    plateStyle={s.plateStyle || "auto"}
                    questionIndex={active}
                    totalQuestions={questions.length}
                    questionText={current.text}
                    options={current.options}
                    type={current.type}
                    selected={showReveal ? [1] : []}
                    reveal={showReveal}
                    correct={current.correct}
                    hint={current.hint}
                    explanation={current.explanation}
                    mode="preview"
                    disabled
                  />
                </div>
                {showReveal ? (
                  <p className="mt-2 text-center text-xs font-bold text-white/90 drop-shadow-sm">
                    সবুজ = সঠিক · কাঁপুনি = ভুল উত্তর — শিক্ষার্থীরা এভাবেই দেখবে
                  </p>
                ) : null}
              </>
            ) : (
              <p className="py-16 text-center text-sm font-bold text-white/90">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
            )}
          </ThemeStage>

          {current ? (
            <Card className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                  ⚙️ সক্রিয় প্রশ্ন #{active + 1} কাস্টমাইজেশন
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge tone="teal">{current.type}</Badge>
                  <Badge tone={current.difficulty === "easy" ? "green" : current.difficulty === "hard" ? "coral" : "gold"}>
                    {current.difficulty === "easy" ? "সহজ" : current.difficulty === "hard" ? "কঠিন" : "মাঝারি"}
                  </Badge>
                </div>
              </div>

              {/* Direct Inline Edit of Question Text */}
              <Field label="প্রশ্নের টেক্সট পরিবর্তন করুন">
                <input
                  type="text"
                  value={current.text}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuestions((qs) => qs.map((q, i) => (i === active ? { ...q, text: v } : q)));
                  }}
                  onBlur={() =>
                    post({
                      op: "questionOverride",
                      id: quizId,
                      questionIds: [current.id],
                      data: { text: current.text, marks: current.marks, timer: current.timer },
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </Field>

              <div className="grid gap-2.5 sm:grid-cols-3">
                <Field label="নম্বর / মার্কস">
                  <Input
                    type="number"
                    value={current.marks}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setQuestions((qs) => qs.map((q, i) => (i === active ? { ...q, marks: v } : q)));
                    }}
                    onBlur={() =>
                      post({ op: "questionOverride", id: quizId, questionIds: [current.id], data: { marks: current.marks, timer: current.timer } })
                    }
                  />
                </Field>
                <Field label="এই প্রশ্নের সময় (সেকেন্ড)">
                  <Input
                    type="number" min={5} max={300}
                    value={current.timer}
                    onChange={(e) => {
                      const v = Math.max(5, Math.min(300, Number(e.target.value) || 5));
                      setQuestions((qs) => qs.map((q, i) => (i === active ? { ...q, timer: v } : q)));
                    }}
                    onBlur={() =>
                      post({ op: "questionOverride", id: quizId, questionIds: [current.id], data: { marks: current.marks, timer: current.timer } })
                    }
                  />
                </Field>
                <Field label="ডিফিকাল্টি">
                  <Input value={current.difficulty === "easy" ? "সহজ" : current.difficulty === "hard" ? "কঠিন" : "মাঝারি"} disabled className="font-bold opacity-90" />
                </Field>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="এই প্রশ্নের Animation">
                  <Select value={String(current.settings?.animation ?? "slide")} onChange={async (e) => { const animation = e.target.value; setQuestions(qs => qs.map((q,i)=>i===active?{...q,settings:{...(q.settings??{}),animation}}:q)); await post({ op: "questionOverride", id: quizId, questionIds: [current.id], data: { marks: current.marks, timer: current.timer, settings: { ...(current.settings ?? {}), animation } } }); }}>
                    <option value="fade">Fade</option><option value="slide">Slide</option><option value="zoom">Zoom</option><option value="flip">Flip</option><option value="pop">Pop</option><option value="none">None</option>
                  </Select>
                </Field>
                <Field label="Question layout">
                  <Select value={String(current.settings?.layout ?? "classic")} onChange={async (e) => { const layout=e.target.value; setQuestions(qs=>qs.map((q,i)=>i===active?{...q,settings:{...(q.settings??{}),layout}}:q)); await post({ op: "questionOverride", id: quizId, questionIds: [current.id], data: { marks: current.marks, timer: current.timer, settings: { ...(current.settings ?? {}), layout } } }); }}>
                    <option value="classic">Classic</option><option value="split">Split</option><option value="focus">Focus</option><option value="minimal">Minimal</option>
                  </Select>
                </Field>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">দ্রুত সময় নির্ধারণ</p>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 30, 45, 60, 90, 120].map((t) => (
                    <button
                      key={t}
                      onClick={async () => {
                        setQuestions((qs) => qs.map((q, i) => (i === active ? { ...q, timer: t } : q)));
                        await post({
                          op: "questionOverride",
                          id: quizId,
                          questionIds: [current.id],
                          data: { marks: current.marks, timer: t },
                        });
                      }}
                      className={cx(
                        "rounded-xl border px-3 py-1.5 text-xs font-black transition-all",
                        current.timer === t
                          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700",
                      )}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  ⏱ কঠিন প্রশ্নে বেশি সময় দিন — মোট কুইজ সময় নিজে থেকেই যোগ হবে।
                </p>
              </div>

              {current.explanation ? (
                <p className="mt-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs font-medium text-amber-950 dark:text-amber-200">
                  <b>ব্যাখ্যা:</b> {current.explanation}
                </p>
              ) : null}
            </Card>
          ) : null}
        </div>

        {/* -------------------------------- settings -------------------------------- */}
        <Card className="space-y-4">
          <Tabs
            tabs={[
              { id: "simple", label: "সহজ" },
              { id: "advanced", label: "অ্যাডভান্সড" },
              { id: "rounds", label: "রাউন্ড" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === "simple" ? (
            <div className="space-y-3.5">
              <Field label="কুইজের ধরন">
                <Select
                  value={quiz.mode}
                  onChange={async (e) => {
                    const mode = e.target.value;
                    const settings = mode === "exam" ? EXAM_SETTINGS : DEFAULT_SETTINGS;
                    setQuiz({ ...quiz, mode, settings });
                    await post({ op: "update", id: quizId, data: { mode, settings } });
                  }}
                >
                  <option value="live">লাইভ কুইজ (ক্লাসরুম গেম)</option>
                  <option value="exam">ফরমাল পরীক্ষা (টাইমার ও পাস মার্ক)</option>
                  <option value="practice">অনুশীলন মোড (স্ব-গতিতে)</option>
                </Select>
              </Field>

              <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-teal-50/90 dark:bg-teal-950/50 p-3.5 shadow-sm">
                <p className="text-xs font-black text-teal-950 dark:text-teal-200">⏱ মোট সময় স্বয়ংক্রিয় হিসাব</p>
                <p className="mt-0.5 text-xl font-black text-teal-800 dark:text-teal-200">
                  {formatDuration(totalTime + (s.examBufferSeconds ?? 0))}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {questions.length}টি প্রশ্নের সময়ের যোগফল ({formatDuration(totalTime)})
                  {s.examBufferSeconds ? ` + ${s.examBufferSeconds}s বাফার` : ""}।
                  প্রশ্ন যোগ করলে সময়ও নিজে থেকেই আপডেট হয়।
                </p>
              </div>

              <Field label="নতুন প্রশ্নের ডিফল্ট সময়" hint="প্রতিটি প্রশ্নে আলাদা করে বদলাতে পারবেন">
                <Select value={s.globalTimer} onChange={(e) => saveSettings({ ...s, globalTimer: Number(e.target.value) })}>
                  {[5, 10, 15, 20, 30, 45, 60, 90, 120, 180].map((t) => <option key={t} value={t}>{t} সেকেন্ড</option>)}
                </Select>
              </Field>

              <Field label="অতিরিক্ত বাফার (সেকেন্ড)" hint="পড়া ও নেভিগেশনের জন্য বাড়তি সময়">
                <Input
                  type="number" min={0} max={600} step={15}
                  value={s.examBufferSeconds ?? 60}
                  onChange={(e) => saveSettings({ ...s, examBufferSeconds: Number(e.target.value) })}
                />
              </Field>

              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">ভিজ্যুয়াল থিম</p>
                <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pg-scroll">
                  <button
                    onClick={() => saveSettings({ ...s, templateId: null })}
                    className={cx(
                      "overflow-hidden rounded-xl border-2 text-left transition-all",
                      !s.templateId ? "border-teal-500 ring-2 ring-teal-500/20" : "border-slate-200 dark:border-slate-700",
                    )}
                  >
                    <ThemeStage config={{}} className="h-12" />
                    <span className="block px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">ডিফল্ট</span>
                  </button>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => saveSettings({ ...s, templateId: t.id })}
                      className={cx(
                        "overflow-hidden rounded-xl border-2 text-left transition-all",
                        s.templateId === t.id ? "border-teal-500 ring-2 ring-teal-500/20" : "border-slate-200 dark:border-slate-700",
                      )}
                    >
                      <ThemeStage config={t.config} className="h-12" />
                      <span className="block truncate px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                    </button>
                  ))}
                </div>
                <Link href="/teacher/templates" className="mt-2 inline-block text-xs font-black text-teal-600 dark:text-teal-400 hover:underline">
                  🎨 টেমপ্লেট স্টুডিওতে নতুন থিম বানান →
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <QuizPlateSelector
                  value={s.plateStyle || "auto"}
                  onChange={(val) => saveSettings({ ...s, plateStyle: val })}
                />
              </div>

              <Toggle checked={s.leaderboard} onChange={(v) => saveSettings({ ...s, leaderboard: v })} label="লিডারবোর্ড প্রদর্শন" />
              <Toggle checked={s.cinematicIntro} onChange={(v) => saveSettings({ ...s, cinematicIntro: v })} label="সিনেমাটিক ইন্ট্রো" />
              <Toggle checked={s.feedbackEnabled} onChange={(v) => saveSettings({ ...s, feedbackEnabled: v })} label="শিক্ষার্থীদের ফিডব্যাক নিন" />
            </div>
          ) : null}

          {tab === "advanced" ? (
            <div className="space-y-3">
              <Field label="স্কোরিং">
                <Select value={s.scoring} onChange={(e) => saveSettings({ ...s, scoring: e.target.value as QuizSettings["scoring"] })}>
                  <option value="standard">স্ট্যান্ডার্ড</option>
                  <option value="speed">স্পিড বোনাস</option>
                  <option value="difficulty">ডিফিকাল্টি ভিত্তিক</option>
                  <option value="custom">কাস্টম</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="বেস পয়েন্ট">
                  <Input type="number" value={s.basePoints} onChange={(e) => saveSettings({ ...s, basePoints: Number(e.target.value) })} />
                </Field>
                <Field label="স্পিড বোনাস">
                  <Input type="number" value={s.speedBonus} onChange={(e) => saveSettings({ ...s, speedBonus: Number(e.target.value) })} />
                </Field>
              </div>
              <Toggle checked={s.streakBonus} onChange={(v) => saveSettings({ ...s, streakBonus: v })} label="স্ট্রিক বোনাস" />
              <Field label="টাইমার স্টাইল">
                <Select value={s.timerStyle} onChange={(e) => saveSettings({ ...s, timerStyle: e.target.value as QuizSettings["timerStyle"] })}>
                  {["circular", "linear", "digital", "flip", "pulse", "minimal"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="টাইমার মোড">
                <Select value={s.timerMode} onChange={(e) => saveSettings({ ...s, timerMode: e.target.value as QuizSettings["timerMode"] })}>
                  <option value="per_question">প্রতি প্রশ্নে</option>
                  <option value="global">গ্লোবাল</option>
                  <option value="per_round">প্রতি রাউন্ডে</option>
                </Select>
              </Field>
              <Field label="মোশন লেভেল">
                <Select value={s.motion} onChange={(e) => saveSettings({ ...s, motion: e.target.value as QuizSettings["motion"] })}>
                  <option value="low">কম</option>
                  <option value="medium">মাঝারি</option>
                  <option value="high">বেশি</option>
                </Select>
              </Field>
              <Toggle checked={s.reactions} onChange={(v) => saveSettings({ ...s, reactions: v })} label="লাইভ রিঅ্যাকশন" />
              <Toggle checked={s.sound} onChange={(v) => saveSettings({ ...s, sound: v })} label="সাউন্ড" />
              <Toggle
                checked={s.teamMode}
                onChange={(v) => saveSettings({ ...s, teamMode: v })}
                label="টিম মোড"
              />
              {s.teamMode ? (
                <Field label="টিম সংখ্যা (২-২০)">
                  <Input type="number" min={2} max={20} value={s.teamCount} onChange={(e) => saveSettings({ ...s, teamCount: Number(e.target.value) })} />
                </Field>
              ) : null}
              <p className="pt-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">পাওয়ার-আপ</p>
              {Object.keys(s.powerUps).map((k) => (
                <Toggle
                  key={k}
                  checked={s.powerUps[k]}
                  onChange={(v) => saveSettings({ ...s, powerUps: { ...s.powerUps, [k]: v } })}
                  label={k}
                />
              ))}
              <p className="pt-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">পরীক্ষা সেটিংস</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="নেগেটিভ মার্কিং">
                  <Input type="number" step={0.25} value={s.negativeMarking} onChange={(e) => saveSettings({ ...s, negativeMarking: Number(e.target.value) })} />
                </Field>
                <Field label="পাস মার্ক %">
                  <Input type="number" value={s.passMark} onChange={(e) => saveSettings({ ...s, passMark: Number(e.target.value) })} />
                </Field>
              </div>
              <Toggle checked={s.randomQuestions} onChange={(v) => saveSettings({ ...s, randomQuestions: v })} label="প্রশ্ন এলোমেলো" />
              <Toggle checked={s.randomOptions} onChange={(v) => saveSettings({ ...s, randomOptions: v })} label="অপশন এলোমেলো" />
              <Toggle checked={s.guestJoin} onChange={(v) => saveSettings({ ...s, guestJoin: v })} label="গেস্ট জয়েন (নিকনেম)" />

              <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 shadow-sm">
                <p className="mb-2 text-xs font-black text-slate-800 dark:text-slate-100">প্রিসেট হিসেবে সংরক্ষণ</p>
                <div className="flex gap-2">
                  <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="প্রিসেটের নাম" />
                  <Button
                    size="sm"
                    className="font-bold"
                    onClick={async () => {
                      await post({ op: "savePreset", name: presetName || "নতুন প্রিসেট", settings: s });
                      push("প্রিসেট সংরক্ষিত", "success");
                    }}
                  >
                    সংরক্ষণ
                  </Button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => saveSettings({ ...DEFAULT_SETTINGS })}>দ্রুত ক্লাসরুম কুইজ</Button>
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => saveSettings({ ...EXAM_SETTINGS })}>ফরমাল পরীক্ষা</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold"
                    onClick={() => saveSettings({ ...DEFAULT_SETTINGS, scoring: "difficulty", teamMode: true, powerUps: { ...s.powerUps, double_points: true, fifty_fifty: true } })}
                  >
                    কম্পিটিশন মোড
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "rounds" ? (
            <div className="space-y-3">
              {rounds.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 shadow-sm">
                  <Input
                    value={r.name}
                    onChange={(e) => setRounds((rs) => rs.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
                    onBlur={() => post({ op: "updateRound", id: r.id, name: r.name, settings: r.settings })}
                    className="font-bold"
                  />
                  <Button size="sm" variant="ghost" className="text-rose-500 font-bold" onClick={async () => { await post({ op: "deleteRound", id: r.id }); load(); }}>✕</Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="font-bold" onClick={async () => { await post({ op: "addRound", id: quizId }); load(); }}>
                + রাউন্ড যোগ করুন
              </Button>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                রাউন্ড ব্যবহার করে বিষয়ভিত্তিক পর্ব তৈরি করুন — যেমন রাউন্ড ১ কম্পিউটার, রাউন্ড ২ গণিত।
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="✍️ Manual Quiz Builder" wide footer={<><Button variant="ghost" onClick={() => setManualOpen(false)}>বাতিল</Button><Button onClick={createManual}>প্রশ্ন যোগ করুন</Button></>}>
        <QuestionTypeEditor value={manual} onChange={setManual} />
      </Modal>

      <Modal open={pasteOpen} onClose={() => setPasteOpen(false)} title="📋 Copy-Paste Question Import" wide footer={<><Button variant="ghost" onClick={() => setPasteOpen(false)}>বাতিল</Button><Button onClick={importPaste}>প্রশ্ন শনাক্ত করে যোগ করুন</Button></>}>
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Numbered questions, A/B/C/D options, Answer:, CSV/TSV বা * দিয়ে correct option mark করা text পেস্ট করতে পারবেন।</p>
          <textarea
            className="min-h-[360px] w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-400"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`1. বাংলাদেশের রাজধানী কোনটি?\nA) ঢাকা\nB) চট্টগ্রাম\nC) রাজশাহী\nD) খুলনা\nAnswer: A\n\n2. ...`}
          />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Parser বাংলা/English দুটোই বোঝে এবং question type স্বয়ংক্রিয়ভাবে শনাক্ত করে।</p>
        </div>
      </Modal>

      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="✨ এআই দিয়ে প্রশ্ন যোগ করুন"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAiOpen(false)}>বাতিল</Button>
            <Button loading={aiBusy} onClick={quickAI} disabled={!aiTopic.trim()} className="font-bold">
              {aiCount}টি প্রশ্ন যোগ করুন
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label="কোন বিষয়ে প্রশ্ন চান?" required hint="যেমন: HTML ফর্ম · সালোকসংশ্লেষণ · বাংলাদেশের মুক্তিযুদ্ধ">
            <Input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="বিষয় বা টপিক লিখুন"
              autoFocus
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">কতটি প্রশ্ন?</p>
            <div className="flex flex-wrap gap-1.5">
              {[3, 5, 10, 15, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setAiCount(n)}
                  className={cx(
                    "rounded-xl border px-3 py-1.5 text-xs font-black transition-all",
                    aiCount === n
                      ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-400",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="ডিফিকাল্টি">
              <Select value={aiDiff} onChange={(e) => setAiDiff(e.target.value)}>
                <option value="easy">সহজ</option>
                <option value="medium">মাঝারি</option>
                <option value="hard">কঠিন</option>
              </Select>
            </Field>
            <Field label="ভাষা">
              <Select value={aiLang} onChange={(e) => setAiLang(e.target.value)}>
                <option value="bn">বাংলা</option>
                <option value="en">English</option>
                <option value="mixed">মিশ্র</option>
              </Select>
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">প্রশ্নের ধরন</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["mcq", "🔘 Multiple Choice"], ["multi_select", "☑️ Multiple Select"], ["true_false", "✔️ True / False"],
                ["short_answer", "📝 Short Answer"], ["numeric_answer", "🔢 Numeric Answer"], ["word_answer", "🔤 Word Answer"],
                ["puzzle", "🧩 Puzzle"], ["matching", "↔️ Matching"], ["ordering", "🔀 Ordering"], ["poll", "📊 Poll"],
                ["word_cloud", "☁️ Word Cloud"], ["open_ended", "💭 Open-ended"],
                ["word_jumble", "🧩 Word Jumble"], ["odd_one_out", "🧩 Odd One Out"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() =>
                    setAiTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]))
                  }
                  className={cx(
                    "rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all",
                    aiTypes.includes(v)
                      ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-400",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-3 text-xs font-medium text-slate-700 dark:text-slate-300">
            💡 প্রশ্নগুলো সরাসরি এই কুইজে যোগ হবে এবং প্রশ্ন ব্যাংকেও সংরক্ষিত থাকবে। যোগ হওয়ার পর
            সম্পাদনা করতে পারবেন।
          </p>
        </div>
      </Modal>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="প্রশ্ন ব্যাংক থেকে যোগ করুন" wide>
        <div className="flex gap-2">
          <Input value={bankQuery} onChange={(e) => setBankQuery(e.target.value)} placeholder="খুঁজুন…" />
          <Button onClick={searchBank} className="font-bold">খুঁজুন</Button>
        </div>
        <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto pg-scroll">
          {bankRows.map((q) => (
            <div key={q.id} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3 text-sm font-medium shadow-sm">
              <span className="flex-1 font-bold text-slate-900 dark:text-slate-100">{q.text}</span>
              <Badge tone="slate">{q.difficulty}</Badge>
              <Button
                size="sm"
                className="font-bold"
                onClick={async () => {
                  await post({ op: "addQuestions", id: quizId, questionIds: [q.id] });
                  load();
                  push("যোগ হয়েছে", "success");
                }}
              >
                + যোগ
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            variant="gold"
            block
            className="font-black"
            onClick={() => { setPickerOpen(false); setAiOpen(true); }}
          >
            ✨ এআই দিয়ে তৈরি করুন
          </Button>
          <Link href="/teacher/ai">
            <Button variant="outline" block className="font-bold">📄 PDF / পেস্ট থেকে আনুন</Button>
          </Link>
        </div>
      </Modal>
    </div>
  );
}
