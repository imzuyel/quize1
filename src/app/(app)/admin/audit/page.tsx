"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, SectionTitle, Table, Button } from "@/components/ui";

type AuditRow = { id: number; actorId: number | null; action: string; entity: string; entityId: number | null; details: Record<string, unknown>; createdAt: string };

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?scope=audit", { cache: "no-store" });
      if (res.ok) setRows((await res.json()).rows ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <SectionTitle title="🧾 অডিট লগ" subtitle="অ্যাডমিনের গুরুত্বপূর্ণ পরিবর্তনের ইতিহাস" action={<Button variant="outline" onClick={load}>↻ রিফ্রেশ</Button>} />
      <Card padded={false}>
        {loading ? <p className="p-6 text-sm text-slate-500">লোড হচ্ছে…</p> : rows.length ? (
          <Table head={["সময়", "Actor", "Action", "Entity", "ID", "Details"]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString("bn-BD")}</td>
                <td className="px-3 py-2 text-xs">#{r.actorId ?? "—"}</td>
                <td className="px-3 py-2 font-semibold">{r.action}</td>
                <td className="px-3 py-2">{r.entity}</td>
                <td className="px-3 py-2">{r.entityId ?? "—"}</td>
                <td className="max-w-[360px] truncate px-3 py-2 text-xs text-slate-500">{JSON.stringify(r.details ?? {})}</td>
              </tr>
            ))}
          </Table>
        ) : <p className="p-8 text-center text-sm text-slate-500">এখনও কোনো অডিট রেকর্ড নেই।</p>}
      </Card>
    </div>
  );
}
