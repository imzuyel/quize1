import { db } from "@/db";
import { publicReviews } from "@/db/schema";
import { getCurrentUser, isStaff, requireUser } from "@/lib/auth";
import { fail, guard, ok } from "@/lib/api";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const admin = new URL(req.url).searchParams.get("admin") === "1";
    if (admin) { const me = await requireUser(); if (!isStaff(me.role)) return fail("Forbidden", 403); }
    const rows = await db.select().from(publicReviews).where(admin ? undefined : eq(publicReviews.status, "approved")).orderBy(desc(publicReviews.createdAt)).limit(100);
    return ok({ reviews: rows });
  });
}

export async function POST(req: Request) {
  return guard(async () => {
    const body = await req.json() as Record<string, unknown>;
    const op = String(body.op ?? "create");
    if (op === "create") {
      const name = String(body.name ?? "Guest").trim().slice(0, 80) || "Guest";
      const comment = String(body.comment ?? "").trim().slice(0, 1000);
      if (comment.length < 3) return fail("Review is too short");
      const rating = Math.max(1, Math.min(5, Number(body.rating ?? 5)));
      await db.insert(publicReviews).values({ name, comment, rating, quizId: body.quizId ? Number(body.quizId) : null, eventId: body.eventId ? Number(body.eventId) : null, status: "pending" });
      return ok({ ok: true, message: "Review submitted for moderation" });
    }
    const me = await requireUser();
    if (!isStaff(me.role)) return fail("Forbidden", 403);
    if (op === "moderate") {
      await db.update(publicReviews).set({ status: String(body.status ?? "approved"), featured: Boolean(body.featured ?? false) }).where(eq(publicReviews.id, Number(body.id)));
      return ok({ ok: true });
    }
    if (op === "delete") { await db.delete(publicReviews).where(eq(publicReviews.id, Number(body.id))); return ok({ ok: true }); }
    return fail("Unknown operation");
  });
}
