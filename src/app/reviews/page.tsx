"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicFooter, PublicNav } from "@/components/public-nav";

type Review = { id: number; name: string; rating: number; comment: string };

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [sent, setSent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/reviews", { cache: "no-store" });
        const x = await r.json();
        if (!cancelled) setRows(Array.isArray(x?.reviews) ? x.reviews : []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent("");
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const x = await r.json();
      setSent(x.message || x.error || (r.ok ? "Submitted" : "Failed"));
      if (r.ok) setForm({ name: "", rating: 5, comment: "" });
    } catch {
      setSent("সার্ভারের সাথে যোগাযোগ করা যায়নি।");
    }
  }

  return (
    <>
      <PublicNav />
      <main className="min-h-screen bg-[var(--pg-mist)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="pg-surface p-6">
            <Link href="/" className="text-sm font-bold text-[var(--pg-teal)]">← হোম</Link>
            <h1 className="mt-4 text-3xl font-black">⭐ শিক্ষার্থীদের মতামত</h1>
            <p className="mt-2 text-sm text-slate-500">অনুমোদিত মতামত এখানে প্রকাশিত হয়। নতুন review আগে moderation-এর জন্য যায়।</p>
          </header>
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={submit} className="pg-surface space-y-4 p-6">
              <h2 className="text-xl font-black">আপনার মতামত</h2>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" className="w-full rounded-xl border p-3" />
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full rounded-xl border p-3">
                {[5,4,3,2,1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} — {n}</option>)}
              </select>
              <textarea required minLength={3} maxLength={1000} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={5} placeholder="আপনার অভিজ্ঞতা লিখুন..." className="w-full rounded-xl border p-3" />
              <button className="rounded-xl bg-[var(--pg-teal)] px-5 py-3 font-bold text-white">Review পাঠান</button>
              {sent && <p className="text-sm text-slate-500">{sent}</p>}
            </form>
            <div className="space-y-3">
              {loading ? <div className="pg-surface p-8 text-center text-slate-500">Review লোড হচ্ছে...</div> : rows.length === 0 ? <div className="pg-surface p-8 text-center text-slate-500">এখনও কোনো approved review নেই।</div> : rows.map((r) => (
                <article key={r.id} className="pg-surface p-5">
                  <div className="flex justify-between gap-4"><b>{r.name}</b><span>{"★".repeat(Math.max(0, Math.min(5, r.rating)))}{"☆".repeat(Math.max(0, 5 - Math.min(5, r.rating)))}</span></div>
                  <p className="mt-2 text-slate-600">{r.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
