"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* --------------------------------- Button -------------------------------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  block?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  isLoading,
  icon,
  block,
  className,
  children,
  disabled,
  ...rest
}: BtnProps) {
  const isSpinning = Boolean(loading || isLoading);
  
  const base =
    "inline-flex items-center justify-center gap-2 font-black rounded-2xl transition-all duration-300 active:scale-[0.95] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 whitespace-nowrap";
  
  const sizes = {
    sm: "text-xs px-3.5 py-2 min-h-[38px] tracking-wide",
    md: "text-sm px-5 py-2.5 min-h-[44px] tracking-wide",
    lg: "text-base px-7 py-3.5 min-h-[52px] tracking-wider",
  }[size];
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--pg-teal)] to-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]",
    secondary: "bg-[var(--pg-deep)] text-white shadow-md shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_8px_25px_rgba(15,47,74,0.3)]",
    gold: "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-500/10 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_25px_rgba(240,180,41,0.4)] border border-amber-300/30",
    danger: "bg-gradient-to-r from-[var(--pg-coral)] to-rose-600 text-white shadow-md shadow-rose-500/10 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_25px_rgba(226,87,76,0.4)]",
    outline: "border-2 border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 shadow-xs hover:-translate-y-0.5 hover:border-[var(--pg-teal-soft)] hover:bg-white dark:hover:bg-slate-900 hover:shadow-[0_6px_20px_rgba(18,160,140,0.1)]",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all",
  }[variant];

  return (
    <button
      className={cx(base, sizes, variants, block && "w-full", className)}
      disabled={disabled || isSpinning}
      {...rest}
    >
      {isSpinning ? <Spinner size={16} /> : icon}
      <span>{children}</span>
    </button>
  );
}

/* --------------------------------- Card ---------------------------------- */
export function Card({
  children,
  className = "",
  padded = true,
  glow = true,
  accent,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  glow?: boolean;
  accent?: "teal" | "cyan" | "purple" | "blue" | "amber" | "gold" | "rose" | "emerald" | "violet" | "indigo";
}) {
  const accentClass = accent ? `glow-${accent}` : "";
  const hasCustomBg = className.includes("bg-") || className.includes("from-");
  const hasCustomText = className.includes("text-white") || className.includes("text-slate-100") || className.includes("text-slate-200");
  
  return (
    <div
      className={cx(
        "pg-surface pg-shadow relative overflow-hidden transition-all duration-300",
        !hasCustomBg && "bg-white/95 dark:bg-slate-900/90",
        !hasCustomText && "text-slate-900 dark:text-slate-100",
        glow && "pg-card-glow",
        accentClass,
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-slate-900/60">
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------- Inputs --------------------------------- */
export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide uppercase">
        {label} {required && <span className="text-[var(--pg-coral)] font-black">*</span>}
      </span>
      {children}
      {hint ? <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-normal mt-1">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border-2 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[var(--pg-teal-soft)] focus:ring-4 focus:ring-teal-500/10 min-h-[46px] shadow-xs";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "min-h-[100px] resize-y", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputCls, "pr-8 cursor-pointer appearance-none bg-[radial-gradient(circle_at_right_12px_center,currentColor_1.5px,transparent_1.5px)] bg-[length:12px_12px] bg-no-repeat", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label = "",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 px-4 py-3 text-left text-sm min-h-[46px] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
    >
      <span className="font-black text-slate-700 dark:text-slate-300">{label}</span>
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ease-in-out cursor-pointer",
          checked ? "bg-[var(--pg-teal)]" : "bg-slate-300 dark:bg-slate-700",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 ease-in-out shadow-md",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

/* -------------------------------- Badge ---------------------------------- */
export function Badge({
  children,
  tone = "slate",
  variant,
  className,
}: {
  children: ReactNode;
  tone?: "slate" | "teal" | "gold" | "coral" | "blue" | "green" | "success" | "danger" | "warning" | "info";
  variant?: "slate" | "teal" | "gold" | "coral" | "blue" | "green" | "success" | "danger" | "warning" | "info";
  className?: string;
}) {
  const chosen = variant || tone;
  const mappedTone =
    (
      {
        success: "green",
        danger: "coral",
        warning: "gold",
        info: "blue",
      } as const
    )[chosen as "success" | "danger" | "warning" | "info"] || chosen;

  const tones: Record<string, string> = {
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700",
    teal: "bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-850",
    gold: "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-850",
    coral: "bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200/80 dark:border-rose-850",
    blue: "bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border border-sky-200/80 dark:border-sky-850",
    green: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-850",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black tracking-wide uppercase",
        tones[mappedTone] || tones.slate,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Progress -------------------------------- */
export function Progress({ value, tone = "teal" }: { value: number; tone?: string }) {
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-800/80 p-[2px] border border-slate-100 dark:border-slate-900"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: tone === "gold" ? "var(--pg-gold)" : "var(--pg-teal)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      </div>
    </div>
  );
}

/* -------------------------------- Spinner -------------------------------- */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
      aria-label="loading"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("pg-skeleton rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800", className)} />;
}

export function EmptyState({
  icon = "🗂️",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-850 text-4xl shadow-inner animate-bounce duration-1000">
        {icon}
      </div>
      <div className="relative max-w-sm space-y-1.5">
        <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
        {description ? (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="relative pt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-5 text-sm text-rose-800 dark:text-rose-200 flex flex-col items-start gap-3">
      <p className="font-bold flex items-center gap-2">⚠️ {message}</p>
      {retry ? (
        <Button size="sm" variant="outline" onClick={retry}>
          আবার চেষ্টা করুন
        </Button>
      ) : null}
    </div>
  );
}

/* --------------------------------- Modal --------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-sm anim-fade">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cx(
          "max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-6 sm:rounded-3xl pg-scroll shadow-2xl border border-slate-100 dark:border-slate-800",
          wide ? "sm:max-w-4xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 id={id} className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-1.5 text-xl leading-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {children}
        </div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs" onClick={onClose}>
      <div
        className="anim-slide h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-900 p-6 pg-scroll shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition cursor-pointer" aria-label="Close">
            ×
          </button>
        </div>
        <div className="flex-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Tabs ---------------------------------- */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 dark:bg-slate-950/40 p-1 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shrink-0 hide-scrollbar" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cx(
              "whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-300 min-h-[40px] flex items-center gap-1.5 outline-none cursor-pointer",
              isActive
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-md shadow-slate-900/5 dark:shadow-none border border-slate-200/60 dark:border-slate-850 scale-100"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40 scale-98 active:scale-95"
            )}
          >
            {tab.icon ? <span className="text-sm shrink-0">{tab.icon}</span> : null}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Toasts --------------------------------- */
type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
const ToastCtx = createContext<{ push: (m: string, t?: Toast["tone"]) => void }>({
  push: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);
  
  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = ++counter.current;
    setItems((s) => [...s, { id, message, tone }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3800);
  }, []);
  
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[min(94vw,420px)] -translate-x-1/2 flex-col gap-2.5">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cx(
              "anim-fade pointer-events-auto rounded-2xl px-5 py-4 text-sm font-black text-white shadow-xl flex items-center gap-3 border transition-all duration-300",
              t.tone === "success"
                ? "bg-emerald-600 border-emerald-500 shadow-emerald-500/10"
                : t.tone === "error"
                  ? "bg-rose-600 border-rose-500 shadow-rose-500/10"
                  : "bg-slate-900 border-slate-800 shadow-slate-900/10",
            )}
          >
            <span>
              {t.tone === "success" ? "✅" : t.tone === "error" ? "❌" : "ℹ️"}
            </span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

/* --------------------------------- Table --------------------------------- */
export function Table({
  head,
  children,
}: {
  head: (string | ReactNode)[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 pg-scroll shadow-xs">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3.5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------- Stats --------------------------------- */
export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  tone?: "teal" | "gold" | "blue" | "coral";
}) {
  const glow = {
    teal: "glow-teal",
    gold: "glow-amber",
    blue: "glow-blue",
    coral: "glow-rose",
  }[tone];
  
  const iconBg = {
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    coral: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  }[tone];

  return (
    <div className={cx("pg-surface pg-shadow pg-card-glow relative overflow-hidden p-5 bg-white/95 dark:bg-slate-900/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300", glow)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-2.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        {icon ? (
          <span className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 hover:scale-110", iconBg)}>
            {icon}
          </span>
        ) : null}
      </div>
      {sub ? (
        <div className="mt-3.5 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{sub}</p>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------- Charts -------------------------------- */
export function BarChart({
  data,
  max,
}: {
  data: { label: string; value: number; color?: string }[];
  max?: number;
}) {
  const top = max ?? Math.max(100, ...data.map((d) => d.value));
  if (!data.length) return <EmptyState title="ডেটা নেই" icon="📊" />;
  
  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.label} className="group">
          <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="truncate pr-2 font-black group-hover:text-[var(--pg-teal-soft)] transition-colors">{d.label}</span>
            <span className="tabular-nums bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{Math.round(d.value)}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60 p-[2px] border border-slate-200/50 dark:border-slate-700/50">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-inner"
              style={{
                width: `${(d.value / top) * 105}%`,
                background: d.color ?? "linear-gradient(90deg, #12a08c, #0f7b6c)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ value, label }: { value: number; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`${label} ${value}%`}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-800" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--pg-teal)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset .8s ease" }}
          />
          <text x="60" y="66" textAnchor="middle" className="fill-slate-800 dark:fill-white text-xl font-extrabold tracking-tight">
            {Math.round(value)}%
          </text>
        </svg>
      </div>
      <p className="mt-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${40 - (p / max) * 36}`)
    .join(" ");
    
  return (
    <svg viewBox="0 0 100 40" className="h-12 w-full filter drop-shadow-[0_2px_8px_rgba(18,160,140,0.2)]" preserveAspectRatio="none">
      <polyline points={path} fill="none" stroke="var(--pg-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------- Confetti -------------------------------- */
export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: ((i * 37 + 13) % 100),
        delay: ((i * 17) % 12) * 0.1,
        dur: 2.4 + ((i * 19) % 18) * 0.1,
        color: ["#0f7b6c", "#f0b429", "#e2574c", "#2f80ed", "#12a08c"][i % 5],
        size: 6 + ((i * 23) % 8),
      })),
    [count],
  );
  
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animation: `pg-confetti-fall ${p.dur}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
