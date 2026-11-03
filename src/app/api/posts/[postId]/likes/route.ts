import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfoType } from "@/lib/types";
import { publishGlobal, publishToUser } from "@/lib/realtime";

export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Uauthorized" }, { status: 401 });
    }
    const { postId } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likeCount: true,
        likes: { where: { userId: user.id }, select: { userId: true } },
      },
    });
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfoType = {
      likes: post.likeCount,
      isLikedByUser: post.likes.length > 0,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Atomic explicit like/unlike: the Like row and Post.likeCount always agree.
 * Returns the new state + count from inside the transaction.
 */
async function performLikeAction(
  postId: string,
  loggedInUser: { id: string; username: string },
  action: "like" | "unlike",
) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) throw new Error("Post not found");

    const existing = await tx.like.findUnique({
      where: { userId_postId: { userId: loggedInUser.id, postId } },
      select: { id: true },
    });

    if (action === "like") {
      if (existing) {
        // Already liked: no-op writes, reuse the denormalized counter.
        const current = await tx.post.findUnique({
          where: { id: postId },
          select: { likeCount: true },
        });
        return { isLiked: true, likes: current?.likeCount ?? 0, ownerId: post.userId };
      }
      await tx.like.create({ data: { userId: loggedInUser.id, postId } });
      const updated = await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
      if (loggedInUser.id !== post.userId) {
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: post.userId,
            postId,
            type: "LIKE",
          },
        });
      }
      return { isLiked: true, likes: updated.likeCount, ownerId: post.userId };
    }

    // action === "unlike"
    if (!existing) {
      const current = await tx.post.findUnique({
        where: { id: postId },
        select: { likeCount: true },
      });
      return { isLiked: false, likes: current?.likeCount ?? 0, ownerId: post.userId };
    }
    await tx.like.delete({
      where: { userId_postId: { userId: loggedInUser.id, postId } },
    });
    const updated = await tx.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
      select: { likeCount: true },
    });
    if (loggedInUser.id !== post.userId) {
      await tx.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      });
    }
    return {
      isLiked: false,
      likes: Math.max(0, updated.likeCount),
      ownerId: post.userId,
    };
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId } = await context.params;

    const result = await performLikeAction(postId, loggedInUser, "like");

    if (result.ownerId !== loggedInUser.id) {
      await publishToUser(result.ownerId, {
        type: "post-liked",
        payload: { from: loggedInUser.username, postId },
      });
      await publishToUser(result.ownerId, {
        type: "notification",
        payload: { type: "LIKE", postId },
      });
    }
    await publishGlobal({
      type: "like-updated",
      payload: { postId, likes: result.likes },
    });

    return Response.json(
      { isLiked: result.isLiked, likes: result.likes },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId } = await context.params;

    const result = await performLikeAction(postId, loggedInUser, "unlike");

    if (result.ownerId !== loggedInUser.id) {
      await publishToUser(result.ownerId, {
        type: "notification",
        payload: { type: "LIKE_REMOVED", postId },
      });
    }
    await publishGlobal({
      type: "like-updated",
      payload: { postId, likes: result.likes },
    });

    return Response.json({ isLiked: result.isLiked, likes: result.likes });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
