import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function ok<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  // API responses are application state, not static assets. Prevent browsers,
  // proxies, and hosting layers from serving stale CRUD data after mutations.
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return NextResponse.json(data, { ...init, headers });
}

export function noStoreJson<T>(data: T, init?: ResponseInit) {
  return ok(data, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate", Pragma: "no-cache", Expires: "0" } },
  );
}

export async function guard<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message, err.status);
    console.error("[api]", err);
    return fail(err instanceof Error ? err.message : "Server error", 500);
  }
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
