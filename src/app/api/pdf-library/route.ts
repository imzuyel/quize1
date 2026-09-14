import { insertReturning, updateReturning } from "@/lib/mysql-returning";
import { db } from "@/db";
import { pdfLibrary, quizzes, classes, subjects, users } from "@/db/schema";
import { fail, guard, ok } from "@/lib/api";
import { isStaff, requireUser } from "@/lib/auth";
import { extractDocument, detectOutline } from "@/lib/pdf";
import { savePdfFile, deletePdfFile, calculateChecksum } from "@/lib/storage";
import { and, desc, eq, like, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const pdfId = Number(id);
      const rows = await db.select().from(pdfLibrary).where(eq(pdfLibrary.id, pdfId)).limit(1);
      const pdf = rows[0];
      if (!pdf) return fail("PDF not found", 404);

      // Usage count (quizzes linked)
      const linkedQuizzes = await db
        .select({
          id: quizzes.id,
          title: quizzes.title,
          status: quizzes.status,
          createdAt: quizzes.createdAt,
        })
        .from(quizzes)
        .where(eq(quizzes.pdfSourceId, pdfId));

      return ok({ pdf, usageCount: linkedQuizzes.length, linkedQuizzes });
    }

    const q = (url.searchParams.get("q") ?? "").trim();
    const subjectId = url.searchParams.get("subjectId");
    const classId = url.searchParams.get("classId");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status") ?? "active"; // active | inactive | archived | all
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(pdfLibrary.status, status));
    }

    if (subjectId) {
      conditions.push(eq(pdfLibrary.subjectId, Number(subjectId)));
    }

    if (classId) {
      conditions.push(eq(pdfLibrary.classId, Number(classId)));
    }

    if (category) {
      conditions.push(eq(pdfLibrary.category, category));
    }

    if (q) {
      conditions.push(
        or(
          like(pdfLibrary.title, `%${q}%`),
          like(pdfLibrary.originalFilename, `%${q}%`),
          like(pdfLibrary.description, `%${q}%`),
          like(pdfLibrary.category, `%${q}%`)
        )
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const allRows = await db
      .select()
      .from(pdfLibrary)
      .where(whereClause)
      .orderBy(desc(pdfLibrary.id));

    const total = allRows.length;
    const paginated = allRows.slice(offset, offset + limit);

    // Fetch quiz usage counts for paginated items
    const allQuizzes = await db.select({ id: quizzes.id, pdfSourceId: quizzes.pdfSourceId }).from(quizzes);
    const usageMap: Record<number, number> = {};
    for (const qz of allQuizzes) {
      if (qz.pdfSourceId) {
        usageMap[qz.pdfSourceId] = (usageMap[qz.pdfSourceId] || 0) + 1;
      }
    }

    const items = paginated.map((item) => ({
      ...item,
      usageCount: usageMap[item.id] || 0,
    }));

    return ok({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  });
}

export async function POST(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);

    const contentType = req.headers.get("content-type") ?? "";

    // Multipart Form Upload
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      const title = String(form.get("title") ?? "").trim();
      const description = String(form.get("description") ?? "").trim();
      const category = String(form.get("category") ?? "").trim() || null;
      const subjectId = form.get("subjectId") ? Number(form.get("subjectId")) : null;
      const classId = form.get("classId") ? Number(form.get("classId")) : null;
      const forceUpload = form.get("forceUpload") === "true";

      if (!file) return fail("অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন");
      if (!file.name.toLowerCase().endsWith(".pdf")) return fail("শুধুমাত্র PDF ফাইল আপলোড করা যাবে");
      if (file.size > 50 * 1024 * 1024) return fail("ফাইলটি অনেক বড় (সর্বোচ্চ ৫০MB)");

      const buffer = Buffer.from(await file.arrayBuffer());
      const checksum = calculateChecksum(buffer);

      // Duplicate Check
      if (!forceUpload) {
        const existing = await db
          .select()
          .from(pdfLibrary)
          .where(eq(pdfLibrary.checksum, checksum))
          .limit(1);

        if (existing.length > 0) {
          const dup = existing[0];
          return ok({
            duplicate: true,
            existingPdf: dup,
            message: `এই PDF ফাইলটি ইতিমধ্যে আপনার লাইব্রেরিতে "${dup.title}" নামে বিদ্যমান রয়েছে।`,
          });
        }
      }

      // Extract PDF content and pages
      const doc = await extractDocument(file.name, buffer);
      if (doc.chars < 30) {
        return fail("ফাইল থেকে পর্যাপ্ত টেক্সট পড়া যায়নি। অনুগ্রহ করে ফন্ট বা টেক্সট সম্বলিত PDF নির্বাচন করুন।");
      }

      const outline = detectOutline(doc.pages);

      // Save file to persistent storage
      const saved = await savePdfFile(buffer, file.name);

      const inserted = (
        await insertReturning(pdfLibrary, {
          title: title || file.name.replace(/\.pdf$/i, ""),
          originalFilename: file.name,
          storagePath: saved.storagePath,
          fileSize: saved.fileSize,
          mimeType: "application/pdf",
          checksum,
          description: description || null,
          category,
          subjectId,
          classId,
          tags: [],
          status: "active",
          pageCount: doc.pageCount,
          chars: doc.chars,
          pages: doc.pages,
          outline,
          uploadedBy: user.id,
        })
      )[0];

      return ok({
        duplicate: false,
        pdf: inserted,
        message: "PDF ফাইলটি সফলভাবে আপনার লাইব্রেরিতে সংরক্ষন করা হয়েছে।",
      });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const op = String(body.op ?? "");

    if (op === "update") {
      const id = Number(body.id);
      if (!id) return fail("PDF ID required");

      const existing = (await db.select().from(pdfLibrary).where(eq(pdfLibrary.id, id)).limit(1))[0];
      if (!existing) return fail("PDF not found", 404);

      const updated = (
        await updateReturning(
          pdfLibrary,
          id,
          {
            title: body.title !== undefined ? String(body.title).trim() : existing.title,
            description: body.description !== undefined ? String(body.description).trim() || null : existing.description,
            category: body.category !== undefined ? String(body.category).trim() || null : existing.category,
            subjectId: body.subjectId !== undefined ? (body.subjectId ? Number(body.subjectId) : null) : existing.subjectId,
            classId: body.classId !== undefined ? (body.classId ? Number(body.classId) : null) : existing.classId,
            status: body.status !== undefined ? String(body.status) : existing.status,
            tags: body.tags !== undefined && Array.isArray(body.tags) ? body.tags : existing.tags,
            updatedAt: new Date(),
          }
        )
      )[0];

      return ok({ pdf: updated, message: "PDF তথ্য আপডেট হয়েছে।" });
    }

    return fail("Unknown operation");
  });
}

export async function DELETE(req: Request) {
  return guard(async () => {
    const user = await requireUser();
    if (!isStaff(user.role)) return fail("Forbidden", 403);

    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    if (!id) return fail("PDF ID required");

    const pdf = (await db.select().from(pdfLibrary).where(eq(pdfLibrary.id, id)).limit(1))[0];
    if (!pdf) return fail("PDF not found", 404);

    // Check usage in quizzes
    const linkedQuizzes = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.pdfSourceId, id));

    if (linkedQuizzes.length > 0) {
      // Soft Delete / Archive
      await updateReturning(pdfLibrary, id, {
        status: "archived",
        updatedAt: new Date(),
      });

      return ok({
        archived: true,
        message: `এই PDF টি ${linkedQuizzes.length} টি কুইজে ব্যবহৃত হচ্ছে। তাই ফাইলটি স্থায়ীভাবে ডিলিট না করে আর্কাইভ (আর্কাইভ মোডে) স্থানান্তর করা হয়েছে।`,
      });
    }

    // Hard Delete safely
    await deletePdfFile(pdf.storagePath);
    await db.delete(pdfLibrary).where(eq(pdfLibrary.id, id));

    return ok({
      deleted: true,
      message: "PDF ফাইলটি স্থায়ীভাবে ডিলিট করা হয়েছে।",
    });
  });
}
