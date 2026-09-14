import { insertReturning, updateReturning } from "@/lib/mysql-returning";
import { db } from "@/db";
import { achievements, auditLogs, notifications, parentLinks, settings, users } from "@/db/schema";
import { fail, guard, ok } from "@/lib/api";
import { MIN_PASSWORD_LENGTH, generatePassword, hashPassword, isAdmin, requireUser } from "@/lib/auth";
import { invalidateFeatures } from "@/lib/features";
import { invalidateSeo } from "@/lib/seo";
import { audit } from "@/lib/audit";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") ?? "users";
    if (!isAdmin(user.role)) return fail("Forbidden", 403);
    if (scope === "settings") {
      const rows = await db.select().from(settings);
      return ok(Object.fromEntries(rows.map((r) => [r.key, r.value])));
    }
    if (scope === "audit") {
      const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.id)).limit(200);
      return ok({ rows });
    }
    if (scope === "achievements") {
      return ok(await db.select().from(achievements).orderBy(desc(achievements.id)));
    }
    const role = url.searchParams.get("role");
    const onlyPending = url.searchParams.get("status") === "pending";
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        studentId: users.studentId,
        role: users.role,
        classId: users.classId,
        sectionId: users.sectionId,
        tradeId: users.tradeId,
        roll: users.roll,
        xp: users.xp,
        level: users.level,
        active: users.active,
        status: users.status,
        createdAt: users.createdAt,
        rejectionNote: users.rejectionNote,
      })
      .from(users)
      .where(
        onlyPending
          ? eq(users.status, "pending")
          : role
            ? eq(users.role, role)
            : undefined,
      )
      .orderBy(desc(users.id))
      .limit(500);
    const links = await db.select().from(parentLinks);
    const pendingRow = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.status, "pending"));
    return ok({ rows, links, pendingCount: pendingRow.length });
  });
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    const body = (await req.json()) as Record<string, unknown>;
    const op = String(body.op ?? "");

    if (op === "saveSettings") {
      if (!isAdmin(user.role)) return fail("Forbidden", 403);
      const key = String(body.key);
      await db
        .insert(settings)
        .values({ key, value: (body.value as object) ?? {} })
        .onDuplicateKeyUpdate({ set: { value: (body.value as object) ?? {}, updatedAt: new Date() } });
      // Feature flags are cached — drop the cache so the change is instant.
      if (key === "features") invalidateFeatures();
      if (key === "seo") invalidateSeo();
      await audit(user.id, "settings.save", "settings", null, { key });
      return ok({ ok: true });
    }

    if (!isAdmin(user.role)) return fail("Forbidden", 403);

    switch (op) {
      case "createUser": {
        const email = String(body.email ?? "").toLowerCase();
        if (!email) return fail("ইমেইল দিন");
        const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (exists.length) return fail("এই ইমেইল আগে থেকেই আছে");
        const supplied = String(body.password ?? "").trim();
        if (supplied && supplied.length < MIN_PASSWORD_LENGTH)
          return fail(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে`);
        const initialPassword = supplied || generatePassword();
        const row = await insertReturning(users, {
            email,
            name: String(body.name ?? "নতুন ইউজার"),
            role: String(body.role ?? "student"),
            studentId: (body.studentId as string) || null,
            classId: (body.classId as number) ?? null,
            sectionId: (body.sectionId as number) ?? null,
            tradeId: (body.tradeId as number) ?? null,
            roll: (body.roll as string) ?? null,
            status: "approved",
            approvedBy: user.id,
            approvedAt: new Date(),
            passwordHash: hashPassword(initialPassword),
          });
        // Returned once so the admin can hand it over; never stored in plain text.
        await audit(user.id, "user.create", "users", row[0].id, { role: row[0].role });
        return ok({ ...row[0], initialPassword });
      }
      case "updateUser": {
        const id = Number(body.id);
        const patch: Record<string, unknown> = {};
        for (const k of ["name", "role", "studentId", "classId", "sectionId", "tradeId", "roll", "active"])
          if (body[k] !== undefined) patch[k] = body[k];
        let issued: string | undefined;
        if (body.password === true || body.password === "__reset__") {
          issued = generatePassword();
          patch.passwordHash = hashPassword(issued);
        } else if (typeof body.password === "string" && body.password) {
          if (body.password.length < MIN_PASSWORD_LENGTH)
            return fail(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে`);
          patch.passwordHash = hashPassword(body.password);
        }
        if (!id || !Object.keys(patch).length) return fail("কোনো পরিবর্তন নেই");
        if (id === user.id && patch.active === false) return fail("নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না");
        if (patch.role === "super_admin" && user.role !== "super_admin") return fail("শুধুমাত্র Super Admin এই ভূমিকা দিতে পারবেন", 403);
        const row = await updateReturning(users, id, patch);
        if (!row[0]) return fail("ইউজার পাওয়া যায়নি", 404);
        await audit(user.id, "user.update", "users", id, { fields: Object.keys(patch).filter((k) => k !== "passwordHash") });
        return ok({ ...row[0], ...(issued ? { newPassword: issued } : {}) });
      }
      case "approveUser": {
        const id = Number(body.id);
        const target = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
        if (!target) return fail("ইউজার পাওয়া যায়নি", 404);
        await db
          .update(users)
          .set({ status: "approved", active: true, approvedBy: user.id, approvedAt: new Date(), rejectionNote: null })
          .where(eq(users.id, id));
        await db.insert(notifications).values({
          userId: id,
          title: "আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে ✅",
          body: "এখন আপনি লগইন করে প্ল্যাটফর্ম ব্যবহার করতে পারবেন।",
          kind: "approval",
          link: "/login",
        });
        return ok({ ok: true });
      }
      case "rejectUser": {
        const id = Number(body.id);
        const note = String(body.note ?? "").slice(0, 200);
        const target = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
        if (!target) return fail("ইউজার পাওয়া যায়নি", 404);
        await db
          .update(users)
          .set({ status: "rejected", active: false, approvedBy: user.id, approvedAt: new Date(), rejectionNote: note || null })
          .where(eq(users.id, id));
        return ok({ ok: true });
      }
      case "bulkApprove": {
        const ids = (body.ids as number[]) ?? [];
        if (!ids.length) return fail("কোনো আবেদন নির্বাচন করা হয়নি");
        await db
          .update(users)
          .set({ status: "approved", active: true, approvedBy: user.id, approvedAt: new Date(), rejectionNote: null })
          .where(and(inArray(users.id, ids), ne(users.status, "approved")));
        await db.insert(notifications).values(
          ids.map((id) => ({
            userId: id,
            title: "আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে ✅",
            body: "এখন আপনি লগইন করতে পারবেন।",
            kind: "approval",
            link: "/login",
          })),
        );
        return ok({ ok: true, approved: ids.length });
      }
      case "deleteUser": {
        const id = Number(body.id);
        if (!id) return fail("id required");
        if (id === user.id) return fail("নিজের অ্যাকাউন্ট মুছতে পারবেন না");
        const target = (await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id)).limit(1))[0];
        if (!target) return fail("ইউজার পাওয়া যায়নি", 404);
        if (target.role === "super_admin" && user.role !== "super_admin") return fail("Super Admin মুছতে পারবেন না", 403);
        await db.delete(parentLinks).where(eq(parentLinks.parentId, id));
        await db.delete(parentLinks).where(eq(parentLinks.studentId, id));
        await db.delete(users).where(eq(users.id, id));
        await audit(user.id, "user.delete", "users", id);
        return ok({ ok: true, id });
      }
      case "linkParent": {
        await db
          .insert(parentLinks)
          .values({ parentId: Number(body.parentId), studentId: Number(body.studentId) })
          .onDuplicateKeyUpdate({ set: { parentId: sql`parent_id`, studentId: sql`student_id` } });
        return ok({ ok: true });
      }
      case "importStudents": {
        const rows = (body.rows as Record<string, string>[]) ?? [];
        if (!rows.length) return fail("কোনো সারি নেই");
        const emails = rows.map((r) => (r.email || `${r.studentId}@pgtsc.edu.bd`).toLowerCase());
        const existing = await db.select({ email: users.email }).from(users).where(inArray(users.email, emails));
        const skip = new Set(existing.map((e) => e.email));
        const credentials: { name: string; email: string; password: string }[] = [];
        const fresh = rows
          .map((r, i) => {
            const password = generatePassword();
            credentials.push({ name: r.name ?? `Student ${i + 1}`, email: emails[i], password });
            return {
              email: emails[i],
              studentId: r.studentId ?? null,
              name: r.name ?? `Student ${i + 1}`,
              roll: r.roll ?? null,
              role: "student",
              status: "approved",
              passwordHash: hashPassword(password),
            };
          })
          .filter((r) => !skip.has(r.email));
        if (fresh.length) await db.insert(users).values(fresh);
        const issued = credentials.filter((c) => !skip.has(c.email));
        return ok({ imported: fresh.length, skipped: rows.length - fresh.length, credentials: issued });
      }
      case "saveAchievement": {
        if (body.id) {
          const row = await updateReturning(achievements, Number(body.id), {
            name: String(body.name),
            nameBn: String(body.nameBn ?? ""),
            description: String(body.description ?? ""),
            icon: String(body.icon ?? "🏆"),
            xp: Number(body.xp ?? 50),
            active: body.active !== false,
          });
          return ok(row[0]);
        }
        const row = await insertReturning(achievements, {
            code: String(body.code ?? `custom_${Date.now()}`),
            name: String(body.name ?? "নতুন অর্জন"),
            nameBn: String(body.nameBn ?? ""),
            description: String(body.description ?? ""),
            icon: String(body.icon ?? "🏆"),
            xp: Number(body.xp ?? 50),
          });
        return ok(row[0]);
      }
      case "deleteAchievement": {
        await db.delete(achievements).where(eq(achievements.id, Number(body.id)));
        return ok({ ok: true });
      }
      default:
        return fail("Unknown op");
    }
  });
}
