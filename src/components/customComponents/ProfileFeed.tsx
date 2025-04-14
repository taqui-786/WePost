"use client";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import Post from "../post/Post";
import kyInstance from "@/lib/ky";
import InfiniteScrollingContainer from "./InfiniteScrollingContainer";
import PostsLoadingSkeleton from "../post/PostLoadingSkeleton";
import { Card, CardContent } from "../ui/card";
import { User } from "lucide-react";
interface ProfileFeedProps{
    userId:string
}
function ProfileFeed({userId}:ProfileFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
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
      {!hasNextPage && posts.length ?  <p className="text-primary text-center">
        Now you have reached to an end.
      </p> : ""}
      {!hasNextPage && !posts.length ? (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-6 w-6" />
            </div>
            <h4 className="mb-1 text-base font-medium">Your profile is empty</h4>
            <p className="text-muted-foreground mb-4 text-sm">
             This user do not have any post yet. Checkout another one!
            </p>
          </CardContent>
        </Card>
      ) : ""}
    </InfiniteScrollingContainer>
  );
}

export default ProfileFeed;
