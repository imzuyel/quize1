import { buildSnapshot, getSessionByPin } from "@/lib/live";
import { subscribe } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const maxDuration = 3600;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");
  const viewerPlayerId = Number(url.searchParams.get("playerId") ?? 0) || undefined;
  if (!pin) return new Response("pin required", { status: 400 });
  // Join keywords are valid entry points too. Resolve one once so the stream
  // subscribes to the same canonical PIN that the live engine broadcasts to.
  const session = await getSessionByPin(pin);
  if (!session) return new Response("session not found", { status: 404 });
  const canonicalPin = session.pin;

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: string) => {
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          /* closed */
        }
      };
      send(`retry: 2000\n\n`);
      const snap = await buildSnapshot(canonicalPin, viewerPlayerId);
      if (snap) send(`event: update\ndata: ${JSON.stringify(snap)}\n\n`);
      unsubscribe = subscribe(`session:${canonicalPin}`, send);

      // Cheap keep-alive only. Do not run a database query for every connected
      // student every second; the live engine already persists question state
      // and broadcasts state changes. This keeps large classrooms efficient.
      heartbeat = setInterval(() => {
        send(`: ping\n\n`);
      }, 15000);
      req.signal.addEventListener("abort", () => {
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
