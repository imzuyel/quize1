import { db } from "@/db";
import { quizResults, quizzes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { fail, guard, ok } from "@/lib/api";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guard(async () => {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) return fail("Forbidden", 403);
    const quizId = Number(new URL(req.url).searchParams.get("quizId"));
    if (!quizId) return fail("quizId required", 400);
    const quiz = (await db.select({ title: quizzes.title }).from(quizzes).where(eq(quizzes.id, quizId)).limit(1))[0];
    if (!quiz) return fail("কুইজ পাওয়া যায়নি", 404);
    const results = await db.select({ score: quizResults.score, accuracy: quizResults.accuracy, correctCount: quizResults.correctCount, totalQuestions: quizResults.totalQuestions })
      .from(quizResults).where(eq(quizResults.quizId, quizId)).orderBy(desc(quizResults.score)).limit(5000);
    if (!results.length) return ok({ quiz: quiz.title, students: 0, averageScore: 0, averageAccuracy: 0, advice: "এই কুইজের জন্য এখনো পর্যাপ্ত ফলাফল নেই।" });
    const averageScore = Math.round(results.reduce((a, r) => a + Number(r.score || 0), 0) / results.length * 10) / 10;
    const averageAccuracy = Math.round(results.reduce((a, r) => a + Number(r.accuracy || 0), 0) / results.length * 10) / 10;
    const advice = averageAccuracy < 50
      ? "ক্লাসের ভিত্তি দুর্বল। পরবর্তী ক্লাসে এই বিষয়ের মূল ধারণাগুলো সংক্ষেপে পুনরায় পড়িয়ে একটি সহজ practice quiz নেওয়া ভালো।"
      : averageAccuracy < 70
        ? "শিক্ষার্থীদের ধারণা মাঝারি। যেসব প্রশ্নে বেশি ভুল হয়েছে সেগুলো নিয়ে সংক্ষিপ্ত revision এবং medium-level practice quiz দেওয়া ভালো।"
        : "ক্লাসের সামগ্রিক বোঝাপড়া ভালো। পরবর্তী ধাপে কিছু challenging প্রশ্ন ও application-based practice যোগ করা যেতে পারে।";
    return ok({ quiz: quiz.title, students: results.length, averageScore, averageAccuracy, advice });
  });
}
