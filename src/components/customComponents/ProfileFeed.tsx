"use client";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import Post from "../post/Post";
import kyInstance from "@/lib/ky";
import InfiniteScrollingContainer from "./InfiniteScrollingContainer";
import PostsLoadingSkeleton from "../post/PostLoadingSkeleton";
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
      {!hasNextPage && !posts.length && (
        <p className="text-primary text-center">This User do not have any posts.</p>
      )}
    </InfiniteScrollingContainer>
  );
}

export default ProfileFeed;
