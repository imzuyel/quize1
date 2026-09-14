"use client";

import { QUESTION_TYPES } from "@/lib/question-types";
import { Field, Input, Select, cx } from "./ui";

export type ManualQuestionDraft = {
  text: string;
  type: string;
  options: string[];
  correct: number[];
  answerText: string;
  marks: number;
  timer: number;
  difficulty: string;
  explanation: string;
  hint: string;
  animation: string;
  tolerance: number;
};

export const EMPTY_MANUAL_QUESTION: ManualQuestionDraft = {
  text: "", type: "mcq", options: ["", "", "", ""], correct: [0], answerText: "",
  marks: 1, timer: 30, difficulty: "medium", explanation: "", hint: "", animation: "slide", tolerance: 0,
};

const OPTION_TYPES = new Set(["mcq", "multi_select", "true_false", "poll", "matching", "ordering"]);
const NO_OPTION_TYPES = new Set(["short_answer", "word_answer", "numeric_answer", "word_cloud", "open_ended"]);

export function QuestionTypeEditor({ value, onChange }: { value: ManualQuestionDraft; onChange: (v: ManualQuestionDraft) => void }) {
  const patch = (p: Partial<ManualQuestionDraft>) => onChange({ ...value, ...p });
  const type = value.type;
  const selected = (i: number) => value.correct.includes(i);
  const toggleCorrect = (i: number) => {
    const next = selected(i) ? value.correct.filter(x => x !== i) : [...value.correct, i];
    patch({ correct: next });
  };
  const setOption = (i: number, text: string) => patch({ options: value.options.map((x, j) => j === i ? text : x) });
  const addOption = () => patch({ options: [...value.options, ""] });
  const removeOption = (i: number) => {
    const opts = value.options.filter((_, j) => j !== i);
    patch({ options: opts, correct: value.correct.filter(x => x !== i).map(x => x > i ? x - 1 : x) });
  };

  return <div className="space-y-4 text-slate-900 dark:text-slate-100">
    <Field label="Question Type">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {QUESTION_TYPES.map(t => (
          <button key={t.value} type="button" onClick={() => patch({ type: t.value, correct: t.value === "true_false" ? [0] : t.value === "poll" || t.value === "open_ended" || t.value === "word_cloud" ? [] : value.correct })}
            className={cx(
              "rounded-2xl border p-3.5 text-left transition-all hover:-translate-y-0.5",
              type === t.value
                ? "border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-950 dark:text-teal-100 ring-2 ring-teal-400/40"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
            )}>
            <span className="text-2xl">{t.icon}</span>
            <span className="ml-2 font-black text-sm">{t.label}</span>
            <span className="mt-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">{t.description}</span>
          </button>
        ))}
      </div>
    </Field>

    <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 p-3.5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Timer (সেকেন্ড)"><Input type="number" min={5} max={300} value={value.timer} onChange={e => patch({ timer: Number(e.target.value) || 30 })} /></Field>
        <Field label="Marks (নম্বর)"><Input type="number" min={0} step={0.25} value={value.marks} onChange={e => patch({ marks: Number(e.target.value) || 0 })} /></Field>
        <Field label="Difficulty (ডিফিকাল্টি)"><Select value={value.difficulty} onChange={e => patch({ difficulty: e.target.value })}><option value="easy">সহজ (Easy)</option><option value="medium">মাঝারি (Medium)</option><option value="hard">কঠিন (Hard)</option></Select></Field>
      </div>
    </div>

    <Field label="প্রশ্ন" required>
      <textarea className="min-h-28 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-400" value={value.text} onChange={e => patch({ text: e.target.value })} placeholder="আপনার প্রশ্ন লিখুন…" />
    </Field>

    {type === "true_false" ? <div className="grid grid-cols-2 gap-2">{["True", "False"].map((o, i) => <button type="button" key={o} onClick={() => patch({ options: ["True", "False"], correct: [i] })} className={cx("rounded-xl border p-4 font-black text-sm", selected(i) ? "border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-100 ring-2 ring-teal-400/40" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200")}>{selected(i) ? "✓ " : ""}{o}</button>)}</div> : null}

    {OPTION_TYPES.has(type) && type !== "true_false" ? <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-slate-800 dark:text-slate-100">
          {type === "matching" ? "Pairs — Left → Right" : type === "ordering" ? "Items — সঠিক ক্রমে সাজাতে হবে" : "Options (অপশনসমূহ - টিকচিহ্ন দিয়ে সঠিক উত্তর চিহ্নিত করুন)"}
        </p>
        <button type="button" onClick={addOption} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
          + Option যোগ করুন
        </button>
      </div>
      {value.options.map((o, i) => (
        <div key={i} className={cx(
          "flex items-center gap-2.5 p-2 rounded-xl border transition duration-150",
          selected(i) && type !== "poll" && type !== "matching" && type !== "ordering"
            ? "border-emerald-500 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90"
        )}>
          {type !== "poll" && type !== "matching" && type !== "ordering" ? (
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <input type="checkbox" checked={selected(i)} onChange={() => toggleCorrect(i)} className="h-5 w-5 rounded accent-emerald-600 cursor-pointer" />
              {selected(i) && <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">✓ সঠিক</span>}
            </label>
          ) : null}
          <Input value={o} onChange={e => setOption(i, e.target.value)} placeholder={type === "matching" ? "Left → Right" : `Option ${String.fromCharCode(65 + i)}`} className="bg-transparent border-slate-300 dark:border-slate-600" />
          {type === "ordering" && <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Position {i + 1}</span>}
          {value.options.length > 2 ? <button type="button" onClick={() => removeOption(i)} className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-black text-sm">✕</button> : null}
        </div>
      ))}
      {type === "poll" ? <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Poll-এ কোনো correct answer থাকবে না।</p> : null}
      {type === "ordering" ? <p className="text-xs font-medium text-slate-600 dark:text-slate-400">উপরের তালিকার বর্তমান ক্রমই সঠিক ক্রম হিসেবে সংরক্ষিত হবে।</p> : null}
    </div> : null}

    {NO_OPTION_TYPES.has(type) ? <div className="space-y-2">
      <Field label={type === "numeric_answer" ? "Correct Number" : type === "open_ended" || type === "word_cloud" ? "Reference answer (optional)" : "Correct Answer / Keyword"}>
        <Input value={value.answerText} onChange={e => patch({ answerText: e.target.value })} placeholder={type === "numeric_answer" ? "যেমন 42" : "সঠিক উত্তর লিখুন…"} inputMode={type === "numeric_answer" ? "decimal" : "text"} />
      </Field>
      {type === "numeric_answer" ? <Field label="Tolerance (±)"><Input type="number" min={0} step={0.01} value={value.tolerance} onChange={e => patch({ tolerance: Number(e.target.value) || 0 })} /></Field> : null}
      {type === "open_ended" || type === "word_cloud" ? <p className="text-xs font-medium text-slate-600 dark:text-slate-400">এটি live response হিসেবে নেওয়া হবে; teacher পরে responses review করতে পারবেন।</p> : null}
    </div> : null}

    {type === "puzzle" ? <div className="space-y-2 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/70 dark:bg-violet-950/40 p-3.5">
      <Field label="Puzzle answer"><Input value={value.answerText} onChange={e => patch({ answerText: e.target.value })} placeholder="যেমন ROUTER" /></Field>
      <Field label="Puzzle tiles (optional)"><Input value={value.options.join(" ")} onChange={e => patch({ options: e.target.value.split(/\s+/).filter(Boolean) })} placeholder="R O U T E R" /></Field>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Student অক্ষর/টাইল সাজিয়ে বা টাইপ করে উত্তর দেবে।</p>
    </div> : null}

    <div className="grid gap-2 sm:grid-cols-3">
      <Field label="Animation"><Select value={value.animation} onChange={e => patch({ animation: e.target.value })}>{["fade", "slide", "zoom", "flip", "pop", "none"].map(x => <option key={x}>{x}</option>)}</Select></Field>
      <Field label="ব্যাখ্যা (Explanation)"><Input value={value.explanation} onChange={e => patch({ explanation: e.target.value })} placeholder="ঐচ্ছিক ব্যাখ্যা" /></Field>
      <Field label="ইঙ্গিত (Hint)"><Input value={value.hint} onChange={e => patch({ hint: e.target.value })} placeholder="ঐচ্ছিক হিন্ট" /></Field>
    </div>
  </div>;
}
