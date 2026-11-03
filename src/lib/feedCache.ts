import type { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { PostData, PostPage } from "@/lib/types";

/**
 * Find a post in any cached infinite post-feed (my-feed, following, profile,
 * hashtags …) so intercepting-route modals can render it instantly.
 */
export function getOrFetchPost(
  queryClient: QueryClient,
  postId: string,
): PostData | undefined {
  const entries = queryClient.getQueriesData<InfiniteData<PostPage>>(
    {
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === "post-feed",
    },
  );

  for (const [, data] of entries) {
    if (!data) continue;
    for (const page of data.pages) {
      const match = page.posts.find((p) => p.id === postId);
      if (match) return match;
    }
  }
  return undefined;
}
