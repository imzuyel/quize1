"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export default function GalleryPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  useEffect(() => { fetch('/api/gallery').then(r => r.json()).then(x => setEvents(x.events ?? [])); }, []);
  return <><PublicNav />
  <main className="min-h-screen bg-[var(--pg-mist)] px-4 py-8"><div className="mx-auto max-w-6xl space-y-6">
    <header className="pg-surface p-6"><Link href="/" className="text-sm font-bold text-[var(--pg-teal)]">← হোম</Link><h1 className="mt-4 text-3xl font-black">📸 কুইজ স্মৃতি গ্যালারি</h1><p className="mt-2 text-sm text-slate-500">লাইভ কুইজ, ক্লাসরুম ও শিক্ষার্থীদের স্মরণীয় মুহূর্ত। ছবিগুলো optimized ও lazy-loaded।</p></header>
    {events.length === 0 ? <section className="pg-surface p-10 text-center text-slate-500">এখনও কোনো public group photo প্রকাশিত হয়নি।</section> : <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map(e => <article key={e.id} className="overflow-hidden rounded-3xl border border-[var(--pg-line)] bg-white shadow-sm"><button className="block w-full text-left" onClick={() => setActive(e)}>{e.photos?.[0] ? <img src={e.photos[0].optimizedPath} alt={e.photos[0].altText || e.title} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover transition hover:scale-[1.02]" /> : <div className="grid aspect-[16/10] place-items-center bg-slate-100 text-5xl">📸</div>}<div className="p-5"><h2 className="font-black">{e.title}</h2><p className="mt-1 text-sm text-slate-500">{e.caption || 'স্মরণীয় কুইজ মুহূর্ত'}</p><div className="mt-3 text-xs text-slate-400">{e.photos?.length ?? 0} ছবি · {e.participantCount || 0} অংশগ্রহণকারী</div></div></button></article>)}</section>}
    <section className="pg-surface p-6"><h2 className="text-xl font-black">⭐ Public Reviews</h2><p className="mt-2 text-sm text-slate-500">কুইজ Arena সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন।</p><Link href="/reviews" className="mt-4 inline-flex rounded-xl bg-[var(--pg-teal)] px-5 py-3 font-bold text-white">Review দেখুন / দিন →</Link></section>
    {active && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setActive(null)}><div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-4" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-2"><h2 className="text-xl font-black">{active.title}</h2><button onClick={() => setActive(null)} className="rounded-full px-4 py-2 bg-slate-100">✕</button></div><div className="grid gap-3 sm:grid-cols-2">{active.photos?.map((p:any)=><img key={p.id} src={p.optimizedPath} alt={p.altText || active.title} loading="lazy" decoding="async" className="w-full rounded-2xl object-cover" />)}</div></div></div>}
  </div></main><PublicFooter /></>;
}
