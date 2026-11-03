import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getMessageDataInclude, MessagePage } from "@/lib/types";

export async function GET(
  req: Request,
  context: { params: Promise<{ messageId: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
    const { messageId } = await context.params;

    const participant = await prisma.participant.findFirst({
      where: { conversationId: messageId, userId: user.id },
      select: { id: true },
    });
    if (!participant) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const pageSize = 12;
    // Newest first, then flip each page into chronological order.
    const rows = await prisma.message.findMany({
      where: { conversationId: messageId },
      include: getMessageDataInclude(user.id),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = rows.length > pageSize;
    const page = hasMore ? rows.slice(0, pageSize) : rows;
    const previousCursor = hasMore ? page[page.length - 1].id : null;

    const data: MessagePage = {
      messages: [...page].reverse(),
      previousCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
