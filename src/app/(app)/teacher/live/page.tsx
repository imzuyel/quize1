"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, Modal, SectionTitle, Select, Table, useToast } from "@/components/ui";

type Session = {
  id: number;
  pin: string;
  state: string;
  title: string;
  players: number;
  createdAt: string;
  endedAt: string | null;
};

export default function LivePage() {
  const router = useRouter();
  const { push } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [quizzes, setQuizzes] = useState<{ id: number; title: string; questionCount: number; mode: string }[]>([]);
  const [chosen, setChosen] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/live");
    if (res.ok) setSessions((await res.json()).sessions);
    const q = await fetch("/api/quizzes?mine=1");
    if (q.ok) setQuizzes((await q.json()).rows);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  const start = async () => {
    if (!chosen) return push("একটি কুইজ নির্বাচন করুন", "error");
    const res = await fetch("/api/live", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "create", quizId: Number(chosen) }),
    });
    const data = await res.json();
    if (!res.ok) return push(data.error ?? "ব্যর্থ", "error");
    router.push(`/host/${data.pin}`);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/live?pin=${sessionToDelete.pin}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin: sessionToDelete.pin, id: sessionToDelete.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "মুছতে ব্যর্থ হয়েছে");
      setSessions((prev) => prev.filter((x) => x.id !== sessionToDelete.id));
      push(`সেশন PIN ${sessionToDelete.pin} ও এর সমস্ত ডেটা মুছে ফেলা হয়েছে ✅`, "success");
      setSessionToDelete(null);
    } catch (err) {
      push(err instanceof Error ? err.message : "ব্যর্থ", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="📡 লাইভ সেশন" subtitle="গেম পিন তৈরি করে ক্লাসে লাইভ কুইজ চালান" />

      <Card className="pg-hero-bg text-white">
        <p className="text-sm font-bold">নতুন লাইভ সেশন শুরু করুন</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select value={chosen} onChange={(e) => setChosen(e.target.value)} className="text-slate-900">
            <option value="">কুইজ নির্বাচন করুন…</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} — {q.questionCount} প্রশ্ন ({q.mode})
              </option>
            ))}
          </Select>
          <Button variant="gold" onClick={start}>🚀 পিন তৈরি করুন</Button>
        </div>
        <p className="mt-2 text-xs text-white/70">
          শিক্ষার্থীরা /join পেজে গিয়ে পিন দিয়ে যোগ দেবে — অ্যাকাউন্ট ছাড়াই সম্ভব।
        </p>
      </Card>

      {sessions.length === 0 ? (
        <EmptyState icon="📡" title="কোনো সেশন নেই" description="উপরে থেকে নতুন লাইভ সেশন শুরু করুন।" />
      ) : (
        <Card padded={false}>
          <Table head={["পিন", "কুইজ", "স্ট্যাটাস", "খেলোয়াড়", "সময়", ""]}>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2.5 font-black tracking-wider">{s.pin}</td>
                <td className="px-3 py-2.5">{s.title}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={s.endedAt ? "slate" : "green"}>{s.state}</Badge>
                </td>
                <td className="px-3 py-2.5 tabular-nums">{s.players}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">
                  {new Date(s.createdAt).toLocaleString("bn-BD")}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/host/${s.pin}`}>
                      <Button size="sm" variant={s.endedAt ? "outline" : "primary"}>
                        {s.endedAt ? "ফলাফল" : "কন্ট্রোল"}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      onClick={() => setSessionToDelete(s)}
                    >
                      🗑️ ডিলিট
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <Modal open={Boolean(sessionToDelete)} onClose={() => !deleting && setSessionToDelete(null)} title="সেশন ডিলিট নিশ্চিতকরণ">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900 border border-rose-200">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-sm font-black text-rose-900">
                আপনি কি নিশ্চিত যে PIN <span className="font-mono underline">{sessionToDelete?.pin}</span> এর লাইভ সেশনটি ডিলিট করতে চান?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                কুইজ: <strong>{sessionToDelete?.title}</strong>। এই সেশনের সাথে সম্পর্কিত সকল অংশগ্রহণকারী, তাদের দেওয়া উত্তর ও তাৎক্ষণিক ফলাফল ডেটাবেজ থেকে সম্পূর্ণ মুছে যাবে।
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSessionToDelete(null)} disabled={deleting}>
              বাতিল
            </Button>
            <Button
              variant="danger"
              className="bg-rose-600 hover:bg-rose-700 text-white font-black"
              loading={deleting}
              onClick={handleDeleteSession}
            >
              হ্যাঁ, সম্পূর্ণ ডিলিট করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
