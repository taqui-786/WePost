"use client";
import kyInstance from "@/lib/ky";
import { messageParticipantType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import UserCardSkeleton from "@/components/skeletons/UserCardSkeleton";

function MessageUsersFeed({ userId }: { userId: string | undefined }) {
  const query = useQuery({
    queryKey: ["chat-users", userId],
    queryFn: () =>
      kyInstance.get("/api/message/users").json<messageParticipantType[]>(),
  });
  const users = query.data;
  return (
    <div className="flex flex-col space-y-3 px-4 w-full">
        {
            query.isPending && (
                Array.from({length:4}).map((_,i) => {
                  return <UserCardSkeleton withBtn={false} key={i} />
                })
              )
        }
      {users
        ? users.map((user) => (
            <Link
              href={`/messages/${user.participants[1].userId}`}
              className="cursor-pointer"
              title="message"
              key={user.id}
              suppressHydrationWarning
            >
              <div className="flex items-center justify-between ">
                <div className="flex flex-wrap items-center gap-3">
                  <UserTooltip user={user.participants[1].user}>
                    <Link suppressHydrationWarning
                      href={`/users/${user.participants[1].user.username}`}
                      className="flex items-center justify-center"
                    >
                      <UserAvatar
                        userAvatarUrl={user.participants[1].user.avatarUrl}
                        userName={user.participants[1].user.username}
                      />
                    </Link>
                  </UserTooltip>
                  <div>
                    <UserTooltip user={user.participants[1].user}>
                      <Link suppressHydrationWarning
                        href={`/users/${user.participants[1].user.username}`}
                        className="block font-medium hover:underline"
                      >
                        {user.participants[1].user.displayName}
                      </Link>
                    </UserTooltip>
                    <span className="text-muted-foreground text-xs">
                      {user.participants[1].user.username}
                    </span>
                  </div>
                </div>
              </div>{" "}
            </Link>
          ))
        : null}
    </div>
  );
}

export default MessageUsersFeed;
