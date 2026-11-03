import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect, ConversationListItem } from "@/lib/types";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: getUserDataSelect(user.id),
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: getUserDataSelect(user.id) },
          },
        },
      },
    });

    // Unread messages per conversation (sender is not me and not READ).
    const unread = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversation: { participants: { some: { userId: user.id } } },
        senderId: { not: user.id },
        status: { not: "READ" },
      },
      _count: { _all: true },
    });
    const unreadMap = new Map(
      unread.map((row) => [row.conversationId, row._count._all]),
    );

    const items: ConversationListItem[] = conversations.map((conversation) => ({
      id: conversation.id,
      participants: conversation.participants.map((participant) => ({
        id: participant.id,
        conversationId: participant.conversationId,
        userId: participant.userId,
        user: participant.user,
      })),
      lastMessage: conversation.messages[0] ?? null,
      unreadCount: unreadMap.get(conversation.id) ?? 0,
      createdAt: conversation.createdAt,
    }));

    // Most recent activity first (last message time, else conversation date).
    items.sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.createdAt).getTime();
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return Response.json(items);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
