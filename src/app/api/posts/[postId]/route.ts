import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

/**
 * Returns a single post in the same shape used by feeds (PostData), so the
 * intercepted-route modal can render it without a bespoke DTO.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(user.id),
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json(post);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
