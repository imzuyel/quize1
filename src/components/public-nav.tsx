import Link from "next/link";

export function PublicNav({ siteName = "PGTSC Quiz Arena" }: { siteName?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#171c4a]/80 text-white shadow-lg shadow-indigo-950/15 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-[72px]">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 font-black shadow-lg shadow-violet-900/30">PG</span>
          <span className="truncate text-sm font-extrabold">{siteName}</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Public navigation">
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10" href="/about">সম্পর্কে</Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10" href="/gallery">গ্যালারি</Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10" href="/reviews">রিভিউ</Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10" href="/contact">যোগাযোগ</Link>
          <Link className="ml-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-400 px-4 py-2 text-sm font-bold shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5" href="/join">কুইজে Join</Link>
        </nav>
        <div className="ml-auto flex gap-2 md:hidden">
          <Link className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold" href="/gallery">গ্যালারি</Link>
          <Link className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-400 px-3 py-2 text-xs font-bold shadow-lg shadow-indigo-950/20" href="/join">Join</Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#171c4a] px-4 py-8 text-white/60">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-amber-300 to-cyan-400" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm">
        <p className="font-bold text-white">🎮 PGTSC Quiz Arena</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-white">সম্পর্কে</Link>
          <Link href="/gallery" className="hover:text-white">গ্যালারি</Link>
          <Link href="/reviews" className="hover:text-white">রিভিউ</Link>
          <Link href="/contact" className="hover:text-white">যোগাযোগ</Link>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
