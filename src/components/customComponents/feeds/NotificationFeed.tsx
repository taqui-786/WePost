"use client";
import { NotificationPage } from "@/lib/types";
import { QueryClient, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import kyInstance from "@/lib/ky";
import InfiniteScrollingContainer from "../InfiniteScrollingContainer";
import PostsLoadingSkeleton from "../../post/PostLoadingSkeleton";
import { Card, CardContent } from "../../ui/card";
import { Bell } from "lucide-react";
import NotificationComponent from "../NotificationComponent";

function NotificationFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/notifications`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const queryClient:QueryClient = useQueryClient();
  const {mutate} = useMutation({
    mutationFn: () => kyInstance.patch('/api/notifications/mark-as-read'),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notifications-count"], {
        unreadcount:0
      })
    },
    onError(error){
      console.log(error);
      
    }
  });

  useEffect(() => {
    mutate()
  },[mutate])
  const notifications = data?.pages.flatMap((page) => page.notifications) || [];
  if (status === "pending" || (isFetching && !isFetchingNextPage)) {
    return <PostsLoadingSkeleton />;
  }
  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occured while loading notifications.
      </p>
    );
  }

  return (
    <InfiniteScrollingContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {notifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          notification={notification}
        />
      ))}
      {isFetchingNextPage && <PostsLoadingSkeleton />}
      {!hasNextPage && !notifications.length ? (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Bell className="text-muted-foreground h-6 w-6" />
            </div>
            <h4 className="mb-1 text-base font-medium">
              No Notifications yet!
            </h4>
            <p className="text-muted-foreground mb-4 text-sm">
              This user do not have any notifications yet, Checkout another
              time.
            </p>
          </CardContent>
        </Card>
      ) : (
        ""
      )}
    </InfiniteScrollingContainer>
  );
}

export default NotificationFeed;
