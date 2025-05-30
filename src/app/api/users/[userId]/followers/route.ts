import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowersInfo } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        Followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        Following: {
          where: {
            followingId: loggedInUser.id,
          },
          select: {
            followingId: true,
          },
        },
        _count: {
          select: {
            Followers: true,
            Following: true
          },
        },
      },
    });
    if (!user) {
      return Response.json({ error: "User Not Found" }, { status: 404 });
    }

    const data: FollowersInfo = {
      followers: user._count.Followers,
      following: user._count.Following,
      isFollowedByUser: !!user.Followers.length,
    };
    console.log(data);

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = await context.params;
    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: 'FOLLOW'
        }
      })
    ])
    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = await context.params;
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: 'FOLLOW'
        }
      })
    ])
    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
