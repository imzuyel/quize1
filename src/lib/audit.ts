import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function audit(
  actorId: number | null | undefined,
  action: string,
  entity: string,
  entityId?: number | null,
  details: Record<string, unknown> = {},
) {
  try {
    await db.insert(auditLogs).values({ actorId: actorId ?? null, action, entity, entityId: entityId ?? null, details });
  } catch (err) {
    console.error("[audit]", err);
  }
}
