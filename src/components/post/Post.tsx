"use client";
import { PostData } from "@/lib/types";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "../customComponents/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import { Card, CardContent } from "../ui/card";
import Linkify from "../customComponents/Linkify";
import UserTooltip from "../customComponents/UserTooltip";
import Image from "next/image";
import LikeButton from "../customComponents/actionButtons/LikeButton";
import BookmarkButton from "../customComponents/actionButtons/BookmarkButton";
import { MessageSquare } from "lucide-react";
import Comments from "./comment/Comments";
import { usePathname } from "next/navigation";
import { PostShareButton } from "../customComponents/actionButtons/PostShare";

function Post({ post }: { post: PostData }) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const pathName = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1;
      setIsClamped(isOverflowing);
    }
  }, [post.content]);
  return (
    <Card className="group ">
      <CardContent className="p-6">
        <article>
          <div className="flex justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <UserTooltip user={post.user}>
                <Link
                  href={`/users/${post.user.username}`}
                  suppressHydrationWarning
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
                    suppressHydrationWarning
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
          <Link
                  href={`/posts/${post.id}`}
                  suppressHydrationWarning
                  className="block hover:cursor-pointer"
                >
          <Linkify>
            <div className="mt-2 text-sm font-normal break-words whitespace-pre-line">
              <div ref={contentRef} className={cn(pathName.startsWith('/posts') ? "" : "line-clamp-5")}>
                {post.content}
              </div>

              {isClamped && !pathName.startsWith('/posts') && (
                <Link
                  href={`/posts/${post.id}`}
                  className="ml-1 cursor-pointer text-blue-500"
                >
                  See more
                </Link>
              )}
            </div>
          </Linkify>
          {post.images.length ? (
            <div
              className={cn(
                "my-4 flex flex-col gap-3",
                post.images.length > 1 && "sm:grid sm:grid-cols-2",
              )}
            >
              {post.images.map((media, indx) => {
                return <MediaPreview media={media} key={indx} />;
              })}
            </div>
          ) : (
            ""
          )} </Link>
          <hr className="text-muted-foreground mt-2 w-full pb-4" />
          <div className="flex items-center">
            <div className="flex items-center gap-5">
              <LikeButton
                postId={post.id}
                username={post.user.username}
                initialState={{
                  likes: post._count.likes,
                  isLikedByUser: !!post.likes.some(
                    ({ userId }) => userId === user.id,
                  ),
                }}
              />
              <CommentButton
                post={post}
                onClick={() => setShowComments(!showComments)}
              />
              <PostShareButton postId={post.id} />
            </div>
            <BookmarkButton
              postId={post.id}
              initialState={{
                isBookmarkByUser: !!post.bookmarks.some(
                  ({ userId }) => userId === user.id,
                ),
              }}
            />
          </div>
        </article>
        {showComments && <Comments post={post} />}
      </CardContent>
    </Card>
  );
}

export default Post;

interface MediaPreviewProps {
  media: string;
}

function MediaPreview({ media }: MediaPreviewProps) {
  // if (media.includes("2Fimage")) {
  //   return <DynamicImage url={media} />;
  // }
  if (media.includes("2Fimage")) {
    return (
      <Image
        src={media}
        alt="Attachment"
        width={500}
        height={500}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABDQottAAAAABJRU5ErkJggg=="
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.includes("2Fvideo")) {
    return (
      <div>
        <video
          src={media}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentsButton {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentsButton) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2"
    >
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.Comment} <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
