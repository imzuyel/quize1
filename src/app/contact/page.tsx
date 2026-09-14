import Link from "next/link";
import { getSeo } from "@/lib/seo";
import { PublicNav, PublicFooter } from "@/components/public-nav";

export const dynamic = "force-dynamic";

export async function generateMetadata() { const seo = await getSeo(); return { title: "যোগাযোগ", description: `${seo.siteName} এর সাথে যোগাযোগ করুন।` }; }

export default async function ContactPage() {
  const seo = await getSeo();
  return <><PublicNav siteName={seo.siteName} />
    <main className="min-h-screen bg-[var(--pg-mist)] px-4 py-8">
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="pg-surface p-6">
        <Link href="/" className="text-sm font-bold text-[var(--pg-teal)]">← হোম</Link>
        <h1 className="mt-4 text-3xl font-black">📞 যোগাযোগ করুন</h1>
        <p className="mt-2 text-sm text-slate-500">প্রশ্ন, পরামর্শ, সহযোগিতা বা প্ল্যাটফর্ম সংক্রান্ত বিষয়ে যোগাযোগ করুন।</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="pg-surface p-5"><b>📍 ঠিকানা</b><p className="mt-2 text-sm text-slate-500">{seo.org.address || "—"}</p></div>
        <div className="pg-surface p-5"><b>✉️ ইমেইল</b><p className="mt-2 text-sm text-slate-500">{seo.org.email || "—"}</p></div>
        <div className="pg-surface p-5"><b>☎️ ফোন</b><p className="mt-2 text-sm text-slate-500">{seo.org.phone || "—"}</p></div>
      </section>
      <section className="pg-surface p-6">
        <h2 className="text-xl font-black">বার্তা পাঠান</h2>
        <form action={`mailto:${seo.org.email || "info@pgtsc.edu.bd"}`} method="post" encType="text/plain" className="mt-4 grid gap-3 sm:grid-cols-2">
          <input required name="name" placeholder="আপনার নাম" className="rounded-xl border border-[var(--pg-line)] bg-white px-4 py-3" />
          <input required type="email" name="email" placeholder="আপনার ইমেইল" className="rounded-xl border border-[var(--pg-line)] bg-white px-4 py-3" />
          <input name="subject" placeholder="বিষয়" className="rounded-xl border border-[var(--pg-line)] bg-white px-4 py-3 sm:col-span-2" />
          <textarea required name="message" rows={6} placeholder="আপনার বার্তা" className="rounded-xl border border-[var(--pg-line)] bg-white px-4 py-3 sm:col-span-2" />
          <button className="rounded-xl bg-[var(--pg-teal)] px-5 py-3 font-bold text-white sm:w-fit" type="submit">বার্তা পাঠান →</button>
        </form>
        <p className="mt-3 text-xs text-slate-400">ইমেইল ক্লায়েন্ট না থাকলে উপরের তথ্য ব্যবহার করে সরাসরি ইমেইল করতে পারেন।</p>
      </section>
    </div>
  </main><PublicFooter /></>;
}
