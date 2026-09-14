import { insertReturning, updateReturning } from "@/lib/mysql-returning";
import { db } from "@/db";
import { frontendSections } from "@/db/schema";
import { fail, guard, ok } from "@/lib/api";
import { getCurrentUser, isStaff, requireUser } from "@/lib/auth";
import { and, asc, eq, lte, gte, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";

    if (all) {
      const user = await requireUser();
      if (!isStaff(user.role)) return fail("Forbidden", 403);

      const rows = await db
        .select()
        .from(frontendSections)
        .orderBy(asc(frontendSections.displayOrder), asc(frontendSections.id));

      return ok({ sections: rows });
    }

    // Public / Active Sections
    const currentUser = await getCurrentUser();
    const now = new Date();

    const allSections = await db
      .select()
      .from(frontendSections)
      .where(eq(frontendSections.isActive, true))
      .orderBy(asc(frontendSections.displayOrder), asc(frontendSections.id));

    // Filter by role & startAt/endAt dates
    const filtered = allSections.filter((sec) => {
      // Date window check
      if (sec.startAt && new Date(sec.startAt) > now) return false;
      if (sec.endAt && new Date(sec.endAt) < now) return false;

      // Visibility check
      if (sec.visibility === "everyone") return true;
      if (sec.visibility === "authenticated") return !!currentUser;
      if (sec.visibility === "roles") {
        if (!currentUser) return false;
        const roles = Array.isArray(sec.allowedRoles) ? (sec.allowedRoles as string[]) : [];
        return roles.includes(currentUser.role) || currentUser.role === "super_admin";
      }

      return true;
    });

    return ok({ sections: filtered });
  });
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);

    const body = (await req.json()) as Record<string, unknown>;
    const op = String(body.op ?? "update");

    if (op === "toggle") {
      const id = Number(body.id);
      if (!id) return fail("Section ID required");

      const existing = (await db.select().from(frontendSections).where(eq(frontendSections.id, id)).limit(1))[0];
      if (!existing) return fail("Section not found", 404);

      const updated = (
        await updateReturning(frontendSections, id, {
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : !existing.isActive,
          updatedAt: new Date(),
        })
      )[0];

      return ok({ section: updated, message: `섹션টি ${updated.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে।` });
    }

    if (op === "reorder") {
      const items = body.items as { id: number; displayOrder: number }[];
      if (!Array.isArray(items)) return fail("Invalid items array");

      for (const item of items) {
        if (item.id) {
          await updateReturning(frontendSections, Number(item.id), {
            displayOrder: Number(item.displayOrder || 0),
            updatedAt: new Date(),
          });
        }
      }

      return ok({ message: "সেকশন সাজানোর ক্রম সংরক্ষিত হয়েছে।" });
    }

    if (op === "update" || op === "create") {
      const id = body.id ? Number(body.id) : null;
      const sectionKey = String(body.sectionKey ?? "").trim();
      if (!sectionKey) return fail("Section key required");

      const payload = {
        sectionKey,
        title: body.title !== undefined ? String(body.title).trim() || null : null,
        subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() || null : null,
        description: body.description !== undefined ? String(body.description).trim() || null : null,
        content: body.content !== undefined ? String(body.content).trim() || null : null,
        icon: body.icon !== undefined ? String(body.icon).trim() || null : null,
        image: body.image !== undefined ? String(body.image).trim() || null : null,
        link: body.link !== undefined ? String(body.link).trim() || null : null,
        buttonText: body.buttonText !== undefined ? String(body.buttonText).trim() || null : null,
        buttonVisible: body.buttonVisible !== undefined ? Boolean(body.buttonVisible) : true,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
        visibility: body.visibility !== undefined ? String(body.visibility) : "everyone",
        allowedRoles: Array.isArray(body.allowedRoles) ? body.allowedRoles : [],
        startAt: body.startAt ? new Date(String(body.startAt)) : null,
        endAt: body.endAt ? new Date(String(body.endAt)) : null,
        updatedAt: new Date(),
      };

      if (id) {
        const updated = (
          await updateReturning(frontendSections, id, payload)
        )[0];
        return ok({ section: updated, message: "ফ্রন্টএন্ড সেকশন আপডেট হয়েছে।" });
      } else {
        const inserted = (
          await insertReturning(frontendSections, payload)
        )[0];
        return ok({ section: inserted, message: "নতুন সেকশন যুক্ত করা হয়েছে।" });
      }
    }

    return fail("Unknown operation");
  });
}
