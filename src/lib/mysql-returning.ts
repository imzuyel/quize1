/** MySQL/MariaDB compatibility helpers for Drizzle ORM. */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";

export async function insertReturning<T = any>(table: any, values: any | any[]): Promise<T[]> {
  const list = Array.isArray(values) ? values : [values];
  if (!list.length) return [];
  const ids = await db.insert(table).values(values).$returningId();
  const rows = await db.select().from(table).where(inArray(table.id, ids.map((x: any) => x.id)));
  const byId = new Map(rows.map((row: any) => [row.id, row]));
  return ids.map((x: any) => byId.get(x.id)).filter(Boolean) as T[];
}

export async function updateReturning<T = any>(table: any, id: number, patch: any): Promise<T[]> {
  await db.update(table).set(patch).where(eq(table.id, id));
  return (await db.select().from(table).where(eq(table.id, id)).limit(1)) as T[];
}
