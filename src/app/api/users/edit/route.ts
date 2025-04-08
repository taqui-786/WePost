import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { ProfileFormSchema } from "@/lib/validation";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const parsed =  ProfileFormSchema.safeParse(body);

    await prisma.user.update({
      where: {
        id: loggedInUser.id,
      },
      data: parsed.data!,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
