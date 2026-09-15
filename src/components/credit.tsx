/** Tiny local class joiner so this stays a dependency-free server component. */
function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Platform author — shown in the public footer and the in-app About page. */
export const AUTHOR = {
  name: "মোঃ জুয়েল রানা",
  nameEn: "Md. Juyel Rana",
  title: "জুনিয়র ইন্সট্রাক্টর (আইটি সাপোর্ট এন্ড আইওটি বেসিকস)",
  titleEn: "Junior Instructor (IT Support & IoT Basics)",
  institute: "পঞ্চগড় সরকারি টেকনিক্যাল স্কুল এন্ড কলেজ",
  instituteEn: "Panchagarh Government Technical School and College",
  links: [
    {
      key: "web" as const,
      label: "ওয়েবসাইট",
      href: "https://imzuyel.top",
      handle: "imzuyel.top",
      ring: "#12a08c",
    },
    {
      key: "facebook" as const,
      label: "ফেসবুক",
      href: "https://facebook.com/imzuyel",
      handle: "@imzuyel",
      ring: "#1877f2",
    },
    {
      key: "page" as const,
      label: "বনমালী পেজ",
      href: "https://facebook.com/bonomaly001",
      handle: "বনমালী",
      ring: "#22c55e",
    },
  ],
};

type IconKey = (typeof AUTHOR.links)[number]["key"];

function BrandIcon({ name, size = 20 }: { name: IconKey; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;

  if (name === "facebook")
    return (
      <svg {...common} fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.470h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    );

  if (name === "page")
    // Leaf mark for the "বনমালী" (grove/garden) page.
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.5-6" />
      </svg>
    );

  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5c2.6 2.7 4 6 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-6-4-9.5s1.4-6.8 4-9.5Z" />
    </svg>
  );
}

/**
 * Icon-only social row with an animated ring.
 * Labels stay available to screen readers and as native tooltips.
 */
export function SocialRing({
  tone = "dark",
  size = 20,
  idle = true,
  className,
}: {
  tone?: "dark" | "light";
  size?: number;
  idle?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2.5", className)}>
      {AUTHOR.links.map((l, i) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer me"
          title={`${l.label} — ${l.handle}`}
          aria-label={`${l.label} (${l.handle}) — নতুন ট্যাবে খুলবে`}
          className={cx(
            "pg-social",
            idle && "pg-social-idle",
            tone === "dark" ? "text-white/85 hover:text-white" : "text-slate-600 hover:text-white",
          )}
          style={{ ["--ring" as string]: l.ring, ["--delay" as string]: `${i * 1.1}s` }}
        >
          <BrandIcon name={l.key} size={size} />
        </a>
      ))}
    </div>
  );
}

/** Compact one-line credit for footers/sidebars. */
export function CreditLine({ tone = "dark", branding }: { tone?: "dark" | "light"; branding?: { developerName?: string; developerTitle?: string; developerInstitute?: string } }) {
  const muted = tone === "dark" ? "text-slate-300" : "text-slate-600";
  const strong = tone === "dark" ? "text-white font-extrabold" : "text-slate-900 font-extrabold";
  return (
    <div>
      <p className={`text-xs ${muted}`}>
        ডিজাইন ও ডেভেলপমেন্ট — <span className={strong}>{branding?.developerName || AUTHOR.name}</span>
      </p>
      <SocialRing tone={tone} size={16} className="mt-2" />
    </div>
  );
}

/** Full developer card used on the landing page and the About page. */
export function DeveloperCard({ compact, branding }: { compact?: boolean; branding?: { developerName?: string; developerTitle?: string; developerInstitute?: string } }) {
  return (
    <div className="pg-surface relative rounded-3xl border border-teal-500/40 bg-slate-900/98 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.85),0_0_30px_-5px_rgba(20,184,166,0.25)] overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-teal-400/60 hover:shadow-[0_18px_55px_-10px_rgba(0,0,0,0.95),0_0_40px_0px_rgba(20,184,166,0.35)]">
      {/* Background Ambient Glow inside Card */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl opacity-70" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-52 h-52 bg-emerald-500/15 rounded-full blur-2xl" />

      <div className="pg-hero-bg relative px-6 py-8 text-white border-b border-slate-700/80">
        <div className="pg-grid-lines absolute inset-0 opacity-40" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 z-10">
          <div
            className="pg-ring-orbit grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl font-black text-amber-300 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7)] backdrop-blur border border-white/30"
            style={{ ["--ring" as string]: "#f0b429" }}
          >
            JR
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/25 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-teal-200 border border-teal-300/40 shadow-[0_0_15px_-2px_rgba(45,212,191,0.4)]">
              ⚡ কারিগরি প্রতিষ্ঠাতা ও বিকাশকারী
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {branding?.developerName || AUTHOR.name}
            </h3>
            <p className="text-sm sm:text-base font-black text-teal-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {branding?.developerTitle || AUTHOR.title}
            </p>
            <p className="text-xs sm:text-sm text-slate-100 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              🏛️ {branding?.developerInstitute || AUTHOR.institute}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 bg-slate-900/98 relative z-10 space-y-5">
        <div className="grid gap-3.5 sm:grid-cols-3">
          {AUTHOR.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer me"
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-700/90 bg-slate-800/95 p-4 text-sm transition-all duration-200 hover:border-teal-400/90 hover:bg-slate-800 hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.35)] hover:-translate-y-0.5"
              style={{ ["--ring" as string]: l.ring }}
            >
              <span
                className="pg-social grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-700/90 text-white transition duration-200 group-hover:scale-110 group-hover:bg-teal-500/25 shadow-md"
                style={{ ["--ring" as string]: l.ring }}
              >
                <BrandIcon name={l.key} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block font-black text-white group-hover:text-teal-200 text-sm leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {l.label}
                </span>
                <span className="block truncate text-xs font-black text-amber-300 mt-0.5">
                  {l.handle}
                </span>
              </span>
            </a>
          ))}
        </div>

        {!compact ? (
          <div className="rounded-2xl border border-slate-700/90 bg-slate-950/95 p-4.5 text-xs sm:text-sm font-semibold leading-relaxed text-slate-100 shadow-inner">
            <span className="font-black text-teal-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">পিজিটিএসসি কুইজ অ্যারেনা</span> — কারিগরি ও সাধারণ শিক্ষার জন্য একটি আধুনিক এআই-চালিত ইন্টারেক্টিভ লার্নিং ও এসেসমেন্ট প্ল্যাটফর্ম। যেকোনো ডিজিটাল ক্লাসরুম বা শিক্ষাপ্রতিষ্ঠান এটি ব্যবহার করে রিয়েল-টাইম লাইভ কুইজ ও তথ্যবহুল শিক্ষার পরিবেশ গড়ে তুলতে পারবে।
          </div>
        ) : null}
      </div>
    </div>
  );
}
