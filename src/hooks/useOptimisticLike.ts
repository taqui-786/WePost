"use client";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { queryKeys, LikeablePost, isLikeablePost } from "@/lib/query-keys";
import type { PostPage } from "@/lib/types";

type LikeAction = "like" | "unlike";

/**
 * Zero-latency like toggle.
 *
 * Optimistically patches every cache that renders the post — main feeds and the
 * post-detail view — before the network roundtrip; rolls back automatically on error.
 */
export function useOptimisticLike(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const isFeedKey = (key: readonly unknown[]) => key[0] === "post-feed";

  const applyToPost = (
    post: LikeablePost,
    next: boolean,
  ): LikeablePost => ({
    ...post,
    likeCount: Math.max(0, post.likeCount + (next ? 1 : -1)),
    likes: next
      ? [...post.likes, { userId: user.id }]
      : post.likes.filter((l) => l.userId !== user.id),
  });

  const updateFeedCaches = (next: boolean) => {
    // Feeds are InfiniteData<PostPage> objects with pages[].posts[].
    queryClient.setQueriesData({
      predicate: (query) => isFeedKey(query.queryKey),
    }, (old: unknown) => {
      const data = old as InfiniteData<PostPage> | undefined;
      if (!data?.pages) return old as never;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) => {
            if (!isLikeablePost(post) || post.id !== postId) return post;
            return applyToPost(post as unknown as LikeablePost, next) as never;
          }),
        })),
      } as never;
    });
  };

  return useMutation({
    mutationFn: (action: LikeAction) => {
      const url = `/api/posts/${postId}/likes`;
      return action === "like"
        ? kyInstance.post(url).json<{ isLiked: boolean; likes: number }>()
        : kyInstance.delete(url).json<{ isLiked: boolean; likes: number }>();
    },

    onMutate: async (action) => {
      const next = action === "like";
      // Cancel in-flight feed fetches so they don't overwrite the optimistic state.
      await queryClient.cancelQueries({ predicate: (q) => isFeedKey(q.queryKey) });

      // Snapshot for rollback.
      const previous = queryClient.getQueriesData({
        predicate: (q) => isFeedKey(q.queryKey),
      });
      const previousLikeInfo = queryClient.getQueryData(queryKeys.likeInfo(postId));

      updateFeedCaches(next);
      queryClient.setQueryData(queryKeys.likeInfo(postId), (old:
        | { likes: number; isLikedByUser: boolean }
        | undefined) =>
        old
          ? {
              isLikedByUser: next,
              likes: Math.max(0, old.likes + (next ? 1 : -1)),
            }
          : old,
      );

      return { previous, previousLikeInfo };
    },

    onError: (_err, _action, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key as never, data as never);
      });
      if (context?.previousLikeInfo !== undefined) {
        queryClient.setQueryData(queryKeys.likeInfo(postId), context.previousLikeInfo);
      }
    },

    onSuccess: (data) => {
      // Reconcile with the authoritative count from the server.
      queryClient.setQueryData(queryKeys.likeInfo(postId), {
        isLikedByUser: data.isLiked,
        likes: data.likes,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likeInfo(postId) });
      // Feed caches reconcile silently on their own next fetch.
    },
  });
}
