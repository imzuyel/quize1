import { db } from "@/db";
import {
  examAnswers,
  examAttempts,
  pdfLibrary,
  playerAnswers,
  questions,
  quizPresets,
  quizQuestions,
  quizResults,
  quizSections,
  quizSessions,
  quizzes,
  sessionPlayers,
  sessionReactions,
  sessionTeams,
} from "@/db/schema";
import { fail, guard, ok } from "@/lib/api";
import { isAdmin, isStaff, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { DEFAULT_SETTINGS, EXAM_SETTINGS, loadQuizQuestions } from "@/lib/live";
import { clearScheduled, publish } from "@/lib/realtime";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const rows = await db.select().from(quizzes).where(eq(quizzes.id, Number(id))).limit(1);
      const quiz = rows[0];
      if (!quiz) return fail("Not found", 404);
      const list = await loadQuizQuestions(quiz.id);
      const rounds = await db
        .select()
        .from(quizSections)
        .where(eq(quizSections.quizId, quiz.id))
        .orderBy(asc(quizSections.orderIndex));

      let pdfSource = null;
      if (quiz.pdfSourceId) {
        const pdfRows = await db.select().from(pdfLibrary).where(eq(pdfLibrary.id, quiz.pdfSourceId)).limit(1);
        if (pdfRows.length > 0) pdfSource = pdfRows[0];
      }

      const isOwner = isStaff(user.role);
      return ok({
        quiz,
        rounds,
        pdfSource,
        questions: isOwner ? list : list.map(({ correct: _c, explanation: _e, ...rest }) => { void _c; void _e; return rest; }),
      });
    }
    const mode = url.searchParams.get("mode");
    const mine = url.searchParams.get("mine");
    const filters = [];
    if (mode) filters.push(eq(quizzes.mode, mode));
    if (mine === "1" && isStaff(user.role)) {
      filters.push(or(eq(quizzes.createdBy, user.id), eq(quizzes.status, "published")));
    } else if (!isStaff(user.role)) {
      filters.push(eq(quizzes.status, "published"));
    }
    const rows = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        mode: quizzes.mode,
        status: quizzes.status,
        classId: quizzes.classId,
        pdfSourceId: quizzes.pdfSourceId,
        durationMinutes: quizzes.durationMinutes,
        scheduledAt: quizzes.scheduledAt,
        createdBy: quizzes.createdBy,
        createdAt: quizzes.createdAt,
        settings: quizzes.settings,
        questionCount: sql<number>`(select count(*) from quiz_questions qq where qq.quiz_id = ${quizzes.id})`,
      })
      .from(quizzes)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(quizzes.id))
      .limit(200);
    const presets = await db.select().from(quizPresets).limit(50);
    return ok({ rows, presets });
  });
}


function sanitizeQuizPatch(input: Record<string, unknown>) {
  const allowed = ["title", "description", "mode", "classId", "tradeId", "templateId", "pdfSourceId", "settings", "status", "scheduledAt", "durationMinutes"] as const;
  const out: Record<string, unknown> = {};
  for (const key of allowed) if (input[key] !== undefined) {
    let value = input[key];
    if (key === "settings" && typeof value === "string") {
      try { value = JSON.parse(value); } catch { value = {}; }
    }
    if (["classId", "tradeId", "templateId", "pdfSourceId", "durationMinutes"].includes(key)) value = value == null || value === "" ? null : Number(value);
    out[key] = value;
  }
  return out;
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);
    const body = (await req.json()) as {
      op: string;
      id?: number;
      data?: Record<string, unknown>;
      questionIds?: number[];
      order?: number[];
      sectionId?: number | null;
      name?: string;
      settings?: Record<string, unknown>;
      bundle?: unknown;
    };

    const canManageQuiz = async (quizId: number) => {
      const q = (await db.select({ id: quizzes.id, createdBy: quizzes.createdBy }).from(quizzes).where(eq(quizzes.id, quizId)).limit(1))[0];
      if (!q) return { ok: false as const, quiz: null };
      if (!isAdmin(user.role) && q.createdBy !== user.id) return { ok: false as const, quiz: q };
      return { ok: true as const, quiz: q };
    };

    switch (body.op) {
      case "create": {
        const mode = String(body.data?.mode ?? "live");
        const inserted = await db
          .insert(quizzes)
          .values({
            title: String(body.data?.title ?? "নতুন কুইজ"),
            description: (body.data?.description as string) ?? "",
            mode,
            classId: (body.data?.classId as number) ?? null,
            tradeId: (body.data?.tradeId as number) ?? null,
            pdfSourceId: body.data?.pdfSourceId ? Number(body.data.pdfSourceId) : null,
            durationMinutes: (body.data?.durationMinutes as number) ?? 30,
            settings: (body.data?.settings as object) ?? (mode === "exam" ? EXAM_SETTINGS : DEFAULT_SETTINGS),
            createdBy: user.id,
            status: "draft",
          })
          .$returningId();
        const row = inserted[0] ? (await db.select().from(quizzes).where(eq(quizzes.id, inserted[0].id)).limit(1))[0] : null;
        if (!row) return fail("কুইজ তৈরি করা যায়নি", 500);
        if (body.questionIds?.length) {
          await db.insert(quizQuestions).values(body.questionIds.map((qid, i) => ({ quizId: row.id, questionId: qid, orderIndex: i })));
        }
        return ok(row);
      }
      case "update": {
        if (!body.id) return fail("id required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("এই কুইজ পরিচালনার অনুমতি নেই", 403);
        await db.update(quizzes).set(sanitizeQuizPatch(body.data ?? {}) as never).where(eq(quizzes.id, body.id));
        const row = (await db.select().from(quizzes).where(eq(quizzes.id, body.id)).limit(1))[0];
        if (!row) return fail("কুইজ আপডেট করা যায়নি", 500);
        await audit(user.id, "quiz.update", "quizzes", body.id);
        return ok(row);
      }
      case "delete": {
        if (!body.id) return fail("id required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("এই কুইজ মুছার অনুমতি নেই", 403);

        // Find and delete any active or past live sessions for this quiz
        const sessions = await db.select().from(quizSessions).where(eq(quizSessions.quizId, body.id));
        for (const s of sessions) {
          clearScheduled(`reveal:${s.pin}`);
          publish(`session:${s.pin}`, "deleted", { pin: s.pin, deleted: true, message: "কুইজটি ডিলিট করা হয়েছে" });
          await db.delete(playerAnswers).where(eq(playerAnswers.sessionId, s.id));
          await db.delete(sessionReactions).where(eq(sessionReactions.sessionId, s.id));
          await db.delete(sessionPlayers).where(eq(sessionPlayers.sessionId, s.id));
          await db.delete(sessionTeams).where(eq(sessionTeams.sessionId, s.id));
          await db.delete(quizResults).where(eq(quizResults.sessionId, s.id));
        }
        await db.delete(quizSessions).where(eq(quizSessions.quizId, body.id));
        await db.delete(quizResults).where(eq(quizResults.quizId, body.id));

        // Delete any exam attempts and answers
        const attempts = await db.select({ id: examAttempts.id }).from(examAttempts).where(eq(examAttempts.quizId, body.id));
        if (attempts.length > 0) {
          const attemptIds = attempts.map((a) => a.id);
          await db.delete(examAnswers).where(inArray(examAnswers.attemptId, attemptIds));
          await db.delete(examAttempts).where(eq(examAttempts.quizId, body.id));
        }

        await db.delete(quizQuestions).where(eq(quizQuestions.quizId, body.id));
        await db.delete(quizSections).where(eq(quizSections.quizId, body.id));
        await db.delete(quizzes).where(eq(quizzes.id, body.id));
        await audit(user.id, "quiz.delete", "quizzes", body.id);
        return ok({ ok: true, id: body.id });
      }
      case "duplicate": {
        if (!body.id) return fail("id required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("এই কুইজ কপি করার অনুমতি নেই", 403);
        const src = (await db.select().from(quizzes).where(eq(quizzes.id, body.id)).limit(1))[0];
        if (!src) return fail("Not found", 404);
        const insertedCopy = await db
          .insert(quizzes)
          .values({
            title: `${src.title} (কপি)`,
            description: src.description,
            mode: src.mode,
            classId: src.classId,
            tradeId: src.tradeId,
            settings: src.settings as object,
            durationMinutes: src.durationMinutes,
            createdBy: user.id,
            status: "draft",
          })
          .$returningId();
        const copy = insertedCopy[0] ? (await db.select().from(quizzes).where(eq(quizzes.id, insertedCopy[0].id)).limit(1))[0] : null;
        if (!copy) return fail("কুইজ কপি করা যায়নি", 500);
        const qq = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, src.id));
        if (qq.length)
          await db
            .insert(quizQuestions)
            .values(qq.map((q) => ({ quizId: copy.id, questionId: q.questionId, orderIndex: q.orderIndex, marks: q.marks, timer: q.timer, settings: q.settings })));
        await audit(user.id, "quiz.duplicate", "quizzes", copy.id, { sourceId: body.id });
        return ok(copy);
      }
      case "createQuestion": {
        if (!body.id) return fail("quiz id required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("এই কুইজ সম্পাদনার অনুমতি নেই", 403);
        const d = body.data ?? {};
        const text = String(d.text ?? "").trim();
        if (text.length < 3) return fail("প্রশ্নটি লিখুন");
        const type = String(d.type ?? "mcq");
        const options = Array.isArray(d.options) ? d.options.map(String).map(x => x.trim()).filter(Boolean) : [];
        const correct = Array.isArray(d.correct) ? d.correct : [0];
        if (["mcq", "multi_select", "true_false", "puzzle", "matching", "ordering"].includes(type) && options.length < 2)
          return fail("কমপক্ষে ২টি অপশন দিন");
        const inserted = await db.insert(questions).values({
          text, type, options, correct,
          explanation: d.explanation ? String(d.explanation) : null,
          hint: d.hint ? String(d.hint) : null,
          difficulty: ["easy", "medium", "hard"].includes(String(d.difficulty)) ? String(d.difficulty) : "medium",
          marks: Number(d.marks) > 0 ? Number(d.marks) : 1,
          timer: Math.max(5, Math.min(300, Number(d.timer) || 30)),
          language: String(d.language ?? "bn"),
          media: (d.media as object) ?? null,
          createdBy: user.id, source: String(d.source ?? "manual"), status: "published",
        }).$returningId();
        const qid = inserted[0]?.id;
        if (!qid) return fail("প্রশ্ন তৈরি করা যায়নি", 500);
        const maxRow = await db.select({ m: sql<number>`coalesce(max(${quizQuestions.orderIndex}), -1)` }).from(quizQuestions).where(eq(quizQuestions.quizId, body.id));
        await db.insert(quizQuestions).values({ quizId: body.id, questionId: qid, orderIndex: Number(maxRow[0]?.m ?? -1) + 1, marks: Number(d.marks) || 1, timer: Math.max(5, Math.min(300, Number(d.timer) || 30)), settings: (d.settings as object) ?? {} });
        await audit(user.id, "quiz.question.create", "quizzes", body.id, { questionId: qid, source: d.source ?? "manual" });
        const row = (await db.select().from(questions).where(eq(questions.id, qid)).limit(1))[0];
        return ok(row);
      }
      case "addQuestions": {
        if (!body.id || !body.questionIds?.length) return fail("id and questionIds required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("এই কুইজ সম্পাদনার অনুমতি নেই", 403);
        const uniqueIds = [...new Set(body.questionIds.map(Number).filter(Boolean))];
        const existingLinks = await db.select({ questionId: quizQuestions.questionId }).from(quizQuestions).where(eq(quizQuestions.quizId, body.id));
        const existingSet = new Set(existingLinks.map((x) => x.questionId));
        const freshIds = uniqueIds.filter((id) => !existingSet.has(id));
        if (!freshIds.length) return ok({ ok: true, added: 0 });
        const maxRow = await db
          .select({ m: sql<number>`coalesce(max(${quizQuestions.orderIndex}), -1)` })
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, body.id));
        let order = (maxRow[0]?.m ?? -1) + 1;
        await db.insert(quizQuestions).values(
          freshIds.map((qid) => ({
            quizId: body.id!,
            questionId: qid,
            orderIndex: order++,
            sectionId: body.sectionId ?? null,
          })),
        );
        await db
          .update(questions)
          .set({ usedCount: sql`${questions.usedCount} + 1` })
          .where(inArray(questions.id, freshIds));
        await audit(user.id, "quiz.questions.add", "quizzes", body.id, { count: freshIds.length });
        return ok({ ok: true, added: freshIds.length });
      }
      case "removeQuestion": {
        if (!body.id || !body.questionIds?.length) return fail("params required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("অনুমতি নেই", 403);
        await db
          .delete(quizQuestions)
          .where(and(eq(quizQuestions.quizId, body.id), inArray(quizQuestions.questionId, body.questionIds)));
        await db.update(questions).set({ usedCount: sql`greatest(${questions.usedCount} - 1, 0)` }).where(inArray(questions.id, body.questionIds));
        return ok({ ok: true, removed: body.questionIds.length });
      }
      case "reorder": {
        if (!body.id || !body.order) return fail("params required");
        for (let i = 0; i < body.order.length; i++) {
          await db
            .update(quizQuestions)
            .set({ orderIndex: i })
            .where(and(eq(quizQuestions.quizId, body.id), eq(quizQuestions.questionId, body.order[i])));
        }
        return ok({ ok: true });
      }
      case "questionOverride": {
        if (!body.id || !body.questionIds?.length) return fail("params required");
        await db
          .update(quizQuestions)
          .set({ marks: (body.data?.marks as number) ?? null, timer: (body.data?.timer as number) ?? null, settings: (body.data?.settings as object) ?? {} })
          .where(and(eq(quizQuestions.quizId, body.id), eq(quizQuestions.questionId, body.questionIds[0])));
        return ok({ ok: true });
      }
      case "addRound": {
        if (!body.id) return fail("id required");
        const existing = await db.select().from(quizSections).where(eq(quizSections.quizId, body.id));
        const inserted = await db
          .insert(quizSections)
          .values({ quizId: body.id, name: body.name ?? `রাউন্ড ${existing.length + 1}`, orderIndex: existing.length, settings: body.settings ?? {} })
          .$returningId();
        const row = inserted[0] ? (await db.select().from(quizSections).where(eq(quizSections.id, inserted[0].id)).limit(1))[0] : null;
        return row ? ok(row) : fail("রাউন্ড তৈরি করা যায়নি", 500);
      }
      case "updateRound": {
        if (!body.id) return fail("id required");
        await db.update(quizSections).set({ name: body.name, settings: body.settings ?? {} }).where(eq(quizSections.id, body.id));
        const row = (await db.select().from(quizSections).where(eq(quizSections.id, body.id)).limit(1))[0];
        return row ? ok(row) : fail("রাউন্ড পাওয়া যায়নি", 404);
      }
      case "deleteRound": {
        if (!body.id) return fail("id required");
        await db.delete(quizSections).where(eq(quizSections.id, body.id));
        return ok({ ok: true });
      }
      case "publish": {
        if (!body.id) return fail("id required");
        const access = await canManageQuiz(body.id);
        if (!access.quiz) return fail("কুইজ পাওয়া যায়নি", 404);
        if (!access.ok) return fail("অনুমতি নেই", 403);
        const countRow = await db.select({ c: sql<number>`count(*)` }).from(quizQuestions).where(eq(quizQuestions.quizId, body.id));
        if (Number(countRow[0]?.c ?? 0) < 1) return fail("Publish করার আগে অন্তত ১টি প্রশ্ন যোগ করুন");
        await db.update(quizzes).set({ status: "published" }).where(eq(quizzes.id, body.id));
        const row = (await db.select().from(quizzes).where(eq(quizzes.id, body.id)).limit(1))[0];
        await audit(user.id, "quiz.publish", "quizzes", body.id);
        return row ? ok(row) : fail("কুইজ প্রকাশ করা যায়নি", 500);
      }
      case "export": {
        if (!body.id) return fail("id required");
        const src = (await db.select().from(quizzes).where(eq(quizzes.id, body.id)).limit(1))[0];
        if (!src) return fail("Not found", 404);
        const list = await loadQuizQuestions(src.id);
        // Self-contained bundle: re-importable on any PGTSC install.
        return ok({
          format: "pgtsc-quiz",
          version: 1,
          exportedAt: new Date().toISOString(),
          quiz: {
            title: src.title,
            description: src.description,
            mode: src.mode,
            settings: src.settings,
            durationMinutes: src.durationMinutes,
          },
          questions: list.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            hint: q.hint,
            marks: q.marks,
            timer: q.timer,
            difficulty: q.difficulty,
          })),
        });
      }

      case "import": {
        const bundle = body.bundle as {
          format?: string;
          quiz?: Record<string, unknown>;
          questions?: Record<string, unknown>[];
        };
        if (!bundle || bundle.format !== "pgtsc-quiz")
          return fail("ফাইলটি বৈধ PGTSC কুইজ ফাইল নয়");
        const rows = Array.isArray(bundle.questions) ? bundle.questions : [];
        if (!rows.length) return fail("ফাইলে কোনো প্রশ্ন নেই");
        if (rows.length > 2000) return fail("একবারে সর্বোচ্চ ২০০০টি প্রশ্ন");

        const createdIds = await db
          .insert(quizzes)
          .values({ title: String(bundle.quiz?.title ?? "আমদানিকৃত কুইজ"), description: String(bundle.quiz?.description ?? ""), mode: String(bundle.quiz?.mode ?? "live"), settings: (bundle.quiz?.settings as object) ?? DEFAULT_SETTINGS, durationMinutes: Number(bundle.quiz?.durationMinutes) || 30, createdBy: user.id, status: "draft" })
          .$returningId();
        const created = createdIds[0] ? (await db.select().from(quizzes).where(eq(quizzes.id, createdIds[0].id)).limit(1))[0] : null;
        if (!created) return fail("কুইজ তৈরি করা যায়নি", 500);

        const insertedIds = await db
          .insert(questions)
          .values(
            rows.map((q) => ({
              text: String(q.text ?? "").slice(0, 2000),
              type: String(q.type ?? "mcq"),
              options: Array.isArray(q.options) ? q.options : [],
              correct: Array.isArray(q.correct) ? q.correct : [0],
              explanation: q.explanation ? String(q.explanation) : null,
              hint: q.hint ? String(q.hint) : null,
              marks: Number(q.marks) || 1,
              timer: Math.max(5, Math.min(300, Number(q.timer) || 30)),
              difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty))
                ? String(q.difficulty)
                : "medium",
              createdBy: user.id,
              source: "manual",
              status: "published",
            })),
          )
          .$returningId();
        await db.insert(quizQuestions).values(insertedIds.map((q, i) => ({ quizId: created.id, questionId: q.id, orderIndex: i, settings: {} })));
        return ok({ id: created.id, imported: insertedIds.length });
      }

      case "savePreset": {
        const inserted = await db.insert(quizPresets).values({ name: body.name ?? "নতুন প্রিসেট", settings: body.settings ?? {}, ownerId: user.id }).$returningId();
        const row = inserted[0] ? (await db.select().from(quizPresets).where(eq(quizPresets.id, inserted[0].id)).limit(1))[0] : null;
        return row ? ok(row) : fail("প্রিসেট তৈরি করা যায়নি", 500);
      }
      case "deletePreset": {
        if (!body.id) return fail("id required");
        await db.delete(quizPresets).where(eq(quizPresets.id, body.id));
        return ok({ ok: true });
      }
      default:
        return fail("Unknown op");
    }
  });
}
