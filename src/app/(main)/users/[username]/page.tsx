import { validateRequest } from "@/auth";
import FollowButton from "@/components/customComponents/FollowButton";
import FollowerCount from "@/components/customComponents/FollowerCount";
import Linkify from "@/components/customComponents/Linkify";
import MyProfileAvatar from "@/components/customComponents/MyProfileAvatar";
import ProfileFeed from "@/components/customComponents/ProfileFeed";
import TrendzSidebar, {
  formatNumber,
} from "@/components/customComponents/TrendzSidebar";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { FollowersInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { cache } from "react";
interface PageProps {
  params: Promise<{ username: string }>;
}
const getUser = cache(async (username: string, loggedUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedUserId),
  });
  if (!user) notFound();
  return user;
});
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  const { username } = await params;
  const user = await getUser(username, loggedInUser.id);
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}
async function page({ params }: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const { username } = await params;
  const user = await getUser(username, loggedInUser.id);
 
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id}  />
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <ProfileFeed userId={user.id} />
      </div>
      <TrendzSidebar />
    </main>
  );
}

export default page;

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ loggedInUserId, user }: UserProfileProps) {
  const followerInfo: FollowersInfo = {
    followers: user._count.Followers,
    isFollowedByUser: user.Followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };
  

  return (
    <div className="bg-card h-fit w-full space-y-5 rounded-2xl p-5 shadow-sm">
      <MyProfileAvatar
        userAvatarUrl={user.avatarUrl}
        userName={user.username}
        userId={user.id}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <Button size="sm">Edit Profile</Button>
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
        {user.bio && (
          <>
            <hr />
            <>
              <Linkify>
                <div className="overflow-hidden break-words whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            </>
          </>
        )}
      </div>
    </div>
  );
}
