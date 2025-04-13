import { CommentsPage, PostData } from "@/lib/types";
import React from "react";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import CommentComponent from "./CommentComponent";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  post: PostData;
}
function Comments({ post }: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });
  const comments = data?.pages.flatMap((page) => page.comments) || [];
  return (
    <div className="space-y-3 mt-4">
      <CommentInput post={post} />
      {hasNextPage && (
        <Button variant="link" className="mx-auto block" disabled={isFetching} onClick={() => fetchNextPage()}>Load previous comments</Button>
      )}
      {status === 'pending' && <Loader2 className="mx-auto animate-spin" />}
      {status === 'success' && !comments.length && (
        <p className="text-muted-foreground text-center font-medium"> No Comments Yet.</p>
      ) } 
      {status === 'error' && (
        <p className="text-destructive text-center font-medium">Failed To Load Comments.</p>
      ) } 
      <div className="divide-y">
        {comments.map((comment) => ( 
          <CommentComponent key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

export default Comments;
