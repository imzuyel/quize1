import { db } from "@/db";
import { chapters, classes, sections, subjects, topics, trades } from "@/db/schema";
import { fail, guard, ok } from "@/lib/api";
import { isAdmin, requireUser } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const TABLES = { classes, sections, trades, subjects, chapters, topics } as const;
type EntityKey = keyof typeof TABLES;

export async function GET() {
  return guard(async () =>
    ok({
      classes: await db.select().from(classes).orderBy(asc(classes.level)),
      sections: await db.select().from(sections).orderBy(asc(sections.name)),
      trades: await db.select().from(trades).orderBy(asc(trades.id)),
      subjects: await db.select().from(subjects).orderBy(asc(subjects.name)),
      chapters: await db.select().from(chapters).orderBy(asc(chapters.orderIndex)),
      topics: await db.select().from(topics).orderBy(asc(topics.id)),
    }),
  );
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isAdmin(user.role)) return fail("শুধুমাত্র অ্যাডমিন", 403);
    const body = (await req.json()) as {
      entity: EntityKey;
      op: "create" | "update" | "delete";
      id?: number;
      data?: Record<string, unknown>;
    };
    const table = TABLES[body.entity];
    if (!table) return fail("Unknown entity");

    if (body.op === "create") {
      if (!body.data || typeof body.data !== "object") return fail("data required");
      const name = String((body.data as Record<string, unknown>).name ?? "").trim();
      if (!name) return fail("নাম দিন");
      const existing = await db.select({ id: table.id }).from(table).where(eq(table.name, name)).limit(1);
      if (existing[0]) return fail("এই নামটি আগে থেকেই আছে");
      const inserted = await db.insert(table).values(body.data as never).$returningId();
      const row = inserted[0] ? (await db.select().from(table).where(eq(table.id, inserted[0].id)).limit(1))[0] : null;
      if (!row) return fail("তথ্য যোগ করা যায়নি", 500);
      await audit(user.id, "structure.create", body.entity, row.id);
      return ok(row);
    }
    if (body.op === "update") {
      if (!body.id) return fail("id required");
      if (!body.data || typeof body.data !== "object") return fail("data required");
      const name = String((body.data as Record<string, unknown>).name ?? "").trim();
      if (!name) return fail("নাম দিন");
      const existing = await db.select({ id: table.id }).from(table).where(eq(table.name, name)).limit(1);
      if (existing[0] && existing[0].id !== body.id) return fail("এই নামটি আগে থেকেই আছে");
      const changed = await db.update(table).set(body.data as never).where(eq(table.id, body.id));
      if (!changed) return fail("তথ্য পরিবর্তন করা যায়নি", 500);
      const row = (await db.select().from(table).where(eq(table.id, body.id)).limit(1))[0];
      if (!row) return fail("তথ্য পাওয়া যায়নি বা পরিবর্তন করা যায়নি", 404);
      await audit(user.id, "structure.update", body.entity, row.id);
      return ok(row);
    }
    if (body.op === "delete") {
      if (!body.id) return fail("id required");
      const existing = (await db.select({ id: table.id }).from(table).where(eq(table.id, body.id)).limit(1))[0];
      if (!existing) return fail("তথ্য পাওয়া যায়নি বা মুছতে পারা যায়নি", 404);
      await db.delete(table).where(eq(table.id, body.id));
      await audit(user.id, "structure.delete", body.entity, existing.id);
      return ok({ ok: true, id: existing.id });
    }
    return fail("Unknown op");
  });
}
