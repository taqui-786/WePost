import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const { user } = await validateRequest();
        if (!user) {
            return Response.json({ error: "Uauthorized" }, { status: 401 });
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
                  user: true,
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