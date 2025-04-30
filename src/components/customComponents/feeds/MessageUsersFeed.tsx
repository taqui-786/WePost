"use client";
import kyInstance from "@/lib/ky";
import { messageParticipantType } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import UserCardSkeleton from "@/components/skeletons/UserCardSkeleton";
import { useSocket } from "@/hooks/SocketContext";
type ActiveUserEntry = [userId: string, socketId: string];

type ActiveUsersList = ActiveUserEntry[];
function MessageUsersFeed({ userId }: { userId: string | undefined }) {
  const [activeUsers, setActiveUsers] = useState<ActiveUsersList | undefined>();
  const { socket } = useSocket();
const queryClient = useQueryClient()
const query = useQuery({
  queryKey: ["chat-users", userId],
  queryFn: () =>
    kyInstance.get("/api/message/users").json<messageParticipantType[]>(),
});
  useEffect(() => {
    socket?.emit("set-user-active", null, (data: ActiveUsersList) => {
      const filteredUser = data.filter(
        (user: Array<string>) => user[0] !== userId,
      );
      setActiveUsers(filteredUser);
    });
    socket?.on("users-active", (data) => {
      setActiveUsers(() =>
        data.filter((user: Array<string>) => user[0] !== userId),
      );
    });
    socket?.on("refresh-chat-feed", () => {
      console.log("Refreshing feed....");
      
     queryClient.invalidateQueries({queryKey:["chat-users",userId]})
    });
  }, [socket]);
  console.log({ activeUsers });

  const users = query.data;
  return (
    <div className="flex w-full flex-col space-y-3 px-4">
      {query.isPending &&
        Array.from({ length: 4 }).map((_, i) => {
          return <UserCardSkeleton withBtn={false} key={i} />;
        })}
      {users
        ? users.map((user) => {
            const theUser =
              user.participants[0].userId === userId
                ? user.participants[1].user
                : user.participants[0].user;
            return (
              <Link
                href={`/messages/${user.id}`}
                className="cursor-pointer"
                title="message"
                key={user.id}
                suppressHydrationWarning
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <UserTooltip user={theUser}>
                      <Link
                        href={`/users/${theUser.username}`}
                        suppressHydrationWarning
                        className="flex items-center justify-center"
                      >
                        <UserAvatar
                          userAvatarUrl={theUser.avatarUrl}
                          userName={theUser.username}
                        />
                      </Link>
                    </UserTooltip>
                    <div>
                      <UserTooltip user={theUser}>
                        <Link
                          href={`/users/${theUser.username}`}
                          suppressHydrationWarning
                          className="block font-medium hover:underline"
                        >
                          {theUser.displayName}
                        </Link>
                      </UserTooltip>

                      {activeUsers?.find(
                        (usr: Array<string>) => usr[0] === theUser.id,
                      ) ? (
                        <span className="text-xs font-medium text-green-500">
                          Active Now
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {theUser.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>{" "}
              </Link>
            );
          })
        : null}
    </div>
  );
}

export default MessageUsersFeed;
