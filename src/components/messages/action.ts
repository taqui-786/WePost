'use server'

import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"

export const createUserChat = async (friendId: string) => {
  const { user: loggedInUser } = await validateRequest()
  if (!loggedInUser) throw new Error("Unauthenticated")

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: {
            in: [loggedInUser.id, friendId],
          },
        },
      },
    },
  });

  if (existingConversation) {
    throw new Error("User already in chat.")
  }

  // Create conversation + participants inside a transaction
  const newConversation = await prisma.conversation.create({
    data: {},
  });

  await prisma.participant.createMany({
    data: [
      {
        conversationId: newConversation.id,
        userId: loggedInUser.id,
      },
      {
        conversationId: newConversation.id,
        userId: friendId,
      },
    ],
  });

  return true;
}
