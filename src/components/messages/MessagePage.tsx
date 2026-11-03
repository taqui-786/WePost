"use client";
import kyInstance from "@/lib/ky";
import { messageData, MessagePage as MessagePageType } from "@/lib/types";
import { useInfiniteQuery, useQueryClient, InfiniteData } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import MessageInput from "./MessageInput";
import CommentsLoadingSkeleton from "../skeletons/CommentLoadingSkeleton";
import Messages from "./Messages";
import { User } from "@prisma/client";
import { useRealtimeEvent } from "@/hooks/RealtimeProvider";
import { useInView } from "react-intersection-observer";
import { MessageCircle } from "lucide-react";

interface MessagePageProps {
  messageId: string;
  loggedInUserData: User | null;
}

function MessagePage({
  messageId,
  loggedInUserData,
}: MessagePageProps) {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didMarkRead = useRef(false);

  const queryKey = useMemo(() => ["user-messages", messageId] as const, [messageId]);

  const markRead = useCallback(async () => {
    try {
      await kyInstance.post(`/api/message/${messageId}/read`);
      queryClient.invalidateQueries({ queryKey: ["message-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["chat-users"] });
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  }, [messageId, queryClient]);

  // Mark the conversation as read once it's opened.
  useEffect(() => {
    if (didMarkRead.current) return;
    didMarkRead.current = true;
    void markRead();
  }, [markRead]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/message/${messageId}`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<MessagePageType>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.previousCursor,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  // Live incoming messages → append straight into the cache (instant).
  useRealtimeEvent<{ conversationId: string; message?: messageData }>(
    "new-message",
    (payload) => {
      if (!payload || payload.conversationId !== messageId) return;
      const incoming = payload.message;

      if (!incoming) {
        queryClient.invalidateQueries({ queryKey });
        return;
      }

      queryClient.setQueryData<InfiniteData<MessagePageType, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const exists = oldData.pages.some((page) =>
            page.messages.some((msg) => msg.id === incoming.id),
          );
          if (exists) return oldData;
          const newPages = [...oldData.pages];
          const first = newPages[0];
          if (first) {
            newPages[0] = {
              ...first,
              messages: [...first.messages, incoming],
            };
          }
          return { ...oldData, pages: newPages };
        },
      );

      // The conversation is open on screen → mark as read so badges stay clear.
      if (incoming.senderId !== loggedInUserData?.id) {
        void markRead();
      }
    },
  );

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page.messages) ?? [],
    [data],
  );

  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
  });

  // Keep the view pinned to the bottom for new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
        {status === "error" && (
          <p className="text-destructive text-center font-medium">
            Failed to load messages.
          </p>
        )}

        {status === "pending" && <CommentsLoadingSkeleton />}
        {isFetchingNextPage && <CommentsLoadingSkeleton />}

        <div ref={ref} />

        {!isFetching && status !== "pending" && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
              <MessageCircle className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground font-medium">No messages yet</p>
            <p className="text-muted-foreground text-sm">
              Say hello to start the conversation.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const iAmSender = message.senderId === loggedInUserData?.id;
          const senderChanges = !previous || previous.senderId !== message.senderId;
          const nextSenderChanges = !next || next.senderId !== message.senderId;
          return (
            <Messages
              key={message.id}
              message={message}
              iAmSender={iAmSender}
              showAvatar={!iAmSender && senderChanges}
              showTimestamp={nextSenderChanges}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        messageId={messageId}
        loggedInUserData={loggedInUserData as User}
      />
    </div>
  );
}

export default MessagePage;
