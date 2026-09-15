"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, cx } from "./ui";
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

export type NavItem = {
  href: string;
  label: string;
  labelEn: string;
  icon: string;
  badge?: string;
  badgeTone?: "teal" | "amber" | "indigo" | "rose" | "emerald";
};

export type NavGroup = {
  title: string;
  titleEn: string;
  items: NavItem[];
};

const NAV_GROUPS: Record<string, NavGroup[]> = {
  teacher: [
    {
      title: "কুইজ ও স্টুডিও",
      titleEn: "Quiz & Studio",
      items: [
        { href: "/teacher", label: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
        { href: "/teacher/quizzes", label: "কুইজ তালিকা ও স্টুডিও", labelEn: "Quiz Studio", icon: "📝", badge: "Core", badgeTone: "teal" },
        { href: "/teacher/ai", label: "এআই কুইজ জেনারেটর", labelEn: "AI Generator", icon: "✨", badge: "AI ⚡", badgeTone: "indigo" },
        { href: "/teacher/live", label: "লাইভ কুইজ সেশন", labelEn: "Live Sessions", icon: "📡", badge: "Live", badgeTone: "rose" },
        { href: "/admin/pdf-library", label: "স্থায়ী PDF লাইব্রেরি", labelEn: "PDF Library", icon: "📚", badge: "PDF", badgeTone: "teal" },
      ],
    },
    {
      title: "রিসোর্স ও কনটেন্ট",
      titleEn: "Resources & Content",
      items: [
        { href: "/teacher/bank", label: "প্রশ্ন ব্যাংক", labelEn: "Question Bank", icon: "🗃️" },
        { href: "/teacher/slides", label: "প্রেজেন্টেশন ও স্লাইডস", labelEn: "Presentations", icon: "🎞️" },
        { href: "/teacher/templates", label: "টেমপ্লেট স্টুডিও", labelEn: "Templates", icon: "🎨" },
      ],
    },
    {
      title: "পারফরম্যান্স ও লিডারবোর্ড",
      titleEn: "Performance & Ranking",
      items: [
        { href: "/teacher/analytics", label: "অ্যানালিটিক্স ও রিপোর্ট", labelEn: "Analytics & Reports", icon: "📈" },
        { href: "/teacher/tournaments", label: "টুর্নামেন্ট ও লার্নিং পাথ", labelEn: "Tournaments", icon: "🏆" },
        { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
      ],
    },
    {
      title: "সিস্টেম ও সাধারণ",
      titleEn: "System & General",
      items: [
        { href: "/settings", label: "সেটিংস ও প্রোফাইল", labelEn: "Settings", icon: "⚙️" },
        { href: "/about", label: "সিস্টেম পরিচিতি", labelEn: "About", icon: "ℹ️" },
      ],
    },
  ],
  admin: [
    {
      title: "মূল নিয়ন্ত্রণ",
      titleEn: "Overview",
      items: [
        { href: "/admin", label: "অ্যাডমিন ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
      ],
    },
    {
      title: "কুইজ ও কনটেন্ট স্টুডিও",
      titleEn: "Quiz & Content",
      items: [
        { href: "/teacher/quizzes", label: "কুইজ স্টুডিও", labelEn: "Quiz Studio", icon: "📝" },
        { href: "/teacher/ai", label: "এআই কুইজ জেনারেটর", labelEn: "AI Generator", icon: "✨", badge: "AI ⚡", badgeTone: "indigo" },
        { href: "/teacher/live", label: "লাইভ কুইজ সেশন", labelEn: "Live Sessions", icon: "📡", badge: "Live", badgeTone: "rose" },
        { href: "/admin/pdf-library", label: "স্থায়ী PDF লাইব্রেরি", labelEn: "PDF Library", icon: "📚", badge: "PDF", badgeTone: "teal" },
      ],
    },
    {
      title: "সিস্টেম ম্যানেজমেন্ট",
      titleEn: "System Administration",
      items: [
        { href: "/admin/frontend-control", label: "ফ্রন্টএন্ড কন্ট্রোল", labelEn: "Frontend Control", icon: "🎛️", badge: "UI", badgeTone: "amber" },
        { href: "/admin/structure", label: "একাডেমিক কাঠামো", labelEn: "Academic Structure", icon: "🏫" },
        { href: "/admin/users", label: "ইউজার ম্যানেজমেন্ট", labelEn: "User Management", icon: "👥" },
        { href: "/admin/ai", label: "এআই কী ও মডেল", labelEn: "AI Configuration", icon: "🔑", badge: "API", badgeTone: "emerald" },
        { href: "/admin/gallery", label: "গ্যালারি ও স্মৃতি", labelEn: "Gallery & Memories", icon: "📸" },
        { href: "/admin/reviews", label: "রিভিউ মডারেশন", labelEn: "Review Moderation", icon: "⭐" },
        { href: "/admin/audit", label: "অডিট লগ", labelEn: "Audit Log", icon: "🧾" },
        { href: "/admin/settings", label: "ব্র্যান্ডিং ও সেটিংস", labelEn: "Global Settings", icon: "🎨" },
      ],
    },
    {
      title: "সাধারণ",
      titleEn: "General",
      items: [
        { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
        { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
        { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
      ],
    },
  ],
  student: [
    {
      title: "লার্নিং ও এক্সাম",
      titleEn: "Learning & Play",
      items: [
        { href: "/student", label: "ড্যাশবোর্ড", labelEn: "Dashboard", icon: "🏠" },
        { href: "/join", label: "লাইভ কুইজে যোগ দিন", labelEn: "Join Live Quiz", icon: "🎮", badge: "PIN ⚡", badgeTone: "amber" },
        { href: "/student/quizzes", label: "কুইজ ও পরীক্ষা", labelEn: "Assigned Quizzes", icon: "📝" },
        { href: "/student/practice", label: "সলো অনুশীলন", labelEn: "Solo Practice", icon: "🎯" },
      ],
    },
    {
      title: "অগ্রগতি ও অর্জন",
      titleEn: "Progress & Rewards",
      items: [
        { href: "/student/results", label: "ফলাফল ও পারফরম্যান্স", labelEn: "Results", icon: "📊" },
        { href: "/student/achievements", label: "অর্জন ও ব্যাজ", labelEn: "Achievements", icon: "🏅", badge: "XP", badgeTone: "teal" },
        { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
      ],
    },
    {
      title: "সেটিংস",
      titleEn: "Settings",
      items: [
        { href: "/settings", label: "প্রোফাইল ও সেটিংস", labelEn: "Settings", icon: "⚙️" },
        { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
      ],
    },
  ],
  parent: [
    {
      title: "অভিভাবক পোর্টাল",
      titleEn: "Parent Portal",
      items: [
        { href: "/parent", label: "সন্তানের অগ্রগতি", labelEn: "Child Progress", icon: "👨‍👩‍👧" },
        { href: "/leaderboard", label: "লিডারবোর্ড", labelEn: "Leaderboard", icon: "🥇" },
        { href: "/settings", label: "সেটিংস", labelEn: "Settings", icon: "⚙️" },
        { href: "/about", label: "সম্পর্কে", labelEn: "About", icon: "ℹ️" },
      ],
    },
  ],
};

function getRoleBengali(role: string): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "অ্যাডমিন";
    case "teacher":
      return "শিক্ষক";
    case "student":
      return "শিক্ষার্থী";
    case "parent":
      return "অভিভাবক";
    default:
      return role;
  }
}

export function AppShell({
  user,
  children,
  branding,
}: {
  user: ShellUser;
  children: React.ReactNode;
  branding?: {
    schoolName?: string;
    schoolNameEn?: string;
    contact?: string;
    email?: string;
    developerName?: string;
    developerTitle?: string;
    developerInstitute?: string;
    copyright?: string;
    footer?: string;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, motion, setMotion, highContrast, setHighContrast, t } = useI18n();
  const brandName = branding?.schoolName || t("app_name");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ id: number; title: string; body: string | null; read: boolean; link: string | null }[]>([]);

  const roleKey = user?.role === "super_admin" ? "admin" : (user?.role ?? "student");
  const navGroups = NAV_GROUPS[roleKey] ?? NAV_GROUPS.student;

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
    <div className="min-h-screen bg-slate-50/70 dark:bg-transparent text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 sm:px-5">
          <button
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 text-lg lg:hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-indigo-600 text-sm font-black text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
              PG
            </span>
            <div className="hidden sm:block leading-tight max-w-[150px] md:max-w-[240px] lg:max-w-none">
              <span className="block text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">{brandName}</span>
              <span className="block text-[10px] font-bold text-teal-600 dark:text-teal-400 truncate">স্মার্ট কুইজ অ্যারেনা</span>
            </div>
          </Link>
          <div className="flex-1" />
          {user && (roleKey === "teacher" || roleKey === "admin") ? (
            <Link
              href="/teacher/quizzes?new=1"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-teal-700/20 transition hover:-translate-y-0.5 hover:shadow-teal-700/30 active:scale-95 cursor-pointer"
              id="header-create-quiz-btn"
            >
              <span>➕</span>
              <span>নতুন কুইজ</span>
            </Link>
          ) : null}
          {user ? <CommandPalette role={user.role} /> : null}
          <ThemeToggle />
          <button
            onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
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
                className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                aria-label="Notifications"
              >
                🔔
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm">
                    {unread}
                  </span>
                ) : null}
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black leading-tight text-slate-900 dark:text-white">{user.name}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-md border border-teal-200/80 dark:border-teal-800">
                    {getRoleBengali(user.role)}
                  </span>
                </div>
              </div>
              <Link
                href="/settings"
                className="hidden sm:inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 text-base transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                aria-label={t("settings")}
                title={t("settings")}
              >
                ⚙️
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="hidden sm:inline-flex rounded-xl font-bold cursor-pointer">
                {t("logout")}
              </Button>
            </>
          ) : (
            <Link href="/" className="cursor-pointer">
              <Button size="sm" className="rounded-xl font-black">{t("get_started")}</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="mx-auto flex max-w-[1440px]">
        {/* Premium Desktop Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/80 p-3.5 backdrop-blur-2xl lg:flex pg-scroll">
          <div className="space-y-4">
            {/* User Mini Profile Header */}
            {user ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-850 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-sm font-black text-white shadow-md shadow-teal-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-xs animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-900 dark:text-white">{user.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center rounded-md bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-black text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {getRoleBengali(user.role)}
                      </span>
                      {user.xp ? (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          ⭐ {user.xp} XP
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quick Primary Actions */}
            {roleKey === "teacher" || roleKey === "admin" ? (
              <div className="space-y-2">
                <Link
                  href="/teacher/quizzes?new=1"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-3 text-sm font-black text-white shadow-lg shadow-teal-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-teal-600/35 active:scale-98 cursor-pointer"
                  id="sidebar-create-quiz-btn"
                >
                  <span className="text-base transition-transform group-hover:scale-125">➕</span>
                  <span>নতুন কুইজ তৈরি</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/teacher/ai"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 p-2 font-black text-indigo-900 dark:text-indigo-200 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs cursor-pointer"
                  >
                    <span>✨</span>
                    <span>এআই কুইজ</span>
                  </Link>
                  <Link
                    href="/teacher/live"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-200/90 dark:border-teal-800/80 bg-teal-50/80 dark:bg-teal-950/40 p-2 font-black text-teal-900 dark:text-teal-200 transition hover:bg-teal-100 dark:hover:bg-teal-900/60 shadow-xs cursor-pointer"
                  >
                    <span>📡</span>
                    <span>লাইভ হোস্ট</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <Link
                  href="/join"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-orange-500/35 active:scale-98 cursor-pointer"
                >
                  <span className="text-base transition-transform group-hover:scale-125">🎮</span>
                  <span>পিন দিয়ে কুইজে যোগ দিন</span>
                </Link>
              </div>
            )}

            {/* Nav Groups */}
            <GroupedNavList groups={navGroups} pathname={pathname} locale={locale} />
          </div>

          {/* Sidebar Footer Area */}
          <div className="mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <AccessibilityPanel
              motion={motion}
              setMotion={setMotion}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
            />
            {user && (
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
              >
                <span>🚪</span>
                <span>{t("logout")}</span>
              </button>
            )}
            <div className="px-1">
              <CreditLine tone="dark" branding={branding} />
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 px-4 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="font-extrabold text-slate-800 dark:text-slate-200">{brandName}</p>
            <p>{branding?.contact || ""}{branding?.email ? ` | ${branding.email}` : ""}</p>
          </div>
          <div className="text-right">
            <p>{branding?.footer || `ডেভেলপার — ${branding?.developerName || ""}`}</p>
            <p className="text-[11px]">{branding?.copyright || "© পঞ্চগড় সরকারি টেকনিক্যাল স্কুল এন্ড কলেজ (PGTSC)"}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Drawer */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t("app_name")}>
        <div onClick={() => setMenuOpen(false)} className="space-y-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 font-black text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-sm text-slate-900 dark:text-white">{user.name}</p>
                <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  {getRoleBengali(user.role)}
                </span>
              </div>
            </div>
          ) : null}

          {roleKey === "teacher" || roleKey === "admin" ? (
            <div className="space-y-2">
              <Link
                href="/teacher/quizzes?new=1"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-3 text-sm font-black text-white shadow-md active:scale-98 cursor-pointer"
              >
                <span>➕</span>
                <span>নতুন কুইজ তৈরি করুন</span>
              </Link>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/teacher/ai"
                  className="flex items-center justify-center gap-1 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 p-2 font-black text-indigo-900 dark:text-indigo-200 cursor-pointer"
                >
                  <span>✨</span>
                  <span>এআই কুইজ</span>
                </Link>
                <Link
                  href="/teacher/live"
                  className="flex items-center justify-center gap-1 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 p-2 font-black text-teal-900 dark:text-teal-200 cursor-pointer"
                >
                  <span>📡</span>
                  <span>লাইভ হোস্ট</span>
                </Link>
              </div>
            </div>
          ) : null}

          <GroupedNavList groups={navGroups} pathname={pathname} locale={locale} />
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
          <AccessibilityPanel
            motion={motion}
            setMotion={setMotion}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
          />
          {user && (
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
            >
              <span>🚪</span>
              <span>{t("logout")}</span>
            </button>
          )}
        </div>
      </Drawer>

      {/* Notification Drawer */}
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
              className="rounded-xl font-bold"
            >
              সব পঠিত হিসেবে চিহ্নিত করুন
            </Button>
            {notifs.map((n) => (
              <div
                key={n.id}
                className={cx(
                  "rounded-2xl border p-3.5 transition",
                  n.read
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80"
                    : "border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-950/40 shadow-xs",
                )}
              >
                <p className="text-sm font-black text-slate-900 dark:text-white">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">{n.body}</p> : null}
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => setNotifOpen(false)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-black text-teal-600 dark:text-teal-400 hover:underline"
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

function GroupedNavList({
  groups,
  pathname,
  locale,
}: {
  groups: NavGroup[];
  pathname: string;
  locale: string;
}) {
  return (
    <nav className="space-y-4">
      {groups.map((group, gIdx) => (
        <div key={group.title} className="space-y-1">
          <div className="px-2.5 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {locale === "bn" ? group.title : group.titleEn}
            </span>
            {gIdx === 0 ? <span className="h-1 w-1 rounded-full bg-teal-500 animate-pulse" /> : null}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
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
                    "group relative flex items-center justify-between gap-2.5 rounded-2xl px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-150 min-h-[42px] cursor-pointer select-none",
                    active
                      ? "bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 text-white shadow-md shadow-teal-600/20 font-black"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white active:scale-98",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm transition-all duration-150 shadow-xs",
                        active
                          ? "bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-inner"
                          : "border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 group-hover:scale-105 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/50 group-hover:text-teal-700 dark:group-hover:text-teal-300",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{locale === "bn" ? item.label : item.labelEn}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge ? (
                      <span
                        className={cx(
                          "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all",
                          active
                            ? "bg-white/25 text-white border border-white/30"
                            : item.badgeTone === "rose"
                            ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                            : item.badgeTone === "indigo"
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                            : item.badgeTone === "amber"
                            ? "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                            : "border border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}

                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5">
                        →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-2.5 shadow-xs">
      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
        অ্যাক্সেসিবিলিটি কন্ট্রোল
      </p>
      <div className="grid grid-cols-3 gap-1">
        {(["low", "medium", "high"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMotion(m)}
            className={cx(
              "rounded-xl py-1 text-[11px] font-black transition cursor-pointer",
              motion === m
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-slate-700",
            )}
          >
            {m === "low" ? "কম" : m === "medium" ? "মাঝারি" : "বেশি"}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setHighContrast(!highContrast)}
          className={cx(
            "flex-1 rounded-xl py-1 px-2 text-[11px] font-black transition cursor-pointer border",
            highContrast
              ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
              : "bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100",
          )}
        >
          {highContrast ? "✓ হাই কনট্রাস্ট" : "হাই কনট্রাস্ট"}
        </button>
      </div>
    </div>
  );
}
