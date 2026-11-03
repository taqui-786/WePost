import React from "react";
import UserAvatar from "../customComponents/UserAvatar";
import { UserData } from "@/lib/types";
import UserTooltip from "../customComponents/UserTooltip";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ChatActionDropdown from "./ChatActionDropdown";

function MessageHeader({
  user,
  conversationId,
}: {
  user: UserData;
  conversationId: string;
}) {
  return (
    <div className="flex w-full shrink-0 items-center justify-between gap-2 border-b p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile: back to the conversation list */}
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="hover:bg-muted -ml-1 flex size-8 shrink-0 items-center justify-center rounded-full md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <UserTooltip user={user}>
          <Link
            href={`/users/${user.username}`}
            suppressHydrationWarning
            className="flex items-center justify-center"
          >
            <UserAvatar
              userAvatarUrl={user.avatarUrl}
              userName={user.username}
              size={40}
            />
          </Link>
        </UserTooltip>
        <div className="min-w-0">
          <UserTooltip user={user}>
            <Link
              href={`/users/${user.username}`}
              suppressHydrationWarning
              className="block truncate font-medium hover:underline"
            >
              {user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground text-xs">@{user.username}</span>
        </div>
      </div>

      <ChatActionDropdown conversationId={conversationId} />
    </div>
  );
}

export default MessageHeader;
