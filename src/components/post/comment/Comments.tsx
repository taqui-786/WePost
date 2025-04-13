import { CommentsPage, PostData } from "@/lib/types";
import React from "react";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import CommentComponent from "./CommentComponent";
import { Button } from "@/components/ui/button";
import CommentsLoadingSkeleton from "@/components/skeletons/CommentLoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

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
    <div className="mt-4 space-y-3">
      <CommentInput post={post} />
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
      )}
      {status === "pending" && <CommentsLoadingSkeleton />}
      {status === "success" && !comments.length && (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <MessageSquare className="text-muted-foreground h-6 w-6" />
            </div>
            <h4 className="mb-1 text-base font-medium">No comments yet</h4>
            <p className="text-muted-foreground mb-4 text-sm">
              Be the first to share your thoughts on this post
            </p>
          </CardContent>
        </Card>
      )}
      {status === "error" && (
        <p className="text-destructive text-center font-medium">
          Failed To Load Comments.
        </p>
      )}
      <div className="divide-y">
        {comments.map((comment) => (
          <CommentComponent key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

export default Comments;
