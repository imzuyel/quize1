import { db } from "@/db";
import { galleryEvents, galleryPhotos, quizzes } from "@/db/schema";
import { getCurrentUser, isStaff, requireUser } from "@/lib/auth";
import { fail, guard, ok } from "@/lib/api";
import { desc, eq } from "drizzle-orm";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

export async function GET(req: Request) {
  return guard(async () => {
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "1";
    if (admin) {
      const me = await requireUser();
      if (!isStaff(me.role)) return fail("Forbidden", 403);
    }
    const rows = await db.select().from(galleryEvents).where(admin ? undefined : eq(galleryEvents.published, true)).orderBy(desc(galleryEvents.eventDate)).limit(100);
    const eventIds = rows.map((r) => r.id);
    const photos = eventIds.length ? await db.select().from(galleryPhotos).where(eq(galleryPhotos.eventId, eventIds[0])) : [];
    // Fetch all photos without relying on an IN helper, keeping compatibility with this project's Drizzle setup.
    const allPhotos: typeof photos = [];
    for (const id of eventIds) allPhotos.push(...await db.select().from(galleryPhotos).where(eq(galleryPhotos.eventId, id)));
    return ok({ events: rows.map((event) => ({ ...event, photos: allPhotos.filter((p) => p.eventId === event.id) })) });
  });
}

export async function POST(req: Request) {
  return guard(async () => {
    const me = await requireUser();
    if (!isStaff(me.role)) return fail("Forbidden", 403);
    const body = await req.json() as Record<string, unknown>;
    const op = String(body.op ?? "create");

    if (op === "create") {
      const title = String(body.title ?? "").trim();
      if (!title) return fail("Event title required");
      const inserted = await db.insert(galleryEvents).values({
        title,
        caption: String(body.caption ?? "").trim() || null,
        eventDate: body.eventDate ? new Date(String(body.eventDate)) : new Date(),
        quizId: body.quizId ? Number(body.quizId) : null,
        teacherId: me.id,
        className: String(body.className ?? "").trim() || null,
        participantCount: Math.max(0, Number(body.participantCount ?? 0)),
        published: true,
      }).$returningId();
      return ok({ id: inserted[0]?.id });
    }

    if (op === "upload") {
      const eventId = Number(body.eventId);
      const dataUrl = String(body.dataUrl ?? "");
      if (!eventId || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(dataUrl)) return fail("Only JPEG, PNG or WebP images are supported");
      const event = (await db.select().from(galleryEvents).where(eq(galleryEvents.id, eventId)).limit(1))[0];
      if (!event) return fail("Event not found", 404);
      if (event.teacherId !== me.id && !["admin", "super_admin"].includes(me.role)) return fail("Forbidden", 403);
      const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
      if (!match) return fail("Invalid image");
      const ext = match[1].toLowerCase() === "jpg" ? "jpg" : match[1].toLowerCase();
      const buf = Buffer.from(match[2], "base64");
      if (buf.length > 3_500_000) return fail("Image is still too large. Please upload a smaller image.");
      const id = crypto.randomBytes(8).toString("hex");
      const dir = path.join(process.cwd(), "public", "uploads", "gallery", String(eventId));
      await fs.mkdir(dir, { recursive: true });
      const file = `/uploads/gallery/${eventId}/${safe(String(body.name ?? "photo"))}-${id}.${ext}`;
      await fs.writeFile(path.join(process.cwd(), "public", file), buf);
      const thumb = file;
      const inserted = await db.insert(galleryPhotos).values({ eventId, optimizedPath: file, thumbPath: thumb, originalPath: null, altText: String(body.altText ?? event.title), width: Number(body.width ?? 0), height: Number(body.height ?? 0), bytes: buf.length, sortOrder: Number(body.sortOrder ?? 0), featured: Boolean(body.featured ?? false) }).$returningId();
      return ok({ id: inserted[0]?.id, path: file, bytes: buf.length });
    }

    if (op === "deletePhoto") {
      const id = Number(body.id);
      const rows = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id)).limit(1);
      const photo = rows[0];
      if (!photo) return fail("Photo not found", 404);
      const event = (await db.select().from(galleryEvents).where(eq(galleryEvents.id, photo.eventId)).limit(1))[0];
      if (!event || (event.teacherId !== me.id && !["admin", "super_admin"].includes(me.role))) return fail("Forbidden", 403);
      await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
      try { await fs.unlink(path.join(process.cwd(), "public", photo.optimizedPath)); } catch {}
      return ok({ ok: true });
    }

    if (op === "publish") {
      const id = Number(body.id);
      await db.update(galleryEvents).set({ published: Boolean(body.published ?? true) }).where(eq(galleryEvents.id, id));
      return ok({ ok: true });
    }
    return fail("Unknown operation");
  });
}
