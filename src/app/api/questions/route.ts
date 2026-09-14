import { db } from "@/db";
import { questions, quizQuestions } from "@/db/schema";
import { fail, guard, ok, toCsv } from "@/lib/api";
import { isAdmin, isStaff, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { and, asc, count, desc, eq, gt, ilike, inArray, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(200, Math.max(5, Number(url.searchParams.get("limit") ?? 20)));
    const sort = url.searchParams.get("sort") ?? "new";
    const filters = [];
    for (const key of ["classId", "tradeId", "subjectId", "chapterId", "topicId", "createdBy"] as const) {
      const v = url.searchParams.get(key);
      if (v) filters.push(eq(questions[key], Number(v)));
    }
    for (const key of ["difficulty", "type", "source", "status"] as const) {
      const v = url.searchParams.get(key);
      if (v) filters.push(eq(questions[key], v));
    }
    const used = url.searchParams.get("used");
    if (used === "yes") filters.push(gt(questions.usedCount, 0));
    if (used === "no") filters.push(eq(questions.usedCount, 0));
    if (q) filters.push(ilike(questions.text, `%${q}%`));
    const where = filters.length ? and(...filters) : undefined;

    const orderBy =
      sort === "old"
        ? asc(questions.createdAt)
        : sort === "marks"
          ? desc(questions.marks)
          : sort === "used"
            ? desc(questions.usedCount)
            : desc(questions.id);

    const rows = await db
      .select()
      .from(questions)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);
    const totalRow = await db.select({ c: count() }).from(questions).where(where);
    const total = totalRow[0]?.c ?? 0;

    if (url.searchParams.get("format") === "csv") {
      const csv = toCsv(
        rows.map((r) => ({
          id: r.id,
          text: r.text,
          type: r.type,
          options: JSON.stringify(r.options),
          correct: JSON.stringify(r.correct),
          explanation: r.explanation ?? "",
          difficulty: r.difficulty,
          marks: r.marks,
          timer: r.timer,
        })),
      );
      return new Response(csv, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": "attachment; filename=questions.csv",
        },
      });
    }

    return ok({ rows, total, page, limit, pages: Math.ceil(total / limit) });
  });
}

/** Word-overlap similarity (Jaccard) — cheap and good enough for near-dupes. */
function similarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s.toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );
  const A = norm(a);
  const B = norm(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / (A.size + B.size - shared);
}


function jsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

function jsonObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }
  return null;
}

/** Only fields that actually exist in the questions table may reach Drizzle. */
function sanitizeQuestionData(input: Record<string, unknown>, userId: number) {
  const out: Record<string, unknown> = {};
  const scalar = ["text", "type", "explanation", "hint", "objective", "difficulty", "language", "source", "status"] as const;
  for (const key of scalar) if (input[key] !== undefined) out[key] = input[key];
  for (const key of ["marks", "timer", "classId", "tradeId", "subjectId", "chapterId", "topicId", "usedCount"] as const) {
    if (input[key] !== undefined) out[key] = input[key] == null ? null : Number(input[key]);
  }
  if (input.options !== undefined) out.options = jsonArray(input.options).map(String).map(x => x.trim()).filter(Boolean);
  if (input.correct !== undefined) out.correct = jsonArray(input.correct);
  if (input.media !== undefined) out.media = jsonObject(input.media);
  if (input.qualityFlags !== undefined) out.qualityFlags = jsonArray(input.qualityFlags);
  if (out.createdBy === undefined && userId) out.createdBy = userId;
  return out;
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);
    const body = (await req.json()) as {
      op: "create" | "update" | "delete" | "bulk" | "duplicate" | "findDuplicates";
      id?: number;
      ids?: number[];
      data?: Record<string, unknown>;
      action?: string;
      value?: unknown;
      quizId?: number;
    };

    if (body.op === "findDuplicates") {
      // Scan the bank for near-identical questions so teachers can prune.
      const scope = body.ids?.length
        ? await db.select().from(questions).where(inArray(questions.id, body.ids))
        : await db.select().from(questions).orderBy(desc(questions.id)).limit(600);
      const threshold = Math.min(0.95, Math.max(0.5, Number(body.value) || 0.75));

      const pairs: {
        a: { id: number; text: string };
        b: { id: number; text: string };
        score: number;
      }[] = [];
      for (let i = 0; i < scope.length; i++) {
        for (let j = i + 1; j < scope.length; j++) {
          const score = similarity(scope[i].text, scope[j].text);
          if (score >= threshold) {
            pairs.push({
              a: { id: scope[i].id, text: scope[i].text },
              b: { id: scope[j].id, text: scope[j].text },
              score: Number(score.toFixed(2)),
            });
          }
        }
        if (pairs.length > 200) break;
      }
      return ok({ scanned: scope.length, pairs: pairs.sort((x, y) => y.score - x.score).slice(0, 100) });
    }

    if (body.op === "create") {
      const textValue = String(body.data?.text ?? "").trim();
      if (!textValue) return fail("প্রশ্ন লিখুন");
      const normalized = sanitizeQuestionData(body.data ?? {}, user.id);
      const options = Array.isArray(normalized.options) ? normalized.options : [];
      const correct = Array.isArray(normalized.correct) ? normalized.correct : [];
      if (String(normalized.type ?? "mcq") === "mcq" && (options.length < 2 || !correct.length)) return fail("MCQ-তে অন্তত ২টি অপশন ও সঠিক উত্তর দিন");
      const inserted = await db.insert(questions)
        .values(normalized as typeof questions.$inferInsert)
        .$returningId();
      const row = inserted[0] ? (await db.select().from(questions).where(eq(questions.id, inserted[0].id)).limit(1))[0] : null;
      if (!row) return fail("প্রশ্ন যোগ করা যায়নি", 500);
      await audit(user.id, "question.create", "questions", row.id);
      return ok(row);
    }
    if (body.op === "update" && body.id) {
      const existing = (await db.select({ id: questions.id, createdBy: questions.createdBy }).from(questions).where(eq(questions.id, body.id)).limit(1))[0];
      if (!existing) return fail("Not found", 404);
      if (!isAdmin(user.role) && existing.createdBy && existing.createdBy !== user.id) return fail("নিজের প্রশ্নই সম্পাদনা করতে পারবেন", 403);
      await db.update(questions).set(sanitizeQuestionData(body.data ?? {}, existing.createdBy ?? user.id) as never).where(eq(questions.id, body.id));
      const row = (await db.select().from(questions).where(eq(questions.id, body.id)).limit(1))[0];
      if (!row) return fail("আপডেট করা যায়নি", 500);
      await audit(user.id, "question.update", "questions", body.id);
      return ok(row);
    }
    if (body.op === "duplicate" && body.id) {
      const src = await db.select().from(questions).where(eq(questions.id, body.id)).limit(1);
      if (!src[0]) return fail("Not found", 404);
      const { id: _id, createdAt: _c, ...rest } = src[0];
      void _id;
      void _c;
      const inserted = await db.insert(questions)
        .values({ ...rest, text: `${rest.text} (কপি)`, usedCount: 0, createdBy: user.id })
        .$returningId();
      const row = inserted[0] ? (await db.select().from(questions).where(eq(questions.id, inserted[0].id)).limit(1))[0] : null;
      if (!row) return fail("কপি করা যায়নি", 500);
      await audit(user.id, "question.duplicate", "questions", row.id, { sourceId: body.id });
      return ok(row);
    }
    if (body.op === "delete" && body.id) {
      const existing = (await db.select({ id: questions.id, createdBy: questions.createdBy }).from(questions).where(eq(questions.id, body.id)).limit(1))[0];
      if (!existing) return fail("Not found", 404);
      if (!isAdmin(user.role) && existing.createdBy && existing.createdBy !== user.id) return fail("নিজের প্রশ্নই মুছতে পারবেন", 403);
      await db.delete(quizQuestions).where(eq(quizQuestions.questionId, body.id));
      await db.delete(questions).where(eq(questions.id, body.id));
      await audit(user.id, "question.delete", "questions", body.id);
      return ok({ ok: true, id: body.id });
    }
    if (body.op === "bulk" && body.ids?.length) {
      const ids = body.ids;
      switch (body.action) {
        case "delete":
          await db.delete(quizQuestions).where(inArray(quizQuestions.questionId, ids));
          await db.delete(questions).where(inArray(questions.id, ids));
          await audit(user.id, "question.bulk_delete", "questions", null, { ids });
          return ok({ ok: true, affected: ids.length });
        case "difficulty":
          await db.update(questions).set({ difficulty: String(body.value) }).where(inArray(questions.id, ids));
          await audit(user.id, "question.bulk_difficulty", "questions", null, { ids, value: body.value });
          return ok({ ok: true });
        case "marks":
          await db.update(questions).set({ marks: Number(body.value) }).where(inArray(questions.id, ids));
          await audit(user.id, "question.bulk_marks", "questions", null, { ids, value: body.value });
          return ok({ ok: true });
        case "subject":
          await db.update(questions).set({ subjectId: Number(body.value) }).where(inArray(questions.id, ids));
          await audit(user.id, "question.bulk_subject", "questions", null, { ids, value: body.value });
          return ok({ ok: true });
        case "explanations": {
          const rows = await db.select().from(questions).where(inArray(questions.id, ids));
          for (const r of rows) {
            if (!r.explanation) {
              await db
                .update(questions)
                .set({
                  explanation: `সঠিক উত্তরটি "${(r.options as string[])[Number((r.correct as number[])[0]) || 0] ?? ""}" — এটি মূল ধারণার সাথে সামঞ্জস্যপূর্ণ।`,
                })
                .where(eq(questions.id, r.id));
            }
          }
          return ok({ ok: true });
        }
        case "duplicate": {
          const rows = await db.select().from(questions).where(inArray(questions.id, ids));
          await db.insert(questions).values(
            rows.map(({ id: _i, createdAt: _c, ...rest }) => {
              void _i;
              void _c;
              return { ...rest, text: `${rest.text} (কপি)`, usedCount: 0, createdBy: user.id };
            }),
          );
          return ok({ ok: true });
        }
        case "addToQuiz": {
          if (!body.quizId) return fail("quizId required");
          const maxRow = await db
            .select({ m: sql<number>`coalesce(max(${quizQuestions.orderIndex}), -1)` })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, body.quizId));
          let order = (maxRow[0]?.m ?? -1) + 1;
          await db
            .insert(quizQuestions)
            .values(ids.map((qid) => ({ quizId: body.quizId!, questionId: qid, orderIndex: order++ })));
          await db
            .update(questions)
            .set({ usedCount: sql`${questions.usedCount} + 1` })
            .where(inArray(questions.id, ids));
          return ok({ ok: true, added: ids.length });
        }
        default:
          return fail("Unknown bulk action");
      }
    }
    return fail("Unknown op");
  });
}
