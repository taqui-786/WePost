"use client";
import kyInstance from "@/lib/ky";
import { messageData, MessagePage as MessagePageType } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import CommentsLoadingSkeleton from "../skeletons/CommentLoadingSkeleton";
import Messages from "./Messages";
import { User } from "@prisma/client";
import { useSocket } from "@/hooks/SocketContext";
import { useInView } from "react-intersection-observer";

interface MessagePageProps {
  messageId: string;
  friendId: string;
  loggedInUserData: User | null;
}
function MessagePage({
  messageId,
  friendId,
  loggedInUserData,
}: MessagePageProps) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<messageData[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user-messages", messageId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/message/${messageId}`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<MessagePageType>(),
    initialPageParam: null as string | null,
    getNextPageParam: (firstPage) => firstPage.previousCursor,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });
  useEffect(() => {
    const handleNewMessage = (message: messageData) => {
      console.log(message);

      setMessages((prev) => [...prev, message]);
    };

    socket?.on("new-message-received", handleNewMessage);
    return () => {
      socket?.off("new-message-received", handleNewMessage);
    };
  }, [socket]);
  useEffect(() => {
    const newMessages = data?.pages.flatMap((page) => page.messages) || [];
    setMessages((prev) => {
      const combined = [...newMessages, ...prev];
      const seen = new Set();
      const unique = combined.filter((msg) => {
        const key = `${msg.id}-${msg.content}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by timestamp so newest messages appear at the bottom
      return unique.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, [data]);
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        if (hasNextPage && !isFetching) {
          fetchNextPage();
        }
      }
    },
  });
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="max-h-[700px] space-y-5 overflow-y-auto p-5">
        {status === "error" && (
          <p className="text-destructive text-center font-medium">
            Failed To Load Comments.
          </p>
        )}
        <div ref={ref} />
        {status === "pending" || isFetchingNextPage ? (
          <CommentsLoadingSkeleton />
        ) : (
          ""
        )}
        {messages.length && hasNextPage ? (
          <div className="text-primary text-center text-xs underline font-medium">
            No More Messages to show
          </div>
        ) : (
          ""
        )}
        {messages.map((message) => (
          <Messages
            key={message.id}
            message={message}
            iAmSender={message.senderId === loggedInUserData?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput
        messageId={messageId}
        friendId={friendId}
        loggedInUserData={loggedInUserData as User}
      />
    </div>
  );
}

export default MessagePage;
