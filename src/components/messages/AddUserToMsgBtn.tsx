"use client";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { createUserChat } from "./action";
import { UserData } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function AddUserToMsgBtn({ friend, onClose }: { friend: UserData, onClose: () => void }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: () => createUserChat(friend.id),
    onSuccess: async (conversationId) => {
      await queryClient.invalidateQueries({ queryKey: ['chat-users'] })
      onClose()
      router.push(`/messages/${conversationId}`)
    },
    onError: (error) => {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to create chat.")
    },
  })

  return (
    <Button isLoading={isPending} size="sm" onClick={() => mutate()}>
      Chat
    </Button>
  );
}

export default AddUserToMsgBtn;
