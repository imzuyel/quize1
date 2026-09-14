import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";
import { getCurrentUser, type Role } from "@/lib/auth";
import { db } from "@/db";
import { settings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  let user = await getCurrentUser();
  if (!user) {
    const demoMode = process.env.DEMO_MODE !== "false";
    if (!demoMode) redirect("/login");
    const fallback = await db.select().from(users).where(eq(users.role, "student")).limit(1);
    if (fallback[0]) {
      const u = fallback[0];
      user = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as Role,
        classId: u.classId,
        sectionId: u.sectionId,
        tradeId: u.tradeId,
        studentId: u.studentId,
        xp: u.xp,
        level: u.level,
        locale: u.locale,
      };
    } else {
      redirect("/login");
    }
  }
  const brandingRow = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, "branding")).limit(1);
  const branding = (brandingRow[0]?.value ?? {}) as {
    schoolName?: string; schoolNameEn?: string; contact?: string; email?: string;
    developerName?: string; developerTitle?: string; developerInstitute?: string; copyright?: string; footer?: string;
  };
  return (
    <AppShell
      branding={branding}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        locale: user.locale,
      }}
    >
      {children}
    </AppShell>
  );
}
