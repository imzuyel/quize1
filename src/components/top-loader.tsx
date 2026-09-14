"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete on route/pathname changes
  useEffect(() => {
    setProgress(100);
    const hideTimer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 280);
    return () => clearTimeout(hideTimer);
  }, [pathname, searchParams]);

  // Listeners for link clicks, form submissions, and manual triggers
  useEffect(() => {
    const startProgress = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(true);
      setProgress((prev) => (prev > 0 ? prev : 28));

      // Auto-dismiss safeguard: if no page transition happens within 6 seconds, resolve smoothly
      timerRef.current = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 300);
      }, 6000);
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");
      const isDownload = target.hasAttribute("download");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        targetAttr === "_blank" ||
        isDownload ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          if (url.pathname === window.location.pathname && url.search === window.location.search && !url.hash) {
            return;
          }
          startProgress();
        }
      } catch {
        // invalid URL format, ignore
      }
    };

    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;
      // Start global progress bar on form submission
      startProgress();
    };

    const handleCustomStart = () => startProgress();

    const handleCustomEnd = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    document.addEventListener("submit", handleFormSubmit, { capture: true });
    window.addEventListener("app-loading-start", handleCustomStart);
    window.addEventListener("app-loading-end", handleCustomEnd);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      document.removeEventListener("submit", handleFormSubmit, { capture: true });
      window.removeEventListener("app-loading-start", handleCustomStart);
      window.removeEventListener("app-loading-end", handleCustomEnd);
    };
  }, []);

  // Multi-step realistic progress advancement while loading
  useEffect(() => {
    if (!loading) return;
    const t1 = setTimeout(() => setProgress((p) => (p < 55 ? 55 : p)), 120);
    const t2 = setTimeout(() => setProgress((p) => (p < 75 ? 75 : p)), 350);
    const t3 = setTimeout(() => setProgress((p) => (p < 88 ? 88 : p)), 750);
    const t4 = setTimeout(() => setProgress((p) => (p < 94 ? 94 : p)), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none select-none transition-opacity duration-200"
      style={{ opacity: loading ? 1 : 0 }}
    >
      {/* Top radiant glowing line */}
      <div className="relative h-[3.5px] w-full overflow-hidden bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 via-cyan-400 to-indigo-500 shadow-[0_0_14px_rgba(45,212,191,0.95)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Shimmer light tip */}
        {loading && progress < 100 ? (
          <div
            className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px] -translate-x-full animate-[shimmer_1s_infinite]"
            style={{ left: `${progress}%` }}
          />
        ) : null}
      </div>

      {/* Floating status pill */}
      <div className="fixed top-2.5 right-4 z-[999999] flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md border border-teal-500/40">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
        </span>
        <svg
          className="h-3 w-3 animate-spin text-teal-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>লোড হচ্ছে...</span>
      </div>
    </div>
  );
}

export function triggerAppLoading(start = true) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(start ? "app-loading-start" : "app-loading-end"));
  }
}

