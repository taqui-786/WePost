/**
 * Centralized TanStack Query keys.
 *
 * A single source of truth so an optimistic mutation can update every cache
 * that renders the same entity (feed, following feed, profile, bookmarks,
 * detail view) without guessing key shapes at each call site.
 */
export const queryKeys = {
  // Post feeds — `[ "post-feed", <kind>, ...args ]`
  allFeeds: ["post-feed"] as const,
  myFeed: ["post-feed", "my-feed"] as const,
  followingFeed: ["post-feed", "following"] as const,
  userPosts: (userId: string) => ["post-feed", "user-posts", userId] as const,
  bookmarks: ["post-feed", "bookmarks"] as const,
  hashtagFeed: (hashtag: string) => ["post-feed", "hashtags", hashtag] as const,
  searchFeed: (query: string) => ["post-feed", "search", query] as const,

  // Post sub-resources
  likeInfo: (postId: string) => ["like-info", postId] as const,
  bookmarkInfo: (postId: string) => ["bookmark-info", postId] as const,
  comments: (postId: string) => ["comments", postId] as const,

  // Notifications
  notifications: ["notifications"] as const,
  unreadNotifications: ["unread-notifications-count"] as const,

  // Messaging
  chatUsers: (userId: string | undefined) => ["chat-users", userId] as const,
  messages: (conversationId: string) => ["user-messages", conversationId] as const,
  messageUnread: ["message-unread-count"] as const,
} as const;

/** Minimal shape shared by feed posts for cross-cache like updates. */
export interface LikeablePost {
  id: string;
  likeCount: number;
  likes: { userId: string }[];
}

/** True when a post in any cache belongs to the given id. */
export function isLikeablePost(value: unknown): value is LikeablePost {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    "likeCount" in value &&
    "likes" in value
  );
}
