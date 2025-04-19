"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { MailPlus, User } from "lucide-react";
import { Input } from "../ui/input";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserPage } from "@/lib/types";
import kyInstance from "@/lib/ky";
import InfiniteScrollingContainer from "../customComponents/InfiniteScrollingContainer";
import UserTooltip from "../customComponents/UserTooltip";
import Link from "next/link";
import UserAvatar from "../customComponents/UserAvatar";
import { useDebounce } from "@/hooks/useDebounce";
import UserCardSkeleton from "../skeletons/UserCardSkeleton";
import { Card, CardContent } from "../ui/card";

function AddUsersToMessageDialog({ userId }: { userId: string | undefined }) {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 500);


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["user-data", "user-search", debouncedQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(`/api/users/search`, {
          searchParams: {
            q: debouncedQuery || "",
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<UserPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const users = data?.pages.flatMap((page) => page.users) || [];

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occured while loading posts.
      </p>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <MailPlus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select User To Chat.</DialogTitle>
        </DialogHeader>
        <div className="flex w-full flex-col">
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search with username..."
              value={query}
              onChange={(e) => setQuery(e.target.value as string)}
            />
          </div>
        </div>
        {status === "pending" || (isFetching && !isFetchingNextPage) ? (
          Array.from({length:4}).map((_,i) => {
            return <UserCardSkeleton key={i} />
          })
        ) : (
          <InfiniteScrollingContainer
            onBottomReached={() =>
              hasNextPage && !isFetching && fetchNextPage()
            }
            className="space-y-5"
          >
            {users.map((user) => (
              <div className="flex items-center justify-between " key={user.id}>
                <div className="flex flex-wrap items-center gap-3">
                <UserTooltip user={user}>
                  <Link
                    href={`/users/${user.username}`}
                    className="flex items-center justify-center"
                  >
                    <UserAvatar
                      userAvatarUrl={user.avatarUrl}
                      userName={user.username}
                    />
                  </Link>
                </UserTooltip>
                <div >
                  <UserTooltip user={user}>
                    <Link
                      href={`/users/${user.username}`}
                      className="block font-medium hover:underline  "
                    >
                      {user.displayName}
                      {user.Followers.some(
                        ({ followerId }) => followerId === userId,
                      ) ? (
                        <span className="text-primary text-xs font-medium ml-4">
                          Following
                        </span>
                      ) : null}
                    </Link>
                  </UserTooltip>
                  <span className="text-muted-foreground text-xs">
                    {user.username}
                  </span>
                </div>
                </div>
                <Button size="sm" >Chat</Button>
              </div>
            ))}
            {isFetchingNextPage && <UserCardSkeleton />}
            {!isFetching && !hasNextPage && !users.length  ? (
                <Card className="w-full border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
                  <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <User className="text-muted-foreground h-6 w-6" />
                  </div>
                  <h4 className="mb-1 text-base font-medium">No Users Found!</h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                   No users exists with this @username or Fullname.
                  </p>
                </CardContent>
              </Card>
            ):""}
          </InfiniteScrollingContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddUsersToMessageDialog;
