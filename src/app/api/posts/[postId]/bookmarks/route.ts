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
    await prisma.bookmark.upsert({
        where:{
            userId_postId:{
                userId:loggedInUser.id,
                postId:postId
            }
        },
        create:{
            userId: loggedInUser.id,
            postId: postId,
        },
        update:{}
    })
return Response.json({message:"Post Bookmarked"}, { status: 200 });
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
      await prisma.bookmark.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId: postId,
        },
      });
      return new Response();
    } catch (error) {
      console.log(error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  