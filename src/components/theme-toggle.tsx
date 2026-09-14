"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("pg_theme");
    const value = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(value); document.documentElement.classList.toggle("dark", value);
  }, []);
  const toggle = () => {
    const next = !dark; setDark(next); localStorage.setItem("pg_theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next);
  };
  return <button type="button" onClick={toggle} className="rounded-xl border border-[var(--pg-line)] bg-white/80 px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5" aria-label="থিম পরিবর্তন">{dark ? "☀️" : "🌙"}</button>;
}
