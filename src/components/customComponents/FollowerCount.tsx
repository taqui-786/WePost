"use client";
import { useFollowInfo } from "@/hooks/useFollowInfo";
import { FollowersInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string | undefined;
  initialState: FollowersInfo;
}

export function FollowerCount({ userId, initialState }: FollowerCountProps) {
  const { data } = useFollowInfo(userId, initialState);

  return (
    <div className="flex gap-2">
      <span>
        Followers:{" "}
        <span className="font-semibold">{formatNumber(data.followers)}</span>
      </span>
      <span>
        Followings:{" "}
        <span className="font-semibold">
          {formatNumber(data.following || 0)}
        </span>
      </span>
    </div>
  );
}
