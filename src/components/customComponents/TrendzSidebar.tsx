import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import {  Tag, UserPlus } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { unstable_cache } from "next/cache";
import FollowButton from "./FollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import UserTooltip from "./UserTooltip";
import { TrendingTopicsLoadingSkeleton, WhoToFollowLoadingSkeleton } from "../skeletons/TrendzSidebarSkeleton";

import TrendingLink from "./TrendingLink";

function TrendzSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<>
        <div className="space-y-5">
          <WhoToFollowLoadingSkeleton/>
          <TrendingTopicsLoadingSkeleton/>
        </div>
        </>}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

export default TrendzSidebar;

async function WhoToFollow() {
  const { user } = await validateRequest();
  if (!user) return null;
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user?.id,
      },
      Followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });
  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
      </CardHeader>
      {!usersToFollow.length && (
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <UserPlus className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No suggestions yet</h3>
          <p className="text-muted-foreground mb-4 max-w-xs text-sm">
            We are working on finding interesting people for you to follow.
            Check back soon!
          </p>
        </CardContent>
      )}
      <CardContent className="space-y-5">
        {usersToFollow.map((user) => {
          return (
            <div
              className="flex items-center justify-between gap-3"
              key={user.id}
            >
              <UserTooltip user={user}>
              <Link
                href={`/users/${user.username}`}
                className="flex items-center gap-3"
              >
                <UserAvatar
                  userAvatarUrl={user.avatarUrl}
                  className="flex-none"
                  userName={user.username}
                />
                <div>
                  <p className="line-clamp-1 font-semibold break-all hover:underline">
                    {user.displayName}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-xs break-all">
                    @{user.username}
                  </p>
                </div>
              </Link></UserTooltip>
              <FollowButton
                userId={user.id}
                initialState={{
                  followers: user._count.Followers,
                  isFollowedByUser: user.Followers.some(
                    ({ followerId }) => followerId === user.id,
                  ),
                }}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
              SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
              FROM posts
              GROUP BY (hashtag)
              ORDER BY count DESC, hashtag ASC
              LIMIT 5
          `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);
async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  
  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Trending topics</CardTitle>
      </CardHeader>
      {!trendingTopics.length && (
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Tag className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No trending topics</h3>
          <p className="text-muted-foreground mb-4 max-w-xs text-sm">
            We are working on finding interesting topics for you. Check back
            soon!
          </p>
        </CardContent>
      )}
      <CardContent className="space-y-5">
        {trendingTopics.map(({ hashtag, count }) => {
          const title = hashtag.split('#')[1];
          return (
            <TrendingLink
              key={title}
              title={title}
              hashtag={hashtag}
              count={count}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
export const formatNumber = (n: number): string => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};
