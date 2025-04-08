"use client";
import { useFollowInfo } from "@/hooks/useFollowInfo";
import { FollowersInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Button } from "../ui/button";
import kyInstance from "@/lib/ky";
import { toast } from "sonner";
interface FollowButtonProps {
  userId: string;
  initialState: FollowersInfo;
}
function FollowButton({ initialState, userId }: FollowButtonProps) {
  const { data } = useFollowInfo(userId, initialState);
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["follower-info", userId];
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowersInfo>(queryKey);
      queryClient.setQueryData<FollowersInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        following: (previousState?.following || 0) + 1,
        // following: (loggedInUser.id === userId ?(previousState?.following || 0) +
        // (previousState?.isFollowedByUser ? 1 : 1) : (previousState?.following || 0)),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast.error("Failed to follow user");
      console.log(error);
    },
  });
  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
      className="cursor-pointer"
      size="sm"
    >
      {data.isFollowedByUser ? "UnFollow" : "Follow"}
    </Button>
  );
}

export default FollowButton;
