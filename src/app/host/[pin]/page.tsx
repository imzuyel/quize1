"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Modal, useToast, cx } from "@/components/ui";
import { CinematicIntro, Leaderboard, QuizTimer } from "@/components/quiz";
import { Celebration, ThemeStage, ThemedAnswers } from "@/components/theme-stage";
import { AnswerDistribution } from "@/components/reveal";
import { mergeTemplate } from "@/lib/theme";
import { liveAction, useLiveSession } from "@/lib/useLive";
import { FullscreenButton, useClassroomSounds } from "@/components/live-effects";
import { LiveQuestionPalette } from "@/components/live-question-palette";
import { LiveSessionPacingTimer } from "@/components/live-session-timer";
import { QuizPlate } from "@/components/quiz-plate";
import { LiveKahootLobby } from "@/components/live-kahoot-lobby";
import { LiveSessionChat } from "@/components/live-session-chat";
import { AnimatedKahootLeaderboard } from "@/components/animated-kahoot-leaderboard";
import { LiveReadinessTracker } from "@/components/live-readiness-tracker";
import { LiveCountdownOverlay } from "@/components/live-countdown-overlay";

export default function HostPage({ params }: { params: Promise<{ pin: string }> }) {
  const router = useRouter();
  const { pin } = use(params);
  const { snapshot, status, reactions, isDeleted, chatMessages, chatEnabled, sendChatMessage, toggleChat } = useLiveSession(pin);
  const { push } = useToast();
  const [intro, setIntro] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const sounds = useClassroomSounds(soundOn);

  const state = snapshot?.session.state ?? "lobby";
  const settings = snapshot?.quiz.settings;
  const q = snapshot?.question;
  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join?pin=${pin}`);
  }, [pin]);

  useEffect(() => {
    if (state === "countdown" && settings?.cinematicIntro) setIntro(true);
  }, [state, settings]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" || e.key === "F") setPresentation((v) => !v);
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); if (q?.revealed) void control("next"); }
      if (e.key === "r" || e.key === "R") void control("reveal");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q?.revealed]);

  useEffect(() => {
    if (state === "answer_reveal") sounds.reveal();
    if (state === "quiz_complete") sounds.complete();
  }, [state]);

  useEffect(() => {
    if (isDeleted && !deleting) {
      push("এই সেশনটি মুছে ফেলা হয়েছে", "info");
      router.push("/teacher/live");
    }
  }, [isDeleted, deleting, router, push]);

  const handleDeleteSession = async () => {
    setDeleting(true);
    try {
      await liveAction({ action: "delete", pin });
      push("লাইভ সেশন ও এর সমস্ত ডেটা মুছে ফেলা হয়েছে ✅", "success");
      router.push("/teacher/live");
    } catch (err) {
      push(err instanceof Error ? err.message : "সেশন মুছতে সমস্যা হয়েছে", "error");
      setDeleting(false);
    }
  };

  const control = async (command: string, extra: Record<string, unknown> = {}) => {
    setBusy(command);
    try {
      await liveAction({ action: "control", pin, command, ...extra });
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    } finally {
      setBusy("");
    }
  };

  const answeredCount = snapshot?.answeredCount ?? 0;
  const totalPlayers = snapshot?.players.length ?? 0;
  const answerPct = totalPlayers ? Math.round((answeredCount / totalPlayers) * 100) : 0;
  const outcomes = snapshot?.outcomes ?? {};
  const answeredBy = new Set(snapshot?.answeredBy ?? []);
  const correctCount = Object.values(outcomes).filter((o) => o.correct).length;
  const wrongCount = Object.values(outcomes).length - correctCount;
  const notAnswered = Math.max(0, totalPlayers - Object.values(outcomes).length);
  const everyoneAnswered = totalPlayers > 0 && answeredCount >= totalPlayers;

  const theme = mergeTemplate(snapshot?.theme);

  return (
    <ThemeStage config={theme} className="min-h-screen text-white bg-slate-950">
      {intro && snapshot ? (
        <CinematicIntro
          title={snapshot.quiz.title}
          questions={snapshot.session.total}
          players={snapshot.players.length}
          onDone={() => setIntro(false)}
        />
      ) : null}

      <div className={`mx-auto max-w-6xl p-3 sm:p-5 transition-all ${presentation ? "max-w-[1500px]" : ""}`}>
        {/* STREAMLINED HIGH-CONTRAST HEADER WITH PROMINENT LIVE JOIN COUNT */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700/90 p-3 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link href="/teacher/live" className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition">
              ← সেশন তালিকা
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              {state === "lobby" ? "● লবি খোলা" : "● লাইভ সেশন"}
            </span>

            {/* PROMINENT GAME PIN */}
            <span className="rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-4 py-1.5 text-base sm:text-lg font-black tracking-widest text-slate-950 shadow-md">
              PIN: {pin}
            </span>

            {/* UNMISSABLE EXTRA-LARGE LIVE PLAYER JOIN COUNT */}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-indigo-500/20 border-2 border-emerald-400/80 px-4 py-1.5 shadow-lg shadow-emerald-500/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                👥 জয়েন করেছে:
                <span className="text-slate-950 text-base sm:text-lg font-black tabular-nums bg-emerald-400 px-3 py-0.5 rounded-xl shadow-md border border-emerald-300">
                  {totalPlayers} জন
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(joinUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                } catch {
                  push("Join link কপি করা যায়নি", "error");
                }
              }}
              className="border-slate-600 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 text-xs"
            >
              {copied ? "✓ কপি হয়েছে" : "🔗 লিংক"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowQr(true)} className="border-slate-600 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 text-xs">
              📱 QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaderboardOpen(true)}
              className="border-amber-400/60 bg-amber-400/20 text-amber-300 font-extrabold hover:bg-amber-400/30 text-xs shadow-sm"
            >
              🏆 লিডারবোর্ড
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSoundOn((v) => !v); if (!soundOn) sounds.unlock(); }}
              className="border-slate-600 bg-slate-800 text-slate-200 text-xs"
            >
              {soundOn ? "🔊" : "🔇"}
            </Button>
            <FullscreenButton className="rounded-xl bg-slate-800 border border-slate-600 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700" />
          </div>
        </header>

        {/* MAIN LIVE STAGE AREA */}
        <div className={`grid gap-4 ${presentation ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}>
          <div className="space-y-4">
            {/* LOBBY VIEW */}
            {state === "lobby" ? (
              <Card className="bg-slate-900 border border-slate-800 p-2 sm:p-4">
                <LiveKahootLobby
                  pin={pin}
                  joinKeyword={snapshot?.session?.joinKeyword}
                  quizTitle={snapshot?.quiz?.title ?? "লাইভ কুইজ"}
                  totalQuestions={snapshot?.session?.total ?? 0}
                  players={snapshot?.players ?? []}
                  lobbyLocked={Boolean(snapshot?.session?.lobbyLocked)}
                  onStart={() => control("start")}
                  onKick={(playerId) => control("kick", { playerId })}
                  onToggleLock={() => control("toggleLock")}
                  onShowQr={() => setShowQr(true)}
                  isStarting={busy === "start"}
                  chatMessages={chatMessages}
                  chatEnabled={chatEnabled}
                  onSendMessage={async (text) => {
                    await sendChatMessage(text, "হোস্ট", "host");
                  }}
                  onToggleChat={async (enabled) => {
                    await toggleChat(enabled);
                  }}
                />
              </Card>
            ) : null}

            {/* ACTIVE QUESTION & ANSWER REVEAL STAGE */}
            {q && state !== "lobby" && state !== "quiz_complete" ? (
              <div className="space-y-4">
                {/* HIGH-CONTRAST QUESTION STATUS & JOIN COUNTER BANNER */}
                <div className="rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-indigo-600 px-3 py-1 text-xs font-black uppercase text-white tracking-wide shadow">
                        প্রশ্ন {(snapshot?.session.currentIndex ?? 0) + 1} / {snapshot?.session.total ?? 0}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                        {snapshot?.quiz.title}
                      </h2>
                    </div>

                    {/* DYNAMIC ANSWERED COUNT & LIVE PLAYER COUNT BADGE */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-slate-200 text-xs sm:text-sm font-black">
                        <span className="text-cyan-400">👥 জয়েন করেছে: <b className="text-white text-base tabular-nums">{totalPlayers}</b> জন</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-amber-300">📝 উত্তর: <b className="text-white text-base tabular-nums">{answeredCount}/{totalPlayers}</b> ({answerPct}%)</span>
                      </div>

                      {state === "question_active" && everyoneAnswered ? (
                        <span className="anim-pop rounded-xl bg-emerald-500/20 border border-emerald-400 px-2.5 py-1 text-xs font-black text-emerald-300">
                          ✅ সবাই উত্তর দিয়েছে!
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* HIGH-CONTRAST PROGRESS BAR */}
                  {(state === "question_active" || state === "answer_locked") && (
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500 shadow-sm"
                        style={{ width: `${answerPct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* PACING TIMER & CONTROLS FOR ACTIVE QUESTION */}
                <LiveSessionPacingTimer
                  endsAt={snapshot!.session.endsAt}
                  totalSeconds={q.timer}
                  paused={snapshot!.session.paused}
                  questionIndex={snapshot!.session.currentIndex}
                  totalQuestions={snapshot!.session.total}
                  answeredCount={answeredCount}
                  totalPlayers={totalPlayers}
                  revealed={q.revealed}
                  onExtend={(s) => control("extend", { seconds: s })}
                  onTogglePause={() => control(snapshot?.session.paused ? "resume" : "pause")}
                  onReveal={() => control("reveal")}
                />

                {/* MAIN QUESTION PLATE WITH ULTRA-HIGH CONTRAST */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-2 sm:p-4 shadow-2xl">
                  <QuizPlate
                    plateStyle={settings?.plateStyle || "auto"}
                    questionIndex={snapshot!.session.currentIndex}
                    totalQuestions={snapshot!.session.total}
                    questionText={q.text}
                    options={q.options}
                    type={q.type}
                    reveal={q.revealed}
                    correct={q.correct}
                    hint={q.hint}
                    explanation={q.explanation}
                    mode="host"
                    disabled={true}
                  />

                  {/* ANSWER DISTRIBUTION & RESULTS SUMMARY */}
                  {q.revealed && snapshot?.tally?.length ? (
                    <div className="mt-4 rounded-2xl bg-slate-950 border border-slate-800 p-4 text-white shadow-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                        <span className="text-cyan-300 text-sm font-black">📊 উত্তরের রিয়েল-টাইম বিশ্লেষণ</span>
                        <span className="text-slate-300 font-extrabold">{snapshot.answeredCount} জন উত্তর দিয়েছে</span>
                      </div>
                      <AnswerDistribution
                        options={q.options}
                        counts={snapshot.tally}
                        correct={q.correct ?? []}
                        palette={theme.answerPalette}
                      />
                    </div>
                  ) : null}
                </div>

                {/* STATS BREAKDOWN UPON REVEAL */}
                {q.revealed ? (
                  <div className="anim-fade grid grid-cols-3 gap-3">
                    {[
                      { n: correctCount, l: "সঠিক উত্তর", c: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50", i: "✅" },
                      { n: wrongCount, l: "ভুল উত্তর", c: "bg-rose-950/80 text-rose-300 border-rose-500/50", i: "❌" },
                      { n: notAnswered, l: "উত্তর দেয়নি", c: "bg-slate-900 text-slate-300 border-slate-700", i: "⏱️" },
                    ].map((x) => (
                      <div key={x.l} className={cx("rounded-2xl border p-3 text-center shadow-lg", x.c)}>
                        <p className="text-xl">{x.i}</p>
                        <p className="text-2xl sm:text-3xl font-black tabular-nums">{x.n}</p>
                        <p className="text-xs font-bold mt-0.5">{x.l}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* EXPLANATION BOX */}
                {q.revealed && q.explanation ? (
                  <div className="anim-fade rounded-2xl bg-amber-950/90 border-2 border-amber-500/50 p-4 text-amber-100 text-sm leading-relaxed shadow-lg">
                    <b className="text-amber-300 font-black text-base">💡 সঠিক উত্তরের ব্যাখ্যা:</b> {q.explanation}
                  </div>
                ) : null}

                {/* HOST NEXT QUESTION & LEADERBOARD NAVIGATION */}
                {q.revealed ? (
                  <div className="mt-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                    <LiveReadinessTracker
                      players={snapshot?.players ?? []}
                      readyPlayerIds={snapshot?.readyPlayers ?? []}
                      currentIndex={snapshot?.session.currentIndex ?? 0}
                      totalQuestions={snapshot?.session.total ?? 0}
                      onNext={() => control("next")}
                      isLoading={busy === "next"}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => control("leaderboard")}
                        className="border-amber-400/60 bg-amber-400/20 text-amber-300 font-black hover:bg-amber-400/30 shadow-md"
                      >
                        🏆 লিডারবোর্ড দেখান
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => control("next")}
                        loading={busy === "next"}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg"
                      >
                        ➡️ পরবর্তী প্রশ্ন
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* LEADERBOARD VIEW */}
            {state === "leaderboard" ? (
              <Card className="bg-slate-900 border border-slate-800 text-white p-4">
                <AnimatedKahootLeaderboard
                  players={snapshot?.players ?? []}
                  currentIndex={snapshot?.session.currentIndex ?? 0}
                  totalQuestions={snapshot?.session.total ?? 0}
                  onNext={() => control("next")}
                  onClose={() => control("returnToQuestion")}
                  isHost={true}
                />
              </Card>
            ) : null}

            {/* QUIZ COMPLETE STAGE */}
            {state === "quiz_complete" ? (
              <Card className="bg-slate-900 border border-slate-800 text-white p-6 text-center">
                <Celebration config={theme} />
                <h2 className="text-3xl font-black text-amber-300 mb-4">🎉 কুইজ সম্পূর্ণ হয়েছে!</h2>
                <AnimatedKahootLeaderboard
                  players={snapshot?.players ?? []}
                  currentIndex={snapshot?.session.currentIndex ?? 0}
                  totalQuestions={snapshot?.session.total ?? 0}
                  isHost={true}
                />
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href={`/teacher/reports?quizId=${snapshot?.quiz.id}`}>
                    <Button variant="outline" className="border-slate-600 bg-slate-800 text-slate-200 font-bold">
                      📊 রিপোর্ট দেখুন
                    </Button>
                  </Link>
                  <Link href="/teacher/live">
                    <Button className="bg-teal-500 text-slate-950 font-bold">✨ নতুন সেশন</Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    🗑️ সেশন ডিলিট
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* QUICK HOST CONTROLS BAR */}
            <Card className="bg-slate-900 border border-slate-800 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">🎮 দ্রুত হোস্ট কন্ট্রোল</span>
                <span className="text-xs text-indigo-300 font-bold">👥 জয়েন করেছে: {totalPlayers} জন</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={() => control("prev")} className="border-slate-700 bg-slate-800 text-slate-200 font-bold text-xs">
                  ⏮ আগের
                </Button>
                <Button variant="outline" size="sm" onClick={() => control(snapshot?.session.paused ? "resume" : "pause")} className="border-slate-700 bg-slate-800 text-slate-200 font-bold text-xs">
                  {snapshot?.session.paused ? "▶️ চালু" : "⏸ বিরতি"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => control("reveal")} className="border-slate-700 bg-slate-800 text-slate-200 font-bold text-xs">
                  👁 উত্তর দেখান
                </Button>
                <Button variant="outline" size="sm" onClick={() => control("next")} loading={busy === "next"} className="border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  ➡️ পরবর্তী
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">সময় বাড়ান:</span>
                  {[5, 10, 30].map((s) => (
                    <button key={s} onClick={() => control("extend", { seconds: s })} className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 font-bold text-slate-300 hover:bg-slate-700">
                      +{s}s
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowPaletteModal(true)} className="border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold">
                    🗺️ প্রশ্ন প্যালেট
                  </Button>
                  <Button size="sm" variant="danger" className="bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold" onClick={() => setDeleteConfirmOpen(true)}>
                    🗑️ ডিলিট
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* SIDEBAR: LIVE PLAYER LIST & REACTION FLOATING AREA */}
          <div className={`${presentation ? "hidden" : "space-y-4"}`}>
            <Card className="bg-slate-900 border border-slate-800 text-white p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                  👥 সংযুক্ত ছাত্র/খেলোয়াড়
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-black text-emerald-300 tabular-nums">
                  {totalPlayers} জন
                </span>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pg-scroll pr-1">
                {snapshot?.players.map((p) => (
                  <div
                    key={p.id}
                    className={cx(
                      "flex items-center gap-2.5 rounded-xl border p-2 text-xs transition shadow-sm",
                      q?.revealed && outcomes[p.id]?.correct
                        ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-200"
                        : q?.revealed && outcomes[p.id]
                          ? "border-rose-500/60 bg-rose-950/60 text-rose-200"
                          : answeredBy.has(p.id)
                            ? "border-teal-400/60 bg-teal-950/60 text-teal-200"
                            : "border-slate-800 bg-slate-950/80 text-slate-300",
                    )}
                  >
                    <span className={cx("h-2.5 w-2.5 rounded-full shrink-0", p.connected ? "bg-emerald-400 shadow-sm shadow-emerald-400/80" : "bg-slate-600")} />
                    <span className="flex-1 truncate font-bold">{p.nickname}</span>
                    {q?.revealed ? (
                      <span>{outcomes[p.id]?.correct ? "✅" : outcomes[p.id] ? "❌" : "⏱️"}</span>
                    ) : answeredBy.has(p.id) ? (
                      <span className="text-teal-300 font-black" title="উত্তর জমা দিয়েছে">✓ উত্তর দিয়েছে</span>
                    ) : null}
                    <span className="tabular-nums font-black text-amber-300">{Math.round(p.score)}</span>
                    <button
                      onClick={() => control("kick", { playerId: p.id })}
                      className="ml-1 text-slate-500 hover:text-rose-400 font-bold"
                      title="খেলোয়াড় সরান"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {!snapshot?.players.length ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <p className="text-2xl mb-1">⏳</p>
                    <p>কোনো ছাত্র এখনো জয়েন করেনি…</p>
                  </div>
                ) : null}
              </div>
            </Card>

            {snapshot?.teams.length ? (
              <Card className="bg-slate-900 border border-slate-800 text-white p-4">
                <p className="mb-2 text-xs font-black uppercase text-slate-400">টিম স্কোর</p>
                {snapshot.teams.map((t) => (
                  <div key={t.id} className="mb-1.5 flex items-center gap-2 text-xs">
                    <span>{t.icon}</span>
                    <span className="flex-1 font-bold" style={{ color: t.color }}>{t.name}</span>
                    <span className="font-black tabular-nums text-amber-300">{Math.round(t.score)}</span>
                  </div>
                ))}
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN FLOATING LIVE EMOJI REACTIONS LAYER */}
      <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
        {reactions.map((r, i) => (
          <span
            key={r.id || i}
            className="anim-float absolute text-5xl sm:text-7xl filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] select-none"
            style={{
              left: `${12 + ((r.id * 19) % 76)}%`,
              bottom: "40px",
            }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* RECENT LIVE REACTION TOAST BADGE */}
      {reactions.length > 0 && (
        <div className="fixed bottom-5 left-5 z-[99998] flex items-center gap-2.5 rounded-2xl bg-slate-900/95 border-2 border-amber-400/70 px-4 py-2.5 text-white shadow-2xl backdrop-blur-md anim-pop">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">🔥 ছাত্র রিঅ্যাকশন:</span>
          <div className="flex items-center gap-2 text-2xl">
            {reactions.slice(-5).map((r, idx) => (
              <span key={idx} className="animate-bounce inline-block">
                {r.emoji}
              </span>
            ))}
          </div>
        </div>
      )}

      <Modal open={showQr} onClose={() => setShowQr(false)} title="QR কোড দিয়ে যোগ দিন">
        <div className="text-center">
          {joinUrl ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(joinUrl)}`}
              alt="QR code"
              className="mx-auto rounded-xl border border-[var(--pg-line)]"
              width={260}
              height={260}
            />
          ) : null}
          <p className="mt-3 text-sm font-bold">{joinUrl}</p>
          <p className="mt-1 text-3xl font-black tracking-[0.2em]">{pin}</p>
        </div>
      </Modal>

      <Modal open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} title="লাইভ সেশন মুছে ফেলা">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900 border border-rose-200">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-sm font-black text-rose-900">আপনি কি নিশ্চিত এই লাইভ সেশন ডিলিট করবেন?</p>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                এই সেশনটি ডিলিট করলে এর সকল অংশগ্রহণকারী, জমা দেওয়া উত্তর এবং সমস্ত তাৎক্ষণিক ফলাফল ডেটাবেজ থেকে চিরতরে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
              বাতিল
            </Button>
            <Button
              variant="danger"
              className="bg-rose-600 hover:bg-rose-700 text-white font-black"
              loading={deleting}
              onClick={handleDeleteSession}
            >
              হ্যাঁ, সম্পূর্ণ ডিলিট করুন
            </Button>
          </div>
        </div>
      </Modal>

      {state === "countdown" ? (
        <LiveCountdownOverlay />
      ) : null}

      <Modal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        title="লাইভ লিডারবোর্ড ওভারভিউ"
      >
        <div className="space-y-4">
          <AnimatedKahootLeaderboard
            players={snapshot?.players ?? []}
            currentIndex={snapshot?.session.currentIndex ?? 0}
            totalQuestions={snapshot?.session.total ?? 0}
            onNext={() => {
              setLeaderboardOpen(false);
              control("next");
            }}
            onClose={() => setLeaderboardOpen(false)}
            isHost={true}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                control("leaderboard");
                setLeaderboardOpen(false);
              }}
              className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
            >
              📢 সবার স্ক্রিনে লিডারবোর্ড চালু করুন
            </Button>
            <Button size="sm" onClick={() => setLeaderboardOpen(false)}>
              ✕ বন্ধ করুন
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showPaletteModal}
        onClose={() => setShowPaletteModal(false)}
        title="প্রশ্ন প্যালেট ও রিয়েল-টাইম অংশগ্রহণ"
      >
        <LiveQuestionPalette
          palette={snapshot?.palette}
          currentIndex={snapshot?.session.currentIndex ?? 0}
          totalPlayers={snapshot?.players.length ?? 0}
          onJump={(index) => {
            control("jump", { index });
            setShowPaletteModal(false);
          }}
        />
      </Modal>

      {/* Floating Chat for Host during active quiz */}
      {state !== "lobby" && (
        <LiveSessionChat
          pin={pin}
          messages={chatMessages}
          chatEnabled={chatEnabled}
          isHost={true}
          currentUserName="হোস্ট"
          onSendMessage={async (text) => {
            await sendChatMessage(text, "হোস্ট", "host");
          }}
          onToggleChat={async (enabled) => {
            await toggleChat(enabled);
          }}
          variant="floating"
        />
      )}
    </ThemeStage>
  );
}

function stateLabel(state: string) {
  return (
    {
      lobby: "লবি",
      countdown: "কাউন্টডাউন",
      question_active: "প্রশ্ন চলছে",
      answer_locked: "উত্তর লক",
      answer_reveal: "উত্তর প্রকাশ",
      score_update: "স্কোর আপডেট",
      leaderboard: "লিডারবোর্ড",
      quiz_complete: "সম্পন্ন",
    }[state] ?? state
  );
}
