import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfoType } from "@/lib/types";

export async function GET(req:Request,context: { params: Promise<{ postId: string }> },){
try {
     const { user } = await validateRequest();
        if (!user) {
          return Response.json({ error: "Uauthorized" }, { status: 401 });
        }
        const { postId } = await context.params;
        const post = await prisma.post.findUnique({
          where: { id: postId },
        select:{
            likes:{
                where:{
                    userId:user.id
                },
                select:{
                    userId:true}
            },
            _count:{
                select:{
                    likes:true
                }
            }
        }
        });
        if (!post) {
          return Response.json({ error: "Post not found" }, { status: 404 });
        }
        const data:LikeInfoType = {
            likes: post._count.likes,
            isLikedByUser: !!post.likes.length,
        }
        return Response.json(data);
} catch (error) {
    console.log(error);

    return Response.json({ error: "Internal Server Error" }, { status: 500 });
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
    await prisma.like.upsert({
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
return Response.json({message:"Post Liked"}, { status: 200 });
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
      await prisma.like.deleteMany({
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
  