import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

export default function PostsLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  );
}

/**
 * Shimmer placeholder that mirrors the PostCard geometry so the feed
 * doesn't jump when real posts hydrate.
 */
export function PostLoadingSkeleton() {
  return (
    <Card aria-hidden="true" className="animate-pulse">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 flex-none rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-11/12 rounded" />
          <Skeleton className="h-3.5 w-2/3 rounded" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
