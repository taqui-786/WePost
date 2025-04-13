import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/customComponents/UserAvatar";
import UserTooltip from "@/components/customComponents/UserTooltip";
import { commentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import CommentMoreButton from "./CommentMoreBtn";

interface CommentComponentProps {
  comment: commentData;
}
function CommentComponent({ comment }: CommentComponentProps) {
  const {user} = useSession()
  return (
    <div className="flex gap-3 py-3 group/comment">
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar
              userAvatarUrl={comment.user.avatarUrl}
              userName={comment.user.username}
            />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-2 text-sm">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`} className="font-medium hover:underline">
         {comment.user.displayName}
          </Link>
        </UserTooltip>
        <span className=" text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <div>{comment.content}</div>
      </div>
{user.id === comment.user.id && (
  <CommentMoreButton comment={comment} className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100 " />
)}
    </div>
  );
}

export default CommentComponent;
