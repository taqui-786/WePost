"use client";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/app/(main)/SessionProvider";
import { useRealtimeEvent } from "@/hooks/RealtimeProvider";

/**
 * Floating pill: "↑ N New Posts". Clicking refetches the feed instead of
 * auto-injecting posts into the viewport the user is reading.
 */
export default function NewPostsPill({ queryKey }: { queryKey: string[] }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [count, setCount] = useState(0);

  useRealtimeEvent<{ authorId?: string }>("new-post", (payload) => {
    // The author's own post is already applied optimistically by the editor.
    if (payload?.authorId === user.id) return;
    setCount((c) => c + 1);
  });

  if (!count) return null;

  return (
    <div className="pointer-events-none sticky top-16 z-20 flex justify-center">
      <Button
        size="sm"
        className="pointer-events-auto gap-1 rounded-full shadow-lg"
        onClick={() => {
          setCount(0);
          queryClient.invalidateQueries({ queryKey });
        }}
      >
        <ArrowUp className="size-4" />
        {count} New Post{count > 1 ? "s" : ""}
      </Button>
    </div>
  );
}
