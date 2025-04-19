import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || null;
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = q ? 10 : 5;

    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }


    let users;
    if (q !== null) {
      const searchQuery = q.split(" ").join(" & ").trim().toLocaleLowerCase();
      users = await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                search: searchQuery,
                mode: "insensitive"
              },
            },
            {
              displayName: {
                search: searchQuery,
                mode: "insensitive"

              },
            },
            {
              email: {
                search: searchQuery,
                mode: "insensitive"

              },
            },

          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          Followers: {
            where: {
              followerId: user.id,
            },
            select: {
              followerId: true,
            },
          },
          Following: {
            where: {
              followingId: user.id,
            },
            select: {
              followingId: true,
            },
          },
          _count: {
            select: {
              posts: true,
              Followers: true,
              Following: true
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    } else {
      users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          Followers: {
            where: {
              followerId: user.id,
            },
            select: {
              followerId: true,
            },
          },
          Following: {
            where: {
              followingId: user.id,
            },
            select: {
              followingId: true,
            },
          },
          _count: {
            select: {
              posts: true,
              Followers: true,
              Following: true
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: pageSize,
      });
    }

    const nextCursor = users.length > pageSize ? users[pageSize]?.id || null : null;

    const data: UserPage = {
      users: users.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
