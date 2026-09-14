import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    // Session cookie present but expired/invalid — re-enter demo on the same page.
    const path = (await headers()).get("x-pathname") ?? "";
    const demoMode = process.env.DEMO_MODE !== "false";
    if (!demoMode) redirect("/login");
    redirect(path ? `/demo?next=${encodeURIComponent(path)}` : "/demo");
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
