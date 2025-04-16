import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationCountInfo } from "@/lib/types";

export async function GET() {
    try {
        const { user } = await validateRequest()
        if (!user) {
            return Response.json({ error: "unauthorized" }, { status: 401 })
        }
        const count = await prisma.notification.count({
            where: {
                recipientId: user.id,
                read: false
            }
        })
        const data: notificationCountInfo = {
            unreadcount: count
        }
        return Response.json(data)
    } catch (error) {
        console.log(error);
        return Response.json({ error: error }, { status: 500 })

    }
}



