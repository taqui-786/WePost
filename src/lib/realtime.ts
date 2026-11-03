import { Redis } from "@upstash/redis";

/**
 * Realtime bus backed by Upstash Redis Streams.
 *
 * ponytail: streams + server-side polling over REST instead of a persistent
 * pub/sub connection — REST has no blocking SUBSCRIBE, and Vercel functions
 * are stateless. Cheap and works everywhere Upstash works.
 * Ceiling: one HTTP roundtrip per poll per client. If connected clients grow
 * large, swap the poller for Ably/Pusher (keep the publish API unchanged).
 */
export type RealtimeEvent<T = unknown> = {
  type: string;
  payload?: T;
};

export const PRESENCE_TTL_MS = 45_000;
// Keep the streams small; old entries are useless once delivered.
export const STREAM_MAXLEN = 500;

const GLOBAL_STREAM = "wepost:global";
const USER_STREAM_PREFIX = "wepost:user:";
const PRESENCE_KEY = "wepost:presence";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}

export const globalStream = () => GLOBAL_STREAM;
export const userStream = (userId: string) => `${USER_STREAM_PREFIX}${userId}`;
export const presenceKey = () => PRESENCE_KEY;

async function xadd(streamKey: string, event: RealtimeEvent) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.xadd(
      streamKey,
      "*",
      { data: JSON.stringify(event) },
      {
        trim: {
          type: "MAXLEN",
          comparison: "~",
          threshold: STREAM_MAXLEN,
        },
      },
    );
  } catch (error) {
    // Never let a realtime blip break a like/message/etc.
    console.error("Realtime publish failed:", error);
  }
}

export function publishToUser(userId: string, event: RealtimeEvent) {
  return xadd(userStream(userId), event);
}

export function publishGlobal(event: RealtimeEvent) {
  return xadd(GLOBAL_STREAM, event);
}

export async function markUserActive(userId: string) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.zadd(PRESENCE_KEY, { score: Date.now(), member: userId });
  } catch (error) {
    console.error("Presence update failed:", error);
  }
}

export async function getActiveUserIds(): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    await redis.zremrangebyscore(PRESENCE_KEY, 0, Date.now() - PRESENCE_TTL_MS);
    return await redis.zrange<string[]>(PRESENCE_KEY, 0, -1);
  } catch (error) {
    console.error("Presence read failed:", error);
    return [];
  }
}
