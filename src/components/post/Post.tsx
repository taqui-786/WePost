'use client'
import { PostData } from "@/lib/types";
import Link from "next/link";
import React, { useState } from "react";
import UserAvatar from "../customComponents/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import { Card, CardContent } from "../ui/card";
import Linkify from "../customComponents/Linkify";
import UserTooltip from "../customComponents/UserTooltip";
import Image from "next/image";
import LikeButton from "../customComponents/LikeButton";
import BookmarkButton from "../customComponents/BookmarkButton";
import { MessageSquare } from "lucide-react";
import Comments from "./comment/Comments";

function Post({ post }: { post: PostData }) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false)
  return (
    <Card className="group py-4">
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
                <Link href={`/posts/${post.id}`} suppressHydrationWarning className="block hover:underline">
                <span className="text-muted-foreground text-xs">
                  {formatRelativeDate(post.createdAt)}
                </span>
                </Link>
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
          {post.images.length ?
          <div
            className={cn(
              "flex flex-col gap-3 my-4",
              post.images.length > 1 && "sm:grid sm:grid-cols-2 ",
            )}
          >
             {  post.images.map((media, indx) => {
                  return <MediaPreview media={media} key={indx} />;
                })}
          </div>
              : ""}
          <hr className="text-muted-foreground w-full mt-2 pb-4" />
          <div className="flex items-center ">
                <div className="flex items-center gap-5">

          <LikeButton postId={post.id} initialState={{
            likes: post._count.likes,
            isLikedByUser: !!post.likes.some(({userId}) => userId === user.id)
          }} />
          <CommentButton post={post} onClick={() => setShowComments(!showComments)}  />
          </div>
          <BookmarkButton postId={post.id} initialState={{
            isBookmarkByUser: !!post.bookmarks.some(({userId}) => userId === user.id)
          }} />
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
  post:PostData,
  onClick: () => void
}

function CommentButton({post,onClick}:CommentsButton){
  return(
    <button onClick={onClick} className="flex items-center gap-2 cursor-pointer">
      <MessageSquare className="size-5 " />
      <span className="text-sm font-medium tabular-nums">{post._count.Comment} <span className="hidden sm:inline">comments</span></span>
    </button>
  )
}