import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getMessageDataInclude, MessagePage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ messageId: string }> },) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Uauthorized" }, { status: 401 });
    }
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 12;
    const { messageId } = await context.params
    const messages = await prisma.message.findMany({
      where: {
        conversationId: messageId
      },

      include: getMessageDataInclude(user.id),
      orderBy: {
        createdAt: "asc",
      },
      take:  -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
     const previousCursor =
          messages.length > pageSize ? messages[0].id : null;
    
        const data: MessagePage = {
          messages: messages.length > pageSize ? messages.slice(1) : messages,
          previousCursor: previousCursor,
        };
    
    return Response.json(data)
  } catch (error) {
    console.log(error);

    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}