import { db } from "@/db";
import {
  playerAnswers,
  questions,
  quizQuestions,
  quizSessions,
  quizTemplates,
  quizzes,
  sessionPlayers,
  sessionTeams,
} from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  mergeSettings,
  type LiveQuestion,
  type LivePaletteItem,
  type Snapshot,
} from "./quiz-settings";

export {
  DEFAULT_SETTINGS,
  EXAM_SETTINGS,
  mergeSettings,
  isAnswerCorrect,
  computePoints,
  generatePin,
} from "./quiz-settings";
export type { QuizSettings, LiveQuestion, Snapshot, LivePaletteItem } from "./quiz-settings";

function normalizeJsonArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function loadQuizQuestions(quizId: number): Promise<LiveQuestion[]> {
  const rows = await db
    .select({
      id: questions.id,
      text: questions.text,
      type: questions.type,
      options: questions.options,
      correct: questions.correct,
      marks: quizQuestions.marks,
      qmarks: questions.marks,
      timer: quizQuestions.timer,
      qtimer: questions.timer,
      difficulty: questions.difficulty,
      subjectId: questions.subjectId,
      media: questions.media,
      hint: questions.hint,
      explanation: questions.explanation,
      order: quizQuestions.orderIndex,
      settings: quizQuestions.settings,
    })
    .from(quizQuestions)
    .innerJoin(questions, eq(questions.id, quizQuestions.questionId))
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(asc(quizQuestions.orderIndex));

  return rows.map((r, i) => ({
    id: r.id,
    index: i,
    text: r.text,
    type: r.type,
    options: normalizeJsonArray<string>(r.options),
    correct: normalizeJsonArray<string | number>(r.correct),
    marks: r.marks ?? r.qmarks ?? 1,
    timer: r.timer ?? r.qtimer ?? 30,
    difficulty: r.difficulty,
    subjectId: r.subjectId,
    media: r.media,
    hint: r.hint,
    explanation: r.explanation,
    settings: r.settings as Record<string, unknown>,
  }));
}

export async function getSessionByPin(pin: string) {
  const normalized = pin.trim();
  if (!normalized) return null;
  const rows = await db
    .select()
    .from(quizSessions)
    .where(eq(quizSessions.pin, normalized))
    .limit(1);
  if (rows[0]) return rows[0];
  const keyRows = await db
    .select()
    .from(quizSessions)
    .where(eq(quizSessions.joinKeyword, normalized.toUpperCase()))
    .limit(1);
  return keyRows[0] ?? null;
}

export async function getSessionByJoinKey(key: string) {
  const normalized = key.trim().toUpperCase();
  if (!normalized) return null;
  const rows = await db.select().from(quizSessions).where(eq(quizSessions.joinKeyword, normalized)).limit(1);
  return rows[0] ?? null;
}

/**
 * Server-authoritative auto-reveal.
 *
 * When a question's deadline passes we move the session to `answer_reveal`
 * ourselves instead of waiting for the teacher to press a button. Every client
 * therefore flips to the result at the same moment, and the teacher stays in
 * control of when the NEXT question begins.
 *
 * Returns true when the state actually changed.
 */
export async function autoAdvanceIfExpired(sessionId: number): Promise<boolean> {
  const rows = await db.select().from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1);
  const session = rows[0];
  if (!session) return false;
  if (session.state !== "question_active") return false;
  if (session.pausedAt) return false; // teacher paused — freeze the clock
  if (!session.questionEndsAt) return false;

  // Small grace window so an answer sent right on the buzzer still counts.
  if (Date.now() < session.questionEndsAt.getTime() + 600) return false;

  await db
    .update(quizSessions)
    .set({ state: "answer_reveal", version: session.version + 1 })
    .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.state, "question_active")));
  return true;
}

export async function buildSnapshot(pin: string, viewerPlayerId?: number): Promise<Snapshot | null> {
  const session0 = await getSessionByPin(pin);
  if (session0) await autoAdvanceIfExpired(session0.id);
  const session = await getSessionByPin(pin);
  if (!session) return null;
  const quizRows = await db.select().from(quizzes).where(eq(quizzes.id, session.quizId)).limit(1);
  const quiz = quizRows[0];
  if (!quiz) return null;
  const settings = mergeSettings(quiz.settings);
  const qs = await loadQuizQuestions(quiz.id);
  const current = qs[session.currentIndex] ?? null;
  const revealed = ["answer_reveal", "score_update", "leaderboard", "quiz_complete"].includes(
    session.state,
  );
  const players = await db
    .select()
    .from(sessionPlayers)
    .where(and(eq(sessionPlayers.sessionId, session.id), eq(sessionPlayers.removed, false)));
  // Student clients do not need the entire class roster on every SSE event.
  // Keep the host view complete, while student snapshots contain a small
  // leaderboard window plus the current player. This dramatically reduces
  // payload size for large classrooms.
  const visiblePlayers = viewerPlayerId
    ? (() => {
        const sorted = [...players].sort((a, b) => b.score - a.score);
        const top = sorted.slice(0, 24);
        const me = sorted.find((p) => p.id === viewerPlayerId);
        return me && !top.some((p) => p.id === me.id) ? [...top, me] : top;
      })()
    : players;
  const teams = await db.select().from(sessionTeams).where(eq(sessionTeams.sessionId, session.id));
  // Current-question answers power the tally and per-player reveal outcome.
  const answers = await db
    .select()
    .from(playerAnswers)
    .where(
      and(eq(playerAnswers.sessionId, session.id), eq(playerAnswers.questionIndex, session.currentIndex)),
    );
  const tally = new Array<number>(current?.options.length ?? 0).fill(0);
  const outcomes: Record<
    number,
    { correct: boolean; points: number; answer: (string | number)[]; responseMs?: number }
  > = {};
  for (const a of answers) {
    const picked = (a.answer as (string | number)[]) ?? [];
    outcomes[a.playerId] = {
      correct: a.correct,
      points: a.points,
      answer: picked,
      responseMs: a.responseMs ?? undefined,
    };
    for (const v of picked) {
      const idx = Number(v);
      if (Number.isInteger(idx) && idx >= 0 && idx < tally.length) tally[idx] += 1;
    }
  }

  let theme: unknown = null;
  if (settings.templateId) {
    const t = await db
      .select({ config: quizTemplates.config })
      .from(quizTemplates)
      .where(eq(quizTemplates.id, settings.templateId))
      .limit(1);
    theme = t[0]?.config ?? null;
  }

  // Load all session answers to calculate Question Palette struggle metrics for teacher/host
  const allAnswers = await db
    .select({
      questionIndex: playerAnswers.questionIndex,
      correct: playerAnswers.correct,
      responseMs: playerAnswers.responseMs,
    })
    .from(playerAnswers)
    .where(eq(playerAnswers.sessionId, session.id));

  const statsByQuestion: Record<number, { answeredCount: number; correctCount: number; totalMs: number }> = {};
  for (const a of allAnswers) {
    if (!statsByQuestion[a.questionIndex]) {
      statsByQuestion[a.questionIndex] = { answeredCount: 0, correctCount: 0, totalMs: 0 };
    }
    const s = statsByQuestion[a.questionIndex];
    s.answeredCount += 1;
    if (a.correct) s.correctCount += 1;
    s.totalMs += (a.responseMs ?? 0);
  }

  const palette: LivePaletteItem[] = qs.map((q, i) => {
    const stat = statsByQuestion[i] || { answeredCount: 0, correctCount: 0, totalMs: 0 };
    const answered = stat.answeredCount;
    const correct = stat.correctCount;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
    const avgResponseMs = answered > 0 ? Math.round(stat.totalMs / answered) : null;
    const isCurrent = i === session.currentIndex;
    // Considered struggling if at least 1 student answered and accuracy is under 50%
    const isStruggling = answered >= 1 && (correct / answered) < 0.5;

    let qStatus: "upcoming" | "active" | "locked" | "revealed" | "completed" = "upcoming";
    if (isCurrent) {
      if (session.state === "question_active") qStatus = "active";
      else if (session.state === "answer_locked") qStatus = "locked";
      else if (["answer_reveal", "score_update", "leaderboard"].includes(session.state)) qStatus = "revealed";
      else if (session.state === "quiz_complete") qStatus = "completed";
      else qStatus = "active";
    } else if (i < session.currentIndex || answered > 0) {
      qStatus = "completed";
    } else {
      qStatus = "upcoming";
    }

    return {
      index: i,
      id: q.id,
      text: q.text,
      type: q.type,
      difficulty: q.difficulty,
      marks: q.marks,
      timer: q.timer,
      answeredCount: answered,
      correctCount: correct,
      accuracy,
      avgResponseMs,
      isStruggling,
      status: qStatus,
    };
  });

  return {
    session: {
      id: session.id,
      pin: session.pin,
      joinKeyword: session.joinKeyword ?? null,
      state: session.state,
      currentIndex: session.currentIndex,
      total: qs.length,
      lobbyLocked: session.lobbyLocked,
      showLeaderboard: session.showLeaderboard,
      teamMode: session.teamMode,
      endsAt: session.questionEndsAt ? session.questionEndsAt.toISOString() : null,
      startedAt: session.questionStartedAt ? session.questionStartedAt.toISOString() : null,
      paused: Boolean(session.pausedAt),
      version: session.version,
    },
    quiz: { id: quiz.id, title: quiz.title, description: quiz.description, settings },
    theme,
    question: current
      ? {
          ...current,
          correct: revealed ? current.correct : undefined,
          explanation: revealed ? current.explanation : null,
          hint: current.hint,
          revealed,
        }
      : null,
    players: visiblePlayers
      .map((p) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.score,
        streak: p.streak,
        correctCount: p.correctCount,
        answeredCount: p.answeredCount,
        teamId: p.teamId,
        connected: p.connected,
      }))
      .sort((a, b) => b.score - a.score),
    teams: teams.map((t) => ({ id: t.id, name: t.name, color: t.color, icon: t.icon, score: t.score })),
    // Counts stay hidden until reveal so nobody can infer the answer early.
    tally: revealed ? tally : [],
    answeredCount: answers.length,
    answeredBy: viewerPlayerId ? (answers.some((a) => a.playerId === viewerPlayerId) ? [viewerPlayerId] : []) : answers.map((a) => a.playerId),
    // Correctness stays hidden until the reveal so nobody can peek early.
    outcomes: revealed
      ? viewerPlayerId
        ? (outcomes[viewerPlayerId] ? { [viewerPlayerId]: outcomes[viewerPlayerId] } : {})
        : outcomes
      : {},
    palette: viewerPlayerId ? undefined : palette,
  };
}
