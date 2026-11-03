"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { queryKeys } from "@/lib/query-keys";
import { getOrFetchPost } from "@/lib/feedCache";
import Post from "@/components/post/Post";
import { PostLoadingSkeleton } from "@/components/post/PostLoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostData } from "@/lib/types";

/**
 * Intercepting route: opening /posts/[postId] via a client-side <Link> renders
 * this modal on top of the feed (scroll position preserved), while a direct
 * URL load renders the full page at (main)/posts/[postId].
 */
export default function InterceptedPostModal() {
  const router = useRouter();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const queryClient = useQueryClient();

  // Serve instantly from the feed cache when present (0ms first paint).
  const cachedPost = getOrFetchPost(queryClient, postId);

  const { data: post } = useQuery<PostData>({
    queryKey: ["post-detail", postId],
    queryFn: () => kyInstance.get(`/api/posts/${postId}`).json<PostData>(),
    initialData: cachedPost,
    initialDataUpdatedAt: cachedPost ? 0 : undefined,
    staleTime: 60_000,
  });

  return (
    <Dialog open onOpenChange={(open) => (!open ? router.back() : undefined)}>
      <DialogContent
        className="max-h-[88vh] max-w-2xl overflow-y-auto p-0 sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">Post Details</DialogTitle>
        {post ? (
          <div className="bg-card">
            <Post post={post} />
          </div>
        ) : (
          <div className="p-6">
            <PostLoadingSkeleton />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
