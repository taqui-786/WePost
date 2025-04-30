"use client";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { createUserChat } from "./action";
import { UserData } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/SocketContext";
// import { useRouter } from "next/navigation";

function AddUserToMsgBtn({ friend, onClose }: { friend: UserData, onClose: () => void }) {
  const queryClient = useQueryClient()
  const {socket} = useSocket()
//   const router = useRouter()
  const {mutate, isPending} =  useMutation({
    mutationFn: () => createUserChat(friend.id),
    onSuccess: async () => {
      // Invalidate any cache related to conversations
      await queryClient.invalidateQueries({ queryKey: ['chat-users'] })
      socket?.emit("new-chat-created", friend.id)
      toast.success("Chat created successfully!")
      onClose()
    //   router.push(`/chat/${friendId}`) // redirect if you have chat page
    },
    onError: (error) => {
      console.error(error)
      toast.error(error?.message || "Failed to create chat.")
    },
  })
  
  return (
    <Button isLoading={isPending} size="sm" onClick={() => mutate()}>
      Chat
    </Button>
  );
}

export default AddUserToMsgBtn;
