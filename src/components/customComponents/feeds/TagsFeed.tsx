"use client";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import Post from "../../post/Post";
import kyInstance from "@/lib/ky";
import InfiniteScrollingContainer from "../InfiniteScrollingContainer";
import PostsLoadingSkeleton from "../../post/PostLoadingSkeleton";
import { Card, CardContent } from "../../ui/card";
import { Pin } from "lucide-react";

function HashtagsFeed({hashtag}:{hashtag:string}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [ "post-feed","hashtags",hashtag],
    queryFn: ({ pageParam }) =>
        kyInstance
          .get(`/api/hashtag`, {
            searchParams: {
              q: hashtag,
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          })
          .json<PostPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  const posts = data?.pages.flatMap((page) => page.posts) || [];
  if (status === "pending" || isFetching && !isFetchingNextPage) {
    return <PostsLoadingSkeleton />;
  }
  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occured while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollingContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <PostsLoadingSkeleton />}
      {!hasNextPage && !posts.length  ? (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Pin className="text-muted-foreground h-6 w-6" />
            </div>
            <h4 className="mb-1 text-base font-medium">No Bookmarked Posts!</h4>
            <p className="text-muted-foreground mb-4 text-sm">
             You do not have any post bookmarked yet.
            </p>
          </CardContent>
        </Card>
      ) : ""}
    </InfiniteScrollingContainer>
  );
}

export default HashtagsFeed;
