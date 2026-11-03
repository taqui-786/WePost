"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useSession } from "@/app/(main)/SessionProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Handler = (payload: unknown) => void;

type RealtimeContextValue = {
  subscribe: (type: string, handler: Handler) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribe: () => () => {},
});

/**
 * Single SSE connection to /api/realtime shared by the whole app.
 * Components subscribe to event types with `useRealtimeEvent`.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const handlers = useRef(new Map<string, Set<Handler>>());

  const subscribe = useCallback((type: string, handler: Handler) => {
    const map = handlers.current;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type)!.add(handler);
    return () => {
      map.get(type)?.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const source = new EventSource("/api/realtime");
    source.onmessage = (event) => {
      let parsed: { type: string; payload?: unknown };
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      // Built-in reactions (formerly in SocketContext).
      if (parsed.type === "post-liked") {
        const payload = parsed.payload as { from?: string } | undefined;
        toast.success(`Your Post is Liked by ${payload?.from}`);
        queryClient.invalidateQueries({
          queryKey: ["unread-notifications-count"],
        });
      }
      if (parsed.type === "notification") {
        queryClient.invalidateQueries({
          queryKey: ["unread-notifications-count"],
        });
      }
      if (parsed.type === "like-updated") {
        const payload = parsed.payload as
          | { postId?: string; likes?: number }
          | undefined;
        if (payload?.postId && typeof payload.likes === "number") {
          const { postId, likes } = payload;
          queryClient.setQueryData<{ likes: number; isLikedByUser: boolean }>(
            ["like-info", postId],
            (old) => (old ? { ...old, likes } : old),
          );
        }
      }
      if (parsed.type === "user-joined") {
        const payload = parsed.payload as
          | { id?: string; username?: string }
          | undefined;
        if (payload?.id && payload.id !== user.id) {
          toast.info(`User is Active ${payload.username}`);
        }
      }

      handlers.current.get(parsed.type)?.forEach((handler) => {
        try {
          handler(parsed.payload);
        } catch (error) {
          console.error("Realtime handler failed:", error);
        }
      });
    };

    return () => source.close();
  }, [user, queryClient]);

  const value = useMemo(() => ({ subscribe }), [subscribe]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

/** Subscribe to a single realtime event type. Handler is kept fresh. */
export function useRealtimeEvent<T = unknown>(
  type: string,
  handler: (payload: T) => void,
) {
  const { subscribe } = useContext(RealtimeContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(
    () => subscribe(type, (payload) => handlerRef.current(payload as T)),
    [subscribe, type],
  );
}
