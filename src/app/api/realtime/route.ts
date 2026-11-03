import { validateRequest } from "@/auth";
import {
  getActiveUserIds,
  getRedis,
  globalStream,
  markUserActive,
  publishGlobal,
  userStream,
} from "@/lib/realtime";
import type { RealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Hobby plan caps serverless functions at 60s. The browser EventSource
// reconnects automatically when the connection drops, so a short maxDuration
// just means more frequent reconnects — harmless.
export const maxDuration = 60;
// ponytail: 60s Hobby cap means the SSE stream reconnects ~1/min; EventSource hides it but presence/heartbeat churn rises. Upgrade to a long-lived route/Ably/Pusher if you outgrow Hobby.

const POLL_MS = 2000;
const HEARTBEAT_MS = 25_000;

const sse = (data: RealtimeEvent | unknown) => `data: ${JSON.stringify(data)}\n\n`;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });

export async function GET(req: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return new Response(
      "Realtime is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      { status: 503 },
    );
  }

  const userId = user.id;
  const encoder = new TextEncoder();
  const streams = [globalStream(), userStream(userId)];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", close, { once: true });

      // Start from the current tail so we never replay old events.
      const lastId: Record<string, string> = {};
      for (const key of streams) {
        try {
          const tail = await redis.xrevrange(key, "+", "-", 1);
          lastId[key] = Object.keys(tail ?? {})[0] ?? "0-0";
        } catch (error) {
          console.error("Realtime tail failed:", error);
          lastId[key] = "0-0";
        }
      }

      // Presence: mark self active + announce + send snapshot to this client.
      await markUserActive(userId);
      await publishGlobal({
        type: "user-joined",
        payload: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
        },
      });
      send(sse({ type: "presence", payload: await getActiveUserIds() }));

      let lastHeartbeat = Date.now();

      while (!closed && !req.signal.aborted) {
        for (const key of streams) {
          try {
            const entries = await redis.xrange(
              key,
              `(${lastId[key] ?? "0-0"}`,
              "+",
              100,
            );
            for (const [id, fields] of Object.entries(entries ?? {})) {
              lastId[key] = id;
              if (fields?.data) send(sse(fields.data));
            }
          } catch (error) {
            console.error("Realtime poll failed:", error);
          }
        }

        if (Date.now() - lastHeartbeat > HEARTBEAT_MS) {
          lastHeartbeat = Date.now();
          await markUserActive(userId);
          await publishGlobal({
            type: "presence",
            payload: await getActiveUserIds(),
          });
        }

        send(": ping\n\n");
        await sleep(POLL_MS, req.signal);
      }

      close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
