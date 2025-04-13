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
        Following: true
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
    likes: {
      where: {
        userId: loggedInUserId
      },
      select: {
        userId: true
      }
    },
    bookmarks: {
      where: {
        userId: loggedInUserId
      },
      select: {
        userId: true
      }
    },
    _count: {
      select: {
        likes: true,
        Comment: true
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

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId)
    }
  } satisfies Prisma.CommentInclude
}
export type commentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>
export interface CommentsPage {
  comments: commentData[];
  previousCursor: string | null;
}
export interface FollowersInfo {
  followers: number;
  following?: number;
  isFollowedByUser: boolean;
}
export interface FollowingInfo {
  followings: number;
  isFollowingUser: boolean;
}

export interface LikeInfoType {
  likes: number;
  isLikedByUser: boolean;
}
export interface BookmarkInfoType {
  isBookmarkByUser: boolean;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },

  },
  post: {
    select: {
      content: true
    }
  }

} satisfies Prisma.NotificationInclude

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude
}>

export interface NotificationPage {
  notifications: NotificationData[];
  nextCursor: string | null
}