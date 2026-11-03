import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

/**
 * Mark all messages in this conversation from the OTHER participant as READ.
 * Called when the conversation is opened and on incoming messages while it's open.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ messageId: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await context.params;

    // Only participants of the conversation may mark it as read.
    const participant = await prisma.participant.findFirst({
      where: { conversationId: messageId, userId: user.id },
      select: { id: true },
    });
    if (!participant) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.message.updateMany({
      where: {
        conversationId: messageId,
        senderId: { not: user.id },
        status: { not: "READ" },
      },
      data: { status: "READ" },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
