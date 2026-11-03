"use client";
import kyInstance from "@/lib/ky";
import { ConversationListItem } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import UserCardSkeleton from "@/components/skeletons/UserCardSkeleton";
import { useRealtimeEvent } from "@/hooks/RealtimeProvider";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function MessageUsersFeed({ userId }: { userId: string | undefined }) {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-users", userId],
    queryFn: () =>
      kyInstance.get("/api/message/users").json<ConversationListItem[]>(),
  });

  useRealtimeEvent<string[]>("presence", (ids) => {
    setActiveUsers((ids ?? []).filter((id) => id !== userId));
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["chat-users", userId] });
    queryClient.invalidateQueries({ queryKey: ["message-unread-count"] });
  };
  useRealtimeEvent("refresh-chat-feed", refresh);
  useRealtimeEvent("chat-created", refresh);
  useRealtimeEvent("new-message", refresh);

  const users = query.data;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
      {query.isPending &&
        Array.from({ length: 5 }).map((_, i) => (
          <UserCardSkeleton withBtn={false} key={i} />
        ))}

      {query.isError && (
        <p className="text-destructive p-3 text-center text-sm">
          Failed to load conversations.
        </p>
      )}

      {users && users.length === 0 && (
        <p className="text-muted-foreground p-6 text-center text-sm">
          No conversations yet. Start a new chat with the
          <span className="text-foreground font-medium"> compose </span>
          button.
        </p>
      )}

      {users?.map((conversation) => {
        const theUser =
          conversation.participants.find((p) => p.userId !== userId)?.user ??
          conversation.participants[0]?.user;
        if (!theUser) return null;

        const lastMessage = conversation.lastMessage;
        const isActive = activeUsers.includes(theUser.id);
        const unread = conversation.unreadCount;

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            suppressHydrationWarning
            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
          >
            <div className="relative shrink-0">
              <UserAvatar
                userAvatarUrl={theUser.avatarUrl}
                userName={theUser.username}
                size={44}
              />
              {isActive && (
                <span
                  title="Active now"
                  className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-card bg-green-500"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {theUser.displayName}
                </span>
                {lastMessage && (
                  <span
                    suppressHydrationWarning
                    className="text-muted-foreground shrink-0 text-[10px] tabular-nums"
                  >
                    {formatDistanceToNow(new Date(lastMessage.createdAt), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-xs",
                    unread > 0
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {lastMessage
                    ? `${lastMessage.senderId === userId ? "You: " : ""}${lastMessage.content}`
                    : "No messages yet"}
                </p>
                {unread > 0 && (
                  <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default MessageUsersFeed;
