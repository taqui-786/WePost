'use client'

import { InfiniteData, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitMessagesAction } from "./action";
import { messageData, MessagePage } from "@/lib/types";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { useSocket } from "@/hooks/SocketContext";

export const useMessageSendMutation = (messageId: string, loggedInUser:User, friendId:string) => {
  const queryClient = useQueryClient();
  const {socket} = useSocket()
  const mutation = useMutation({
    mutationFn: submitMessagesAction,
    
    onMutate: async (variables) => {
      const queryKey: QueryKey = ["user-messages", messageId];
      
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData<InfiniteData<MessagePage, string | null>>(queryKey);
      
      const currentUserId = loggedInUser.id || 'unknown';
      
      const optimisticMessage: messageData = {
        id: `temp-${Date.now()}`,
        content: variables.content, // Assuming this is in variables
        senderId: currentUserId,
        conversationId: messageId,
        status: "SENT",
        createdAt: new Date(),
        
        // The sender object should match getUserDataSelect structure
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
      socket?.emit("new-message-sent",{message:optimisticMessage, friendId:friendId })
      
      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        
        const newPages = [...oldData.pages];
        
        if (newPages[0]) {
          newPages[0] = {
            ...newPages[0],
            messages: [...newPages[0].messages, optimisticMessage]
          };
        }
        
        return {
          ...oldData,
          pages: newPages
        };
      });
      
      // toast.success("Message sending...");
      
      return { previousData, optimisticMessage };
    },
    
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousData) {
        const queryKey: QueryKey = ["user-messages", messageId];
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.log(error);
      toast.error("Failed to send message.");
    },
    
    // onSuccess: (newMessage, variables, context) => {
    //   const queryKey: QueryKey = ["user-messages", messageId];
      
    //   // Replace the optimistic message with the real one
    //   queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(queryKey, (oldData) => {
    //     if (!oldData) return oldData;
        
    //     const newPages = [...oldData.pages];
        
    //     if (newPages[0] && context?.optimisticMessage) {
    //       newPages[0] = {
    //         ...newPages[0],
    //         messages: newPages[0].messages.map(msg => 
    //           msg.id === context.optimisticMessage.id ? newMessage : msg
    //         )
    //       };
    //     }
        
    //     return {
    //       ...oldData,
    //       pages: newPages
    //     };
    //   });
      
    //   // toast.success("Message sent.");
      
    //   // Still invalidate queries for consistency
    //   queryClient.invalidateQueries({ 
    //     queryKey, 
    //     predicate(query) {
    //       return !query.state.data;
    //     }
    //   });
    // }
  });
  
  return mutation;
}