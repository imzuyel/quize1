"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Snapshot } from "./quiz-settings";

export type LiveStatus = "connecting" | "connected" | "reconnecting" | "offline";

export function useLiveSession(pin: string) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedMessage, setDeletedMessage] = useState("");
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const counter = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!pin || isDeleted) return;
    esRef.current?.close();
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    const playerId = typeof window !== "undefined" ? localStorage.getItem(`pg_player_${pin}`) : null;
    const qs = playerId
      ? `?pin=${encodeURIComponent(pin)}&playerId=${encodeURIComponent(playerId)}`
      : `?pin=${encodeURIComponent(pin)}`;
    const es = new EventSource(`/api/live/stream${qs}`);
    esRef.current = es;
    const onData = (e: MessageEvent) => {
      try {
        setSnapshot(JSON.parse(e.data) as Snapshot);
        setStatus("connected");
        retryRef.current = 0;
      } catch {
        /* ignore */
      }
    };
    es.addEventListener("update", onData);
    es.addEventListener("players", onData);
    es.addEventListener("answers", onData);
    es.addEventListener("timer", onData);
    es.addEventListener("reveal", onData);
    es.addEventListener("score_update", onData);
    es.addEventListener("leaderboard", onData);
    es.addEventListener("complete", onData);
    es.addEventListener("deleted", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { message?: string };
        setIsDeleted(true);
        setDeletedMessage(data?.message || "এই লাইভ সেশনটি ডিলিট করা হয়েছে");
        es.close();
      } catch {
        setIsDeleted(true);
        es.close();
      }
    });
    es.addEventListener("reaction", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as { emoji: string };
        const id = ++counter.current;
        setReactions((r) => [...r.slice(-14), { id, emoji: data.emoji }]);
        setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 1600);
      } catch {
        /* ignore */
      }
    });
    es.onopen = () => setStatus("connected");
    es.onerror = () => {
      if (isDeleted) return;
      setStatus("reconnecting");
      es.close();
      retryRef.current += 1;
      const delay = Math.min(8000, 800 * retryRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        connectRef.current();
      }, delay);
    };
  }, [pin, isDeleted]);

  useEffect(() => {
    connectRef.current = connect;
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      esRef.current?.close();
    };
  }, [connect]);

  // polling fallback keeps everyone in sync even if SSE is blocked by a proxy
  useEffect(() => {
    if (isDeleted) return;
    const id = setInterval(async () => {
      if (status === "connected" || isDeleted) return;
      try {
        const res = await fetch(`/api/live?pin=${pin}`);
        if (res.status === 404) {
          setIsDeleted(true);
          setDeletedMessage("এই লাইভ সেশনটি ডিলিট করা হয়েছে");
        } else if (res.ok) {
          setSnapshot((await res.json()) as Snapshot);
          setStatus((s) => (s === "connected" ? s : "reconnecting"));
        }
      } catch {
        setStatus("offline");
      }
    }, 3000);
    return () => clearInterval(id);
  }, [pin, status, isDeleted]);

  const refresh = useCallback(async () => {
    if (isDeleted) return;
    const res = await fetch(`/api/live?pin=${pin}`);
    if (res.status === 404) {
      setIsDeleted(true);
      setDeletedMessage("এই লাইভ সেশনটি ডিলিট করা হয়েছে");
    } else if (res.ok) {
      setSnapshot((await res.json()) as Snapshot);
    }
  }, [pin, isDeleted]);

  return { snapshot, status, reactions, refresh, isDeleted, deletedMessage };
}

export async function liveAction(body: Record<string, unknown>) {
  const res = await fetch("/api/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "ব্যর্থ");
  return data;
}
