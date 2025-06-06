import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH() {
    try {
        const { user } = await validateRequest()
        if (!user) {
            return Response.json({ error: "unauthorized" }, { status: 401 })
        }
        await prisma.notification.updateMany({
            where:{
                recipientId:user.id,
                read:false
            },
            data:{
                read:true
            }
        })
        return new Response()

    } catch (error) {
        console.log(error);
        return Response.json({ error: error }, { status: 500 })

    }
}