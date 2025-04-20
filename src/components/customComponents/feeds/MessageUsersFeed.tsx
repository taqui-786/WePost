"use client";
import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import AddUserToMsgBtn from "@/components/messages/AddUserToMsgBtn";

function MessageUsersFeed({ userId }: { userId: string | undefined }) {
  const query = useQuery({
    queryKey: ["chat-users"],
    queryFn: () => kyInstance.get("/api/message/users").json<Array<{id:string, participants:UserData[]}>>(),
  });
  console.log("query-", query.data);
  const users = query.data;
  return (
    <div className="flex flex-col space-y-3">
      {users ? users.map((user) => (
        <div className="flex items-center justify-between" key={user.id}>
          <div className="flex flex-wrap items-center gap-3">
            <UserTooltip user={user.participants[1]}>
              <Link
                href={`/users/${user.participants[1].username}`}
                className="flex items-center justify-center"
              >
                <UserAvatar
                  userAvatarUrl={user.participants[1].avatarUrl}
                  userName={user.participants[1].username}
                />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={user.participants[1]}>
                <Link
                  href={`/users/${user.participants[1].username}`}
                  className="block font-medium hover:underline"
                >
                  {user.participants[1].displayName}
                 
                </Link>
              </UserTooltip>
              <span className="text-muted-foreground text-xs">
                {user.participants[1].username}
              </span>
            </div>
          </div>
        </div>
      )) : "No Users Yet"}
    </div>
  );
}

export default MessageUsersFeed;
