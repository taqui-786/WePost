"use client"
import useFollowInfo from "@/hooks/useFollowInfo";
import { FollowersInfo } from "@/lib/types";
import { formatNumber } from "./TrendzSidebar";



interface FollowerCountProps {
  userId: string;
  initialState: FollowersInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}