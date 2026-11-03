import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

/** Total unread messages across all of the user's conversations (sidebar dot). */
export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.message.count({
      where: {
        conversation: { participants: { some: { userId: user.id } } },
        senderId: { not: user.id },
        status: { not: "READ" },
      },
    });

    return Response.json({ count });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
