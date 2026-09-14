"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Drawer, cx } from "./ui";
import { useI18n } from "@/lib/i18n";
import { CreditLine } from "./credit";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

export type ShellUser = {
  id: number;
  name: string;
  role: string;
  xp: number;
  level: string;
  locale?: string;
} | null;

const NAV: Record<string, { href: string; label: string; labelEn: string; icon: string }[]> = {
  teacher: [
    { href: "/teacher", label: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
    { href: "/teacher/quizzes?new=1", label: "➕ নতুন কুইজ তৈরি", labelEn: "+ Create Quiz", icon: "➕" },
    { href: "/teacher/quizzes", label: "কুইজ তালিকা ও স্টুডিও", labelEn: "Quiz Studio", icon: "📝" },
    { href: "/admin/pdf-library", label: "📚 স্থায়ী PDF লাইব্রেরি", labelEn: "PDF Library", icon: "📚" },
    { href: "/teacher/live", label: "লাইভ কুইজ সেশন", labelEn: "Live Sessions", icon: "📡" },
    { href: "/teacher/ai", label: "এআই জেনারেটর", labelEn: "AI Generator", icon: "✨" },
    { href: "/teacher/bank", label: "প্রশ্ন ব্যাংক", labelEn: "Question Bank", icon: "🗃️" },
    { href: "/teacher/templates", label: "টেমপ্লেট স্টুডিও", labelEn: "Templates", icon: "🎨" },
    { href: "/teacher/slides", label: "প্রেজেন্টেশন", labelEn: "Presentations", icon: "🎞️" },
    { href: "/teacher/analytics", label: "অ্যানালিটিক্স ও রিপোর্ট", labelEn: "Analytics", icon: "📈" },
    { href: "/teacher/tournaments", label: "টুর্নামেন্ট ও পাথ", labelEn: "Tournaments", icon: "🏆" },
    { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
    { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
    { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
  ],
  student: [
    { href: "/student", label: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
    { href: "/join", label: "🎮 লাইভ কুইজে যোগ দিন", labelEn: "Join Live Quiz", icon: "🎮" },
    { href: "/student/quizzes", label: "কুইজ ও পরীক্ষা", labelEn: "Quizzes", icon: "📝" },
    { href: "/student/practice", label: "অনুশীলন", labelEn: "Practice", icon: "🎯" },
    { href: "/student/results", label: "ফলাফল", labelEn: "Results", icon: "📊" },
    { href: "/student/achievements", label: "অর্জন", labelEn: "Achievements", icon: "🏅" },
    { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
    { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
    { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
  ],
  parent: [
    { href: "/parent", label: "সন্তানের অগ্রগতি", labelEn: "Child Progress", icon: "👨‍👩‍👧" },
    { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
    { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
    { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
  ],
  admin: [
    { href: "/admin", label: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
    { href: "/teacher/quizzes?new=1", label: "➕ নতুন কুইজ তৈরি", labelEn: "+ Create Quiz", icon: "➕" },
    { href: "/teacher/quizzes", label: "কুইজ স্টুডিও", labelEn: "Quiz Studio", icon: "📝" },
    { href: "/admin/pdf-library", label: "📚 স্থায়ী PDF লাইব্রেরি", labelEn: "PDF Library", icon: "📚" },
    { href: "/admin/frontend-control", label: "🎛️ ফ্রন্টএন্ড কন্ট্রোল", labelEn: "Frontend Control", icon: "🎛️" },
    { href: "/teacher/live", label: "লাইভ কুইজ সেশন", labelEn: "Live Sessions", icon: "📡" },
    { href: "/admin/structure", label: "একাডেমিক কাঠামো", labelEn: "Structure", icon: "🏫" },
    { href: "/admin/users", label: "ইউজার ম্যানেজমেন্ট", labelEn: "Users", icon: "👥" },
    { href: "/admin/settings", label: "ব্র্যান্ডিং ও সেটিংস", labelEn: "Global Settings", icon: "🎨" },
    { href: "/admin/gallery", label: "গ্যালারি ও স্মৃতি", labelEn: "Gallery & Memories", icon: "📸" },
    { href: "/admin/reviews", label: "রিভিউ মডারেশন", labelEn: "Review Moderation", icon: "⭐" },
    { href: "/admin/ai", label: "এআই কী", labelEn: "AI Keys", icon: "🔑" },
    { href: "/admin/audit", label: "অডিট লগ", labelEn: "Audit Log", icon: "🧾" },
    { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
    { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
    { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
  ],
};

export function AppShell({
  user,
  children,
  branding,
}: {
  user: ShellUser;
  children: React.ReactNode;
  branding?: { schoolName?: string; schoolNameEn?: string; contact?: string; email?: string; developerName?: string; developerTitle?: string; developerInstitute?: string; copyright?: string; footer?: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, motion, setMotion, highContrast, setHighContrast, t } = useI18n();
  const brandName = branding?.schoolName || t("app_name");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ id: number; title: string; body: string | null; read: boolean; link: string | null }[]>([]);

  const roleKey = user?.role === "super_admin" ? "admin" : (user?.role ?? "student");
  const nav = NAV[roleKey] ?? NAV.student;

  // Adopt the account's saved language the first time this browser is used.
  useEffect(() => {
    if (!user?.locale) return;
    if (localStorage.getItem("pg_locale")) return;
    if (user.locale === "bn" || user.locale === "en") setLocale(user.locale);
  }, [user?.locale, setLocale]);

  const loadNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setNotifs(data);
      }
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setNotifs(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const logout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.push("/");
    router.refresh();
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[var(--pg-mist)]">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-sm shadow-indigo-950/[.03] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:px-5">
          <button
            className="rounded-lg p-2 text-xl lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--pg-teal)] to-[#8b5cf6] text-sm font-black text-white shadow-lg shadow-indigo-500/25">
              PG
            </span>
            <span className="hidden text-sm font-extrabold sm:block">{brandName}</span>
          </Link>
          <div className="flex-1" />
          {user && (roleKey === "teacher" || roleKey === "admin") ? (
            <Link
              href="/teacher/quizzes?new=1"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-teal-700/20 transition hover:-translate-y-0.5 hover:shadow-teal-700/30 active:scale-95 cursor-pointer"
              id="header-create-quiz-btn"
            >
              <span>➕</span>
              <span>কুইজ তৈরি</span>
            </Link>
          ) : null}
          {user ? <CommandPalette role={user.role} /> : null}
          <ThemeToggle />
          <button
            onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
            className="rounded-lg border border-[var(--pg-line)] px-2.5 py-1.5 text-xs font-bold cursor-pointer"
          >
            {locale === "bn" ? "EN" : "বাং"}
          </button>
          {user ? (
            <>
              <button
                onClick={() => {
                  setNotifOpen(true);
                  loadNotifs();
                }}
                className="relative rounded-lg p-2 text-lg cursor-pointer"
                aria-label="Notifications"
              >
                🔔
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--pg-coral)] px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                ) : null}
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold leading-tight">{user.name}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60">
                    {user.role}
                  </span>
                </div>
              </div>
              <Link
                href="/settings"
                className="rounded-lg p-2 text-lg transition hover:bg-slate-100 cursor-pointer"
                aria-label={t("settings")}
                title={t("settings")}
              >
                ⚙️
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="cursor-pointer">
                {t("logout")}
              </Button>
            </>
          ) : (
            <Link href="/" className="cursor-pointer">
              <Button size="sm">{t("get_started")}</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-white/70 bg-white/65 p-3 backdrop-blur-xl lg:block pg-scroll">
          {/* Quick Primary Actions */}
          {roleKey === "teacher" || roleKey === "admin" ? (
            <div className="mb-3 space-y-1.5">
              <Link
                href="/teacher/quizzes?new=1"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-700/20 transition duration-150 hover:-translate-y-0.5 hover:shadow-teal-700/35 active:scale-98 cursor-pointer"
                id="sidebar-create-quiz-btn"
              >
                <span className="text-base">➕</span>
                <span>নতুন কুইজ তৈরি</span>
              </Link>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <Link
                  href="/teacher/ai"
                  className="flex items-center justify-center gap-1 rounded-lg border border-indigo-200/80 bg-indigo-50/80 px-2 py-1.5 font-bold text-indigo-900 transition hover:bg-indigo-100 hover:text-indigo-950 cursor-pointer"
                >
                  <span>✨</span>
                  <span>এআই কুইজ</span>
                </Link>
                <Link
                  href="/teacher/live"
                  className="flex items-center justify-center gap-1 rounded-lg border border-teal-200/80 bg-teal-50/80 px-2 py-1.5 font-bold text-teal-900 transition hover:bg-teal-100 hover:text-teal-950 cursor-pointer"
                >
                  <span>📡</span>
                  <span>লাইভ হোস্ট</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <Link
                href="/join"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition duration-150 hover:-translate-y-0.5 hover:shadow-orange-500/35 active:scale-98 cursor-pointer"
              >
                <span className="text-base">🎮</span>
                <span>পিন দিয়ে কুইজে যোগ দিন</span>
              </Link>
            </div>
          )}

          <NavList nav={nav} pathname={pathname} locale={locale} />
          <AccessibilityPanel
            motion={motion}
            setMotion={setMotion}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
          />
          <div className="mt-4 px-1">
            <CreditLine tone="light" branding={branding} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-5">{children}</main>
      </div>
      <footer className="border-t border-white/70 bg-white/70 px-4 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">{brandName}</p>
            <p>{branding?.contact || ""}{branding?.email ? ` | ${branding.email}` : ""}</p>
          </div>
          <div className="text-right">
            <p>{branding?.footer || `ডেভেলপার — ${branding?.developerName || ""}`}</p>
            <p className="text-[11px]">{branding?.copyright || "© পিজিটিএসসি কুইজ অ্যারেনা"}</p>
          </div>
        </div>
      </footer>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t("app_name")}>
        <div onClick={() => setMenuOpen(false)} className="space-y-3">
          {roleKey === "teacher" || roleKey === "admin" ? (
            <div className="mb-2 space-y-1.5">
              <Link
                href="/teacher/quizzes?new=1"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/20 active:scale-98 cursor-pointer"
              >
                <span className="text-base">➕</span>
                <span>নতুন কুইজ তৈরি করুন</span>
              </Link>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <Link
                  href="/teacher/ai"
                  className="flex items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 font-bold text-indigo-900 cursor-pointer"
                >
                  <span>✨</span>
                  <span>এআই কুইজ</span>
                </Link>
                <Link
                  href="/teacher/live"
                  className="flex items-center justify-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1.5 font-bold text-teal-900 cursor-pointer"
                >
                  <span>📡</span>
                  <span>লাইভ হোস্ট</span>
                </Link>
              </div>
            </div>
          ) : null}
          <NavList nav={nav} pathname={pathname} locale={locale} />
        </div>
        <AccessibilityPanel
          motion={motion}
          setMotion={setMotion}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
      </Drawer>

      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="নোটিফিকেশন">
        {notifs.length === 0 ? (
          <p className="text-sm text-slate-500">কোনো নোটিফিকেশন নেই।</p>
        ) : (
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await fetch("/api/notifications", { method: "POST" });
                loadNotifs();
              }}
            >
              সব পঠিত হিসেবে চিহ্নিত করুন
            </Button>
            {notifs.map((n) => (
              <div
                key={n.id}
                className={cx(
                  "rounded-xl border p-3",
                  n.read ? "border-[var(--pg-line)] bg-white" : "border-teal-200 bg-teal-50",
                )}
              >
                <p className="text-sm font-semibold">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-xs text-slate-600">{n.body}</p> : null}
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => setNotifOpen(false)}
                    className="mt-1 inline-block text-xs font-bold text-[var(--pg-teal)]"
                  >
                    দেখুন →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

function NavList({
  nav,
  pathname,
  locale,
}: {
  nav: { href: string; label: string; labelEn: string; icon: string }[];
  pathname: string;
  locale: string;
}) {
  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const baseHref = item.href.split("?")[0];
        const isExact = pathname === baseHref;
        const isSub =
          baseHref !== "/teacher" &&
          baseHref !== "/student" &&
          baseHref !== "/admin" &&
          pathname.startsWith(baseHref + "/");
        const active = isExact || isSub;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition min-h-[44px] cursor-pointer select-none",
              active
                ? "bg-gradient-to-r from-[var(--pg-teal)] to-[#7778ec] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-700 hover:bg-teal-50 hover:text-teal-900 active:scale-98",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base transition-transform group-hover:scale-110">{item.icon}</span>
              <span>{locale === "bn" ? item.label : item.labelEn}</span>
            </div>
            {active ? (
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            ) : (
              <span className="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5">
                →
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AccessibilityPanel({
  motion,
  setMotion,
  highContrast,
  setHighContrast,
}: {
  motion: string;
  setMotion: (m: "low" | "medium" | "high") => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--pg-line)] p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        অ্যাক্সেসিবিলিটি
      </p>
      <div className="flex gap-1">
        {(["low", "medium", "high"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMotion(m)}
            className={cx(
              "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold",
              motion === m ? "bg-[var(--pg-teal)] text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            {m === "low" ? "কম" : m === "medium" ? "মাঝারি" : "বেশি"}
          </button>
        ))}
      </div>
      <button
        onClick={() => setHighContrast(!highContrast)}
        className="mt-2 w-full rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-600"
      >
        {highContrast ? "✓ " : ""}হাই কনট্রাস্ট
      </button>
      <Badge tone="teal" className="mt-2">মোশন: {motion}</Badge>
    </div>
  );
}
