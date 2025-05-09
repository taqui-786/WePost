import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET() {
    try {
        const { user } = await validateRequest();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const data = await prisma.conversation.findMany({
            where: {
              participants: {
                some: {
                  userId: user.id,
                },
              },
            },
            include: {
              participants: {
                include: {
                  user: {
                    select: getUserDataSelect(user.id)
                  },
                },
              },
            },
          });
          return Response.json(data)
    } catch (error) {
        console.log(error);

        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}