import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {  BookmarkInfoType } from "@/lib/types";



export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
const {postId} = await context.params;
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
    });

    const data: BookmarkInfoType = {
      isBookmarkByUser: !!bookmark,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
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
    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.bookmark.findUnique({
        where: { userId_postId: { userId: loggedInUser.id, postId } },
        select: { id: true },
      });
      if (existing) return false;
      await tx.bookmark.create({
        data: { userId: loggedInUser.id, postId },
      });
      await tx.post.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      });
      return true;
    });

    return Response.json(
      { message: created ? "Post Bookmarked" : "Already Bookmarked" },
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
      await prisma.$transaction(async (tx) => {
        const deleted = await tx.bookmark.deleteMany({
          where: {
            userId: loggedInUser.id,
            postId: postId,
          },
        });
        if (deleted.count > 0) {
          await tx.post.update({
            where: { id: postId },
            data: { bookmarkCount: { decrement: 1 } },
          });
        }
      });
      return new Response();
    } catch (error) {
      console.log(error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  