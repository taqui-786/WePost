"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export interface mediaType {
  url: string;
  type: "IMAGE" | "VIDEO";
}
export const submitPost = async (input:{
  content:string, attachments: mediaType[]
}) => {
  const { user } = await validateRequest();
  if (!user) throw Error("unauthorized");
  const { content, attachments } = createPostSchema.parse(input)
const readyUrls = attachments?.map((itm) => itm.url)
  const newPost = await prisma.post.create({
    data: {
      content,
      images:readyUrls,
      userId: user.id,
    },
    include: getPostDataInclude(user.id),
  });
  return newPost;
};


