import { Prisma } from "@prisma/client";
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    Followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    Following: {
      where: {
        followingId: loggedInUserId,
      },
      select: {
        followingId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        Followers: true,
        Following:true
      },
    },
  } satisfies Prisma.UserSelect;
}
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>
}>
export const userDataSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
      
    },
    likes:{
      where:{
          userId:loggedInUserId
      },
      select:{
          userId:true}
  },
  _count:{
      select:{
          likes:true
      }
  }
  } satisfies Prisma.PostInclude;
}
export const postDataInclude = {
  user: {
    select: userDataSelect,
  },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface FollowersInfo {
  followers: number;
  following?:number;
  isFollowedByUser: boolean;
}
export interface FollowingInfo {
  followings: number;
  isFollowingUser: boolean;
}

export interface LikeInfoType{
  likes: number;
  isLikedByUser: boolean;
}