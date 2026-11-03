'use client'

import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitMessagesAction } from "./action";
import { messageData, MessagePage } from "@/lib/types";
import { toast } from "sonner";
import { User } from "@prisma/client";

export const useMessageSendMutation = (messageId: string, loggedInUser: User) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitMessagesAction,

    onMutate: async (variables) => {
      const queryKey = ["user-messages", messageId] as const;

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<InfiniteData<MessagePage, string | null>>(queryKey);

      const currentUserId = loggedInUser.id || 'unknown';

      const optimisticMessage: messageData = {
        id: `temp-${Date.now()}`,
        content: variables.content,
        senderId: currentUserId,
        conversationId: messageId,
        status: "SENT",
        createdAt: new Date(),
        sender: {
          id: currentUserId,
          username: loggedInUser.username || 'user',
          displayName: loggedInUser.displayName || 'User',
          avatarUrl: loggedInUser.avatarUrl || null,
          bio: null,
          createdAt: new Date(),
          Followers: [],
          Following: [],
          _count: {
            posts: 0,
            Followers: 0,
            Following: 0
          }
        }
      };

      // Append to the newest page in cache.
      queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const first = newPages[0];
          if (first) {
            newPages[0] = {
              ...first,
              messages: [...first.messages, optimisticMessage],
            };
          }
          return { ...oldData, pages: newPages };
        },
      );

      // Keep the chat list fresh (last message + ordering).
      queryClient.invalidateQueries({ queryKey: ["chat-users", loggedInUser.id] });

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["user-messages", messageId], context.previousData);
      }
      console.log(error);
      toast.error("Failed to send message.");
    },

    onSuccess: (newMessage, variables) => {
      const queryKey = ["user-messages", messageId] as const;
      // Replace the optimistic temp message(s) with the real one.
      queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const first = newPages[0];
          if (first) {
            newPages[0] = {
              ...first,
              messages: first.messages.map((msg) =>
                msg.id.startsWith("temp-") && msg.content === variables.content
                  ? newMessage
                  : msg,
              ),
            };
          }
          return { ...oldData, pages: newPages };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chat-users", loggedInUser.id] });
    },
  });

  return mutation;
}
