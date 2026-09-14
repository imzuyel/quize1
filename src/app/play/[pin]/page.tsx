"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Modal, Textarea, useToast, cx } from "@/components/ui";
import { Leaderboard, QuizTimer, REACTIONS, StreakBanner } from "@/components/quiz";
import { Celebration, ThemeStage, ThemedCard } from "@/components/theme-stage";
import { QuestionInput } from "@/components/interactive";
import { AnswerFeedback, ScorePop, type RevealKind } from "@/components/reveal";
import { mergeTemplate } from "@/lib/theme";
import { liveAction, useLiveSession } from "@/lib/useLive";
import { useClassroomSounds } from "@/components/live-effects";
import { QuizResultFeedbackCard } from "@/components/quiz-result-feedback-card";
import { QuizPlate } from "@/components/quiz-plate";
import { PlayerReadyButton } from "@/components/live-readiness-tracker";
import { AnimatedKahootLeaderboard } from "@/components/animated-kahoot-leaderboard";
import { LiveCountdownOverlay } from "@/components/live-countdown-overlay";
import { LiveSessionChat } from "@/components/live-session-chat";
import { parsePlayerAvatar } from "@/lib/avatar";
import {
  LiveSmartCoachBanner,
  Milestone5CheckpointModal,
} from "@/components/live-smart-feedback";
import {
  getLivePerformanceRemark,
  getMilestoneReview,
  type LivePerformanceRemark,
  type MilestoneReview,
} from "@/lib/quiz-feedback";

const SINGLE_CHOICE = ["mcq", "true_false", "image_choice", "scenario", "case_based", "hotspot", "audio", "video", "odd_one_out", "analogy"];
function isSingleChoice(type: string) {
  return SINGLE_CHOICE.includes(type);
}

export default function PlayPage({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = use(params);
  const { snapshot, status, reactions, isDeleted, deletedMessage, chatMessages, chatEnabled, sendChatMessage } = useLiveSession(pin);
  const { push } = useToast();
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [answerValue, setAnswerValue] = useState<(string | number)[]>([]);
  const [submittedIndex, setSubmittedIndex] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [revealKind, setRevealKind] = useState<RevealKind>(null);
  const [revealPoints, setRevealPoints] = useState(0);
  const [scorePop, setScorePop] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const sounds = useClassroomSounds(soundOn);

  // Smart performance coaching & 5-question milestone states
  const [performanceRemark, setPerformanceRemark] = useState<LivePerformanceRemark | null>(null);
  const [milestoneReview, setMilestoneReview] = useState<MilestoneReview | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [consecutiveWrong, setConsecutiveWrong] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(sessionStorage.getItem(`pg_cw_${pin}`)) || 0;
    } catch {
      return 0;
    }
  });
  const [recentAnswers, setRecentAnswers] = useState<boolean[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(`pg_ra_${pin}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const id = localStorage.getItem(`pg_player_${pin}`);
    if (id) setPlayerId(Number(id));
  }, [pin]);

  useEffect(() => {
    if (!playerId) return;
    const id = setInterval(() => {
      liveAction({ action: "heartbeat", pin, playerId }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [playerId, pin]);

  const q = snapshot?.question;
  const settings = snapshot?.quiz.settings;
  const me = snapshot?.players.find((p) => p.id === playerId);
  const state = snapshot?.session.state ?? "lobby";

  const isPlayerReady = Boolean(playerId && (snapshot?.readyPlayers ?? []).includes(playerId));
  const handleToggleReady = async () => {
    if (!playerId) return;
    try {
      await liveAction({
        action: "ready",
        pin,
        playerId,
        ready: !isPlayerReady,
      });
    } catch {}
  };

  useEffect(() => {
    setAnswerValue([]);
    setHidden([]);
    setPerformanceRemark(null);
    setShowMilestoneModal(false);
    if (snapshot?.session.currentIndex !== undefined) sounds.countdown();
  }, [snapshot?.session.currentIndex]);

  useEffect(() => {
    if (state === "quiz_complete") {
      sounds.complete();
      if (me && snapshot) {
        const ranked = [...snapshot.players].sort((a, b) => b.score - a.score);
        const myRankIdx = ranked.findIndex((p) => p.id === playerId);
        const rank = myRankIdx !== -1 ? myRankIdx + 1 : 1;
        const accuracy = me.answeredCount
          ? Math.round((me.correctCount / me.answeredCount) * 100)
          : 0;
        try {
          localStorage.setItem(
            "pg_last_completed_quiz",
            JSON.stringify({
              pin,
              quizTitle: snapshot.quiz.title || "লাইভ কুইজ",
              score: me.score,
              rank,
              totalPlayers: snapshot.players.length,
              accuracy,
              correctCount: me.correctCount,
              totalQuestions: snapshot.session.total || snapshot.players.length,
              answeredCount: me.answeredCount,
              completedAt: Date.now(),
            }),
          );
        } catch {}
      }
    }
  }, [state, me, snapshot, pin, playerId, sounds]);

  const answered = submittedIndex === snapshot?.session.currentIndex || Boolean(playerId && snapshot?.answeredBy.includes(playerId));
  const outcome = playerId ? snapshot?.outcomes?.[playerId] : undefined;
  const revealedIndex = q?.revealed ? snapshot?.session.currentIndex : undefined;

  // Fire the celebration/shake and smart performance remarks exactly once per revealed question.
  useEffect(() => {
    if (revealedIndex === undefined || !playerId) return;
    const key = `rv_${pin}_${revealedIndex}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const isCorrect = Boolean(outcome?.correct);

    if (!outcome) {
      setRevealKind("timeout");
    } else {
      setRevealKind(isCorrect ? "correct" : "wrong");
      setRevealPoints(outcome.points);
      if (outcome.points > 0) {
        setScorePop(outcome.points);
        setTimeout(() => setScorePop(0), 1600);
      }
    }

    // 1. Update streak & consecutive wrong tracker
    const nextConsecutiveWrong = isCorrect ? 0 : consecutiveWrong + 1;
    setConsecutiveWrong(nextConsecutiveWrong);
    try {
      sessionStorage.setItem(`pg_cw_${pin}`, String(nextConsecutiveWrong));
    } catch {}

    const nextRecentAnswers = [...recentAnswers, isCorrect].slice(-5);
    setRecentAnswers(nextRecentAnswers);
    try {
      sessionStorage.setItem(`pg_ra_${pin}`, JSON.stringify(nextRecentAnswers));
    } catch {}

    // 2. Generate live praise or funny roast based on streaks
    const currentStreak = isCorrect ? Math.max(1, (me?.streak ?? 0) + 1) : 0;
    const remark = getLivePerformanceRemark({
      correct: isCorrect,
      streak: currentStreak,
      consecutiveWrong: nextConsecutiveWrong,
      responseMs: outcome?.responseMs,
      questionNumber: revealedIndex + 1,
    });
    setPerformanceRemark(remark);

    // 3. Milestone review every 5 questions: (revealedIndex + 1) % 5 === 0
    if ((revealedIndex + 1) % 5 === 0) {
      const ranked = [...(snapshot?.players ?? [])].sort((a, b) => b.score - a.score);
      const myRankIdx = ranked.findIndex((p) => p.id === playerId);
      const myRank = myRankIdx !== -1 ? myRankIdx + 1 : undefined;

      const ms = getMilestoneReview({
        questionIndex: revealedIndex,
        score: (me?.score ?? 0) + (outcome?.points ?? 0),
        rank: myRank,
        totalPlayers: snapshot?.players.length ?? 1,
        correctCount: (me?.correctCount ?? 0) + (isCorrect ? 1 : 0),
        answeredCount: (me?.answeredCount ?? 0) + 1,
        recent5Answers: nextRecentAnswers,
      });
      setMilestoneReview(ms);
      // Automatically pop up milestone card on everyone's screen
      setShowMilestoneModal(true);
    }
  }, [revealedIndex, outcome, playerId, pin, consecutiveWrong, recentAnswers, me, snapshot]);

  const submit = async () => {
    if (!playerId || !q) return;
    const answer = answerValue;
    if (!answer.length || (typeof answer[0] === "string" && !String(answer[0]).trim()))
      return push("একটি উত্তর দিন", "error");
    try {
      await liveAction({ action: "answer", pin, playerId, answer });
      setSubmittedIndex(snapshot!.session.currentIndex);
      sounds.submit();
      push("উত্তর জমা হয়েছে ✅", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    }
  };

  const applyPower = async (kind: string) => {
    try {
      const res = (await liveAction({ action: "powerup", pin, playerId, kind })) as { hidden?: number[] };
      if (res.hidden?.length) setHidden(res.hidden);
      push("পাওয়ার-আপ ব্যবহৃত!", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    }
  };

  const availablePowerUps = useMemo(
    () => Object.entries(settings?.powerUps ?? {}).filter(([, v]) => v).map(([k]) => k),
    [settings],
  );

  if (isDeleted) {
    return (
      <div className="pg-hero-bg grid min-h-screen place-items-center p-6 text-center text-white">
        <div className="max-w-md w-full rounded-3xl border border-white/20 bg-slate-900/90 p-8 backdrop-blur shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-4xl border border-rose-500/30">
            🗑️
          </div>
          <h2 className="mt-5 text-2xl font-black text-rose-400">লাইভ সেশনটি ডিলিট করা হয়েছে</h2>
          <p className="mt-2 text-sm text-slate-300">
            {deletedMessage || "হোস্ট বা শিক্ষক এই লাইভ সেশনটি এবং এর যাবতীয় ডেটা মুছে ফেলেছেন।"}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/join" className="flex-1">
              <Button variant="gold" className="w-full font-black">
                অন্য সেশনে যোগ দিন
              </Button>
            </Link>
            <Link href="/student" className="flex-1">
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                ড্যাশবোর্ড
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!playerId)
    return (
      <div className="pg-hero-bg grid min-h-screen place-items-center p-6 text-center text-white">
        <div>
          <p className="text-lg font-bold">আপনি এখনো এই সেশনে যোগ দেননি</p>
          <Link href={`/join?pin=${pin}`}>
            <Button className="mt-4" size="lg">
              যোগ দিন
            </Button>
          </Link>
        </div>
      </div>
    );

  const theme = mergeTemplate(snapshot?.theme);

  return (
    <ThemeStage config={theme} className="relative min-h-screen text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-3 pb-24 sm:p-5">
        <header className="flex items-center gap-2 text-xs">
          <Badge tone={status === "connected" ? "green" : "coral"}>
            {status === "connected" ? "● সংযুক্ত" : status === "reconnecting" ? "◌ পুনঃসংযোগ…" : "○ অফলাইন"}
          </Badge>
          <span className="rounded-lg bg-white/10 px-2 py-1 font-bold">PIN {pin}</span>
          <div className="flex-1" />
          <button type="button" onClick={() => { setSoundOn((v) => !v); if (!soundOn) sounds.unlock(); }} className="rounded-lg bg-white/10 px-2 py-1 font-bold">{soundOn ? "🔊" : "🔇"}</button>
          {status !== "connected" ? <span className="rounded-lg bg-rose-500/80 px-2 py-1 font-bold">সংযোগ হচ্ছে…</span> : null}
          <span className="relative rounded-lg bg-white/10 px-2 py-1 font-bold">
            {me?.nickname} · {Math.round(me?.score ?? 0)} পয়েন্ট
            {scorePop ? <ScorePop points={scorePop} /> : null}
          </span>
        </header>

        {state === "countdown" ? (
          <LiveCountdownOverlay />
        ) : null}

        {state === "lobby" ? (
          <Card className="anim-zoom overflow-hidden bg-white/95 text-center text-slate-900 shadow-2xl p-6 sm:p-8">
            <div className="mx-auto mb-4 max-w-md rounded-2xl bg-gradient-to-r from-slate-900 via-[var(--pg-deep)] to-slate-900 p-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">LIVE CLASSROOM</p>
              <p className="mt-1 text-3xl font-black tracking-[0.18em]">{pin}</p>
              <p className="mt-1 text-xs text-white/60">{snapshot?.players.length ?? 0} জন যোগ দিয়েছে</p>
            </div>

            {/* Current Player Avatar Display */}
            {me && (
              <div className="my-6 inline-flex flex-col items-center">
                {(() => {
                  const { avatar, name, bg } = parsePlayerAvatar(me.nickname, me.id);
                  return (
                    <div className="flex flex-col items-center">
                      <div className={`grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${bg} text-4xl shadow-xl animate-bounce`}>
                        {avatar}
                      </div>
                      <span className="mt-2 text-xl font-black text-slate-900">{name}</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold mt-1">
                        ✓ সফলভাবে যোগ দিয়েছেন
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
              শিক্ষকের অপেক্ষায়…
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {snapshot?.quiz.title} · {snapshot?.session.total} প্রশ্ন
            </p>
            <p className="mt-2 text-xs font-semibold text-indigo-600">
              শিক্ষক কুইজ শুরু করলে আপনার স্ক্রিনে স্বয়ংক্রিয়ভাবে প্রথম প্রশ্ন আসবে
            </p>

            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-bold text-slate-400 mb-2">অন্যান্য সহপাঠী ({snapshot?.players.length ?? 0}):</p>
              <div className="flex flex-wrap justify-center gap-2 max-h-36 overflow-y-auto p-1">
                {snapshot?.players.map((p) => {
                  const isMe = p.id === playerId;
                  const { avatar, name, bg } = parsePlayerAvatar(p.nickname, p.id);
                  return (
                    <span
                      key={p.id}
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm transition",
                        isMe ? "bg-[var(--pg-deep)] text-white ring-2 ring-cyan-400" : "bg-slate-100 text-slate-700",
                      )}
                    >
                      <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] bg-gradient-to-br ${bg}`}>
                        {avatar}
                      </span>
                      <span>{name}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Live Lobby Text Chat for Student */}
            <div className="mt-6 text-left">
              <LiveSessionChat
                pin={pin}
                messages={chatMessages}
                chatEnabled={chatEnabled}
                isHost={false}
                currentUserId={playerId ?? undefined}
                currentUserName={me?.nickname ?? "শিক্ষার্থী"}
                currentUserAvatar={me?.nickname}
                onSendMessage={async (text) => {
                  await sendChatMessage(text, me?.nickname ?? "শিক্ষার্থী", "student", playerId ?? undefined);
                }}
                variant="lobby-card"
              />
            </div>
          </Card>
        ) : null}

        {["question_active", "answer_locked", "answer_reveal", "score_update"].includes(state) && q ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white/60">
                  প্রশ্ন {snapshot!.session.currentIndex + 1} / {snapshot!.session.total}
                </p>
                <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full transition-all"
                    style={{
                      background: theme.accent,
                      width: `${((snapshot!.session.currentIndex + 1) / Math.max(1, snapshot!.session.total)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <QuizTimer
                endsAt={snapshot!.session.endsAt}
                total={q.timer}
                style={theme.timerStyle}
                color={theme.accent}
                paused={snapshot!.session.paused}
                size={78}
              />
            </div>

            {isSingleChoice(q.type) || q.type === "multi_select" || q.type === "poll" ? (
              <div className="space-y-3">
                <QuizPlate
                  plateStyle={settings?.plateStyle || "auto"}
                  questionIndex={snapshot!.session.currentIndex}
                  totalQuestions={snapshot!.session.total}
                  questionText={q.text}
                  options={q.options}
                  type={q.type}
                  selected={answerValue}
                  hidden={hidden}
                  reveal={q.revealed}
                  correct={q.correct}
                  hint={q.hint}
                  explanation={q.explanation}
                  mode="player"
                  disabled={state !== "question_active" || answered}
                  onSelect={(i) => {
                    if (state !== "question_active" || answered) return;
                    if (q.type === "multi_select" || q.type === "poll") {
                      const prev = answerValue.map(Number);
                      setAnswerValue(prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
                    } else {
                      setAnswerValue([i]);
                    }
                  }}
                />

                {answered && state === "question_active" ? (
                  <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 p-3 text-center text-white backdrop-blur shadow-lg ring-2 ring-emerald-400/40">
                    <p className="text-xl">✅</p>
                    <p className="font-extrabold text-sm">আপনার উত্তর জমা হয়েছে</p>
                    <p className="text-xs text-emerald-200">বাকি শিক্ষার্থীদের উত্তরের অপেক্ষায়…</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <ThemedCard config={theme} animate animKey={q.id} className="p-4">
                  <p className="text-lg font-bold leading-snug">{q.text}</p>
                  {q.hint ? (
                    <details className="mt-2 text-xs text-slate-500">
                      <summary className="cursor-pointer font-semibold">💡 হিন্ট দেখুন</summary>
                      <p className="mt-1">{q.hint}</p>
                    </details>
                  ) : null}
                </ThemedCard>

                {answered && state === "question_active" ? (
                  <Card className="anim-pop bg-emerald-500 text-center text-white">
                    <p className="text-2xl">✅</p>
                    <p className="mt-1 font-extrabold">উত্তর জমা হয়েছে</p>
                    <p className="text-xs opacity-80">অন্যদের অপেক্ষায়…</p>
                  </Card>
                ) : (
                  <QuestionInput
                    config={theme}
                    type={q.type}
                    text={q.text}
                    options={q.options}
                    value={answerValue}
                    hidden={hidden}
                    reveal={q.revealed}
                    correct={q.correct}
                    disabled={state !== "question_active"}
                    onChange={setAnswerValue}
                    onSubmit={state === "question_active" ? submit : undefined}
                  />
                )}
              </>
            )}

            {!answered &&
            state === "question_active" &&
            answerValue.length > 0 &&
            isSingleChoice(q.type) ? (
              <Button block size="lg" onClick={submit}>নিশ্চিত করুন</Button>
            ) : null}

            {q.revealed ? (
              <Card
                className={cx(
                  "anim-pop text-center",
                  outcome?.correct
                    ? "border-emerald-400 bg-emerald-500 text-white"
                    : outcome
                      ? "border-rose-400 bg-rose-500 text-white"
                      : "border-slate-300 bg-slate-600 text-white",
                )}
              >
                <div className={cx("text-5xl", outcome?.correct ? "reveal-badge" : "anim-shake")}>
                  {outcome?.correct ? "🎉" : outcome ? "💡" : "⏱️"}
                </div>
                <p className="mt-2 text-2xl font-extrabold">
                  {outcome?.correct ? "সঠিক উত্তর!" : outcome ? "ভুল হয়েছে" : "সময় শেষ"}
                </p>
                {outcome?.correct ? (
                  <div className="space-y-1">
                    <p className="mt-1 text-2xl font-black">+{Math.round(outcome.points)} পয়েন্ট</p>
                    {outcome.responseMs !== undefined ? (
                      <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs font-bold text-emerald-100">
                        <span>⚡ রেসপন্স টাইম: {(outcome.responseMs / 1000).toFixed(1)}s</span>
                        {outcome.responseMs <= 2500 ? (
                          <span className="rounded-full bg-amber-300 text-slate-950 px-2 py-0.5 text-[10px] font-black shadow-2xs">
                            ⚡ লাইটনিং স্পিড বোনাস!
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/20 text-white px-2 py-0.5 text-[10px] font-semibold">
                            🚀 দ্রুত উত্তরের বোনাস
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-sm opacity-90">
                    {outcome ? "সঠিক উত্তরটি সবুজ রঙে দেখানো হয়েছে" : "এই প্রশ্নে উত্তর দেওয়া হয়নি"}
                  </p>
                )}
                {me && me.streak >= 3 && outcome?.correct ? (
                  <p className="mt-1 text-sm font-bold">🔥 টানা {me.streak}টি সঠিক!</p>
                ) : null}
              </Card>
            ) : null}

            {q.revealed && performanceRemark ? (
              <div className="anim-fade">
                <LiveSmartCoachBanner
                  remark={performanceRemark}
                  onDismiss={() => setPerformanceRemark(null)}
                />
              </div>
            ) : null}

            {q.revealed && milestoneReview && !showMilestoneModal ? (
              <button
                type="button"
                onClick={() => setShowMilestoneModal(true)}
                className="w-full rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 p-3 text-center text-xs font-black text-amber-200 shadow-sm transition hover:bg-amber-500/30"
              >
                🎯 প্রশ্ন {milestoneReview.milestoneNumber} মাইলস্টোন রিভিউ দেখুন (ক্লিক করুন)
              </button>
            ) : null}

            {q.revealed && q.explanation ? (
              <Card
                className={cx(
                  "reveal-banner text-slate-900",
                  outcome?.correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50",
                )}
              >
                <p className="text-xs font-bold uppercase text-amber-700">
                  {outcome?.correct ? "✅ কেন সঠিক" : "💡 ব্যাখ্যা"}
                </p>
                <p className="mt-1 text-sm">{q.explanation}</p>
              </Card>
            ) : null}

            {me && me.streak >= 3 ? <StreakBanner streak={me.streak} /> : null}

            {availablePowerUps.length ? (
              <div className="flex flex-wrap gap-2">
                {availablePowerUps.map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPower(p)}
                    className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold"
                  >
                    {p === "double_points"
                      ? "✖️2 ডাবল পয়েন্ট"
                      : p === "shield"
                        ? "🛡️ শিল্ড"
                        : p === "extra_time"
                          ? "⏱️ +১০ সেকেন্ড"
                          : p === "fifty_fifty"
                            ? "✂️ একটি অপশন বাদ"
                            : p}
                  </button>
                ))}
              </div>
            ) : null}

            {q.revealed ? (
              <div className="anim-fade space-y-3">
                <PlayerReadyButton
                  isReady={isPlayerReady}
                  onToggleReady={handleToggleReady}
                  readyCount={snapshot?.readyCount ?? (snapshot?.readyPlayers?.length ?? 0)}
                  totalPlayers={snapshot?.players.length ?? 0}
                />
              </div>
            ) : null}

            <button
              onClick={() => setReportOpen(true)}
              className="mx-auto text-xs font-semibold text-white/60 underline"
            >
              ⚠️ এই প্রশ্নে সমস্যা রিপোর্ট করুন
            </button>
          </>
        ) : null}

        {state === "leaderboard" ? (
          <div className="anim-zoom">
            <AnimatedKahootLeaderboard
              players={snapshot?.players ?? []}
              currentIndex={snapshot?.session.currentIndex ?? 0}
              totalQuestions={snapshot?.session.total ?? 0}
              isHost={false}
            />
          </div>
        ) : null}

        {state === "quiz_complete" ? (
          <>
            <Celebration config={theme} />
            <div className="space-y-4">
              {(() => {
                const ranked = [...(snapshot?.players ?? [])].sort((a, b) => b.score - a.score);
                const myRankIdx = ranked.findIndex((p) => p.id === playerId);
                const rank = myRankIdx !== -1 ? myRankIdx + 1 : 1;
                const accuracy = me?.answeredCount
                  ? Math.round((me.correctCount / me.answeredCount) * 100)
                  : 0;

                return (
                  <QuizResultFeedbackCard
                    result={{
                      pin,
                      quizTitle: snapshot?.quiz.title ?? "লাইভ কুইজ",
                      score: me?.score ?? 0,
                      rank,
                      totalPlayers: snapshot?.players.length ?? 1,
                      accuracy,
                      correctCount: me?.correctCount ?? 0,
                      totalQuestions: snapshot?.session.total ?? 0,
                      answeredCount: me?.answeredCount ?? 0,
                    }}
                    showActions={false}
                  />
                );
              })()}

              <Card className="anim-zoom bg-white/95 text-center text-slate-900">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    🏆 চূড়ান্ত লিডারবোর্ড
                  </p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    মোট {snapshot?.players.length ?? 0} জন
                  </span>
                </div>
                <div className="mt-3">
                  <Leaderboard rows={snapshot!.players} limit={10} highlightId={playerId} />
                </div>
                {settings?.feedbackEnabled ? (
                  <Button className="mt-4" block onClick={() => setFeedbackOpen(true)}>
                    ফিডব্যাক দিন
                  </Button>
                ) : null}
                <Link href="/student">
                  <Button variant="outline" className="mt-2" block>
                    🏠 শিক্ষার্থী হোম স্ক্রিনে যান
                  </Button>
                </Link>
              </Card>
            </div>
          </>
        ) : null}
      </div>

      {settings?.reactions && state !== "quiz_complete" ? (
        <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-1.5 border-t border-white/10 bg-black/30 p-2 backdrop-blur">
          {REACTIONS.map((r) => (
            <button
              key={r}
              onClick={() => liveAction({ action: "react", pin, playerId, emoji: r }).catch(() => {})}
              className="rounded-xl px-3 py-2 text-xl active:scale-90"
              aria-label={`reaction ${r}`}
            >
              {r}
            </button>
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="anim-float absolute text-3xl"
            style={{ left: `${10 + (r.id * 7) % 80}%`, bottom: 60 }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      <AnswerFeedback
        kind={revealKind}
        points={revealPoints}
        streak={me?.streak}
        onDone={() => setRevealKind(null)}
      />

      {/* 5-Question Milestone Modal on everyone's screen */}
      {milestoneReview ? (
        <Milestone5CheckpointModal
          open={showMilestoneModal}
          review={milestoneReview}
          onContinue={() => {
            setShowMilestoneModal(false);
            if (!isPlayerReady) handleToggleReady();
          }}
        />
      ) : null}

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        quizId={snapshot?.quiz.id ?? 0}
        sessionId={snapshot?.session.id ?? 0}
        playerName={me?.nickname ?? "Guest"}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        questionId={q?.id ?? 0}
        quizId={snapshot?.quiz.id ?? 0}
        playerName={me?.nickname ?? "Guest"}
      />

      {/* Floating Chat for Student during active quiz */}
      {state !== "lobby" && (
        <LiveSessionChat
          pin={pin}
          messages={chatMessages}
          chatEnabled={chatEnabled}
          isHost={false}
          currentUserId={playerId ?? undefined}
          currentUserName={me?.nickname ?? "শিক্ষার্থী"}
          currentUserAvatar={me?.nickname}
          onSendMessage={async (text) => {
            await sendChatMessage(text, me?.nickname ?? "শিক্ষার্থী", "student", playerId ?? undefined);
          }}
          variant="floating"
        />
      )}
    </ThemeStage>
  );
}

function FeedbackModal({
  open,
  onClose,
  quizId,
  sessionId,
  playerName,
}: {
  open: boolean;
  onClose: () => void;
  quizId: number;
  sessionId: number;
  playerName: string;
}) {
  const { push } = useToast();
  const [values, setValues] = useState({ overall: 5, difficulty: 3, timerRating: 3, quality: 5, engagement: 5 });
  const [comment, setComment] = useState("");
  const rows: { key: keyof typeof values; label: string; icons: string[] }[] = [
    { key: "overall", label: "সামগ্রিক অভিজ্ঞতা", icons: ["😞", "😐", "🙂", "😃", "🤩"] },
    { key: "difficulty", label: "কঠিনতা", icons: ["🟢", "🟡", "🟠", "🔴", "⚫"] },
    { key: "timerRating", label: "সময় যথেষ্ট ছিল?", icons: ["⏱️", "⏱️", "⏱️", "⏱️", "⏱️"] },
    { key: "quality", label: "প্রশ্নের মান", icons: ["⭐", "⭐", "⭐", "⭐", "⭐"] },
    { key: "engagement", label: "আকর্ষণীয়তা", icons: ["💤", "🙂", "😊", "🔥", "🚀"] },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="আপনার মতামত"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            পরে
          </Button>
          <Button
            onClick={async () => {
              await fetch("/api/feedback", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ op: "feedback", quizId, sessionId, playerName, ...values, comment }),
              });
              push("ধন্যবাদ! ফিডব্যাক জমা হয়েছে", "success");
              onClose();
            }}
          >
            জমা দিন
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.key}>
            <p className="mb-1.5 text-xs font-semibold text-slate-600">{r.label}</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setValues((v) => ({ ...v, [r.key]: n }))}
                  className={cx(
                    "flex-1 rounded-xl border py-2 text-lg transition",
                    values[r.key] === n
                      ? "border-[var(--pg-teal)] bg-teal-50 scale-105"
                      : "border-[var(--pg-line)]",
                  )}
                  aria-label={`${r.label} ${n}`}
                >
                  {r.icons[n - 1]}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="লিখিত মতামত (ঐচ্ছিক)"
        />
      </div>
    </Modal>
  );
}

function ReportModal({
  open,
  onClose,
  questionId,
  quizId,
  playerName,
}: {
  open: boolean;
  onClose: () => void;
  questionId: number;
  quizId: number;
  playerName: string;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState("wrong_answer");
  const [detail, setDetail] = useState("");
  const reasons = [
    ["wrong_answer", "ভুল উত্তর"],
    ["ambiguous", "অস্পষ্ট প্রশ্ন"],
    ["typo", "বানান ভুল"],
    ["technical", "কারিগরি সমস্যা"],
    ["multiple_correct", "একাধিক সঠিক উত্তর"],
    ["other", "অন্যান্য"],
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="প্রশ্ন রিপোর্ট"
      footer={
        <Button
          onClick={async () => {
            await fetch("/api/feedback", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ op: "report", questionId, quizId, reason, detail, playerName }),
            });
            push("রিপোর্ট পাঠানো হয়েছে", "success");
            onClose();
          }}
        >
          পাঠান
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {reasons.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setReason(v)}
            className={cx(
              "rounded-xl border px-3 py-2 text-sm font-semibold",
              reason === v ? "border-[var(--pg-teal)] bg-teal-50" : "border-[var(--pg-line)]",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <Textarea
        className="mt-3"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="বিস্তারিত (ঐচ্ছিক)"
      />
    </Modal>
  );
}
