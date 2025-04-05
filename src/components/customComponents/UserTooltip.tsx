"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowersInfo, UserData } from "@/lib/types";
import React, { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import Linkify from "./Linkify";
import FollowerCount from "./FollowerCount";

interface UserTooltipProps extends PropsWithChildren {
  user?: UserData;
}
function UserTooltip({ children, user }: UserTooltipProps) {
  const { user: loggedinUser } = useSession();
  const followerState: FollowersInfo = {
    followers: user?._count.Followers as number,
    isFollowedByUser: !!user?.Followers.some(
      ({ followerId }) => followerId === loggedinUser.id,
    ),
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 px-1 py-2.5 break-words md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${user?.username}`}>
                <UserAvatar
                  userAvatarUrl={user?.avatarUrl as string}
                  userName={user?.username as string}
                />
              </Link>
              {loggedinUser.id !== user?.id && (
                <FollowButton
                  initialState={followerState}
                  userId={user?.id as string}
                />
              )}
            </div>
            <div>
              <Link href={`/users/${user?.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user?.displayName}
                </div>
                <div className="text-muted-foreground">@{user?.username}</div>
              </Link>
            </div>
            {user?.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user?.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount userId={user?.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserTooltip;
