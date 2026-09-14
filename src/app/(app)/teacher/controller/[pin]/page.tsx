"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Badge, Button, Card, useToast, cx } from "@/components/ui";
import { Leaderboard } from "@/components/quiz";
import { liveAction, useLiveSession } from "@/lib/useLive";
import { LiveQuestionPalette } from "@/components/live-question-palette";
import { LiveSessionPacingTimer } from "@/components/live-session-timer";

export default function TeacherControllerPage({ params }: { params: Promise<{ pin: string }> }) {
  const router = useRouter();
  const { pin } = use(params);
  const { snapshot, status, isDeleted } = useLiveSession(pin);
  const { push } = useToast();
  const [busy, setBusy] = useState("");
  const [connectedAt, setConnectedAt] = useState<number | null>(null);

  useEffect(() => {
    if (status === "connected") setConnectedAt((v) => v ?? Date.now());
  }, [status]);

  useEffect(() => {
    if (isDeleted && busy !== "delete") {
      push("সেশনটি মুছে ফেলা হয়েছে", "info");
      router.push("/teacher/live");
    }
  }, [isDeleted, busy, router, push]);

  const control = async (command: string, extra: Record<string, unknown> = {}) => {
    setBusy(command);
    try {
      await liveAction({ action: "control", pin, command, ...extra });
    } catch (err) {
      push(err instanceof Error ? err.message : "কন্ট্রোল ব্যর্থ হয়েছে", "error");
    } finally {
      setBusy("");
    }
  };

  const deleteSession = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত এই লাইভ সেশন এবং এর সমস্ত প্লেয়ার ও উত্তরের ডেটা মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।")) return;
    setBusy("delete");
    try {
      await liveAction({ action: "delete", pin });
      push("লাইভ সেশন মুছে ফেলা হয়েছে ✅", "success");
      router.push("/teacher/live");
    } catch (err) {
      push(err instanceof Error ? err.message : "সেশন মুছতে সমস্যা হয়েছে", "error");
    } finally {
      setBusy("");
    }
  };

  const session = snapshot?.session;
  const isPaused = session?.paused ?? false;
  const q = snapshot?.question;
  const state = session?.state ?? "loading";
  const index = (session?.currentIndex ?? 0) + 1;
  const total = session?.total ?? 0;
  const players = snapshot?.players ?? [];
  const answered = snapshot?.answeredCount ?? 0;
  const pct = players.length ? Math.round((answered / players.length) * 100) : 0;
  const nextLabel = index >= total ? "🏁 ফলাফল দেখান" : `⏭️ পরের প্রশ্ন · ${index + 1}/${total}`;

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-slate-900 sm:px-5">
      <div className="mx-auto max-w-3xl space-y-3">
        <header className="sticky top-2 z-20 flex items-center gap-2 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-500">🎮 Teacher Remote Controller</p>
            <p className="font-black tracking-[0.18em]">PIN {pin}</p>
          </div>
          <Badge tone={status === "connected" ? "green" : "coral"}>
            {status === "connected" ? "● Live" : "◌ Reconnecting"}
          </Badge>
          <Link href={`/host/${pin}`} className="hidden sm:block">
            <Button variant="outline" size="sm">🖥️ Host</Button>
          </Link>
        </header>

        {!snapshot ? (
          <Card className="text-center">
            <p className="text-lg font-black">সেশন লোড হচ্ছে…</p>
            <p className="mt-1 text-sm text-slate-500">PIN {pin}-এর সাথে সংযোগ করা হচ্ছে।</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{state}</p>
                  <h1 className="mt-1 text-xl font-black sm:text-2xl">{snapshot.quiz.title}</h1>
                  <p className="mt-1 text-sm text-slate-500">প্রশ্ন {index} / {total} · 👥 {players.length} জন</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Answered</p>
                  <p className="text-2xl font-black tabular-nums">{answered}/{players.length}</p>
                  <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              {q && state !== "lobby" && state !== "quiz_complete" ? (
                <div className="mt-4">
                  <LiveSessionPacingTimer
                    endsAt={session?.endsAt ?? null}
                    totalSeconds={q.timer}
                    paused={isPaused}
                    questionIndex={session?.currentIndex ?? 0}
                    totalQuestions={total}
                    answeredCount={answered}
                    totalPlayers={players.length}
                    revealed={q.revealed}
                    onExtend={(s) => control("extend", { seconds: s })}
                    onTogglePause={() => control(isPaused ? "resume" : "pause")}
                    onReveal={() => control("reveal")}
                    compact
                  />
                </div>
              ) : null}

              {q ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-base font-extrabold leading-snug sm:text-lg">{q.text}</p>
                  {q.options?.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {q.options.map((option, i) => (
                        <div key={`${i}-${option}`} className={cx("rounded-xl border bg-white p-3 text-sm font-bold", q.revealed && q.correct?.map(Number).includes(i) && "border-emerald-400 bg-emerald-50 text-emerald-800")}>
                          {String.fromCharCode(65 + i)}. {option}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Card>

            <LiveQuestionPalette
              palette={snapshot.palette}
              currentIndex={session?.currentIndex ?? 0}
              totalPlayers={players.length}
              onJump={(index) => control("jump", { index })}
              compact
            />

            <Card>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Live controls</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button size="lg" variant="outline" onClick={() => control("prev")} loading={busy === "prev"}>⏮️ আগের</Button>
                <Button size="lg" variant="outline" onClick={() => control(isPaused ? "resume" : "pause")} loading={busy === "pause" || busy === "resume"}>
                  {isPaused ? "▶️ Resume" : "⏸️ Pause"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => control("reveal")} loading={busy === "reveal"}>👁️ Reveal</Button>
                <Button size="lg" variant="outline" onClick={() => control("leaderboard")} loading={busy === "leaderboard"}>🏆 Board</Button>
              </div>

              {state === "lobby" ? (
                <Button className="mt-3" size="lg" block onClick={() => control("start")} loading={busy === "start"}>🚀 কুইজ শুরু করুন</Button>
              ) : state !== "quiz_complete" ? (
                <Button className="mt-3 min-h-16 text-lg" size="lg" block onClick={() => control("next")} loading={busy === "next"}>
                  {nextLabel}
                </Button>
              ) : null}

              <div className="mt-3 grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={() => control("extend", { seconds: 10 })} loading={busy === "extend"}>+10 sec</Button>
                <Button variant="outline" size="sm" onClick={() => control("extend", { seconds: 30 })} loading={busy === "extend"}>+30 sec</Button>
                <Button variant="danger" size="sm" onClick={() => { if (window.confirm("এই লাইভ কুইজ শেষ করবেন?")) void control("end"); }} loading={busy === "end"}>🛑 End</Button>
                <Button variant="danger" size="sm" className="bg-rose-700 hover:bg-rose-800 text-white font-bold" onClick={deleteSession} loading={busy === "delete"}>🗑️ Delete</Button>
              </div>
            </Card>

            {(state === "leaderboard" || state === "quiz_complete") ? (
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live leaderboard</p>
                    <h2 className="text-xl font-black">🏆 Ranking</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{players.length} players</span>
                </div>
                <div className="mt-3"><Leaderboard rows={players} limit={10} /></div>
              </Card>
            ) : null}

            <Card className="bg-cyan-50">
              <p className="font-black">📱 এই ফোনটিই আপনার remote</p>
              <p className="mt-1 text-sm text-slate-600">Projector-এ /host/{pin} খোলা থাকবে। এখান থেকে Next, Reveal, Pause, Leaderboard, Timer এবং End নিয়ন্ত্রণ করলে projector ও students real-time update হবে।</p>
              {connectedAt ? <p className="mt-2 text-xs font-semibold text-slate-500">Controller connected · {new Date(connectedAt).toLocaleTimeString("bn-BD")}</p> : null}
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
