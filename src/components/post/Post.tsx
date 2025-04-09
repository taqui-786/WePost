import { PostData } from "@/lib/types";
import Link from "next/link";
import React from "react";
import UserAvatar from "../customComponents/UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import { Card, CardContent } from "../ui/card";
import Linkify from "../customComponents/Linkify";
import UserTooltip from "../customComponents/UserTooltip";

function Post({ post }: { post: PostData }) {
  const { user } = useSession();
  return (
    <Card className="group">
      <CardContent>
        <article>
          <div className="flex justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <UserTooltip user={post.user}>
                <Link
                  href={`/users/${post.user.username}`}
                  className="flex items-center justify-center"
                >
                  <UserAvatar
                    userAvatarUrl={post.user.avatarUrl}
                    userName={post.user.username}
                  />
                </Link>
              </UserTooltip>
              <div className="">
                <UserTooltip user={post.user}>
                  <Link
                    href={`/users/${post.user.username}`}
                    className="block font-medium hover:underline"
                  >
                    {post.user.username}
                  </Link>
                </UserTooltip>
                <span className="text-muted-foreground text-xs">
                  {formatRelativeDate(post.createdAt)}
                </span>
              </div>
            </div>
            {user.id === post.user.id && (
              <PostMoreButton
                post={post}
                className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
              />
            )}
          </div>
          <Linkify>
            <div className="mt-2 text-sm font-normal break-words whitespace-pre-line">
              {post.content}
            </div>
          </Linkify>
        </article>
      </CardContent>
    </Card>
  );
}

export default Post;
