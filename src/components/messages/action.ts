'use server'

import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { getMessageDataInclude } from "@/lib/types"
import { createMessageSchema } from "@/lib/validation"
import { publishToUser } from "@/lib/realtime"
export const checkServerSideAuthenticated = async () => {
  const { user: loggedInUser } = await validateRequest()
  if (!loggedInUser) throw new Error("Unauthenticated")
  return loggedInUser;
}
export const createUserChat = async (friendId: string) => {

  const loggedInUser = await checkServerSideAuthenticated()
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

  await prisma.conversation.create({
    data: {
      createdById: loggedInUser.id,
      participants: {
        create: [
          { userId: loggedInUser.id },
          { userId: friendId },
        ]
      }
    },
  });
  await publishToUser(friendId, {
    type: "chat-created",
    payload: { friendId: loggedInUser.id },
  });
  await publishToUser(friendId, { type: "refresh-chat-feed" });

  return true;
}

export const deleteConversationAction = async (conversationId: string) => {
  const userData = await checkServerSideAuthenticated()
  // Remember participants so we can tell them their chat list changed.
  const participants = await prisma.participant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  await prisma.conversation.deleteMany({
    where:{
      id:conversationId,
      createdById:userData.id
    }
  })
  for (const { userId } of participants) {
    if (userId !== userData.id) {
      await publishToUser(userId, { type: "refresh-chat-feed" });
    }
  }
  return true;

}

export const submitMessagesAction = async({content,conversationId,senderId}:{content:string, senderId:string, conversationId:string}) =>{
  const userData = await checkServerSideAuthenticated()
  const { content: contentValidated } = createMessageSchema.parse({ content })
const message =   await prisma.message.create({
    data:{
      content:contentValidated,
      conversationId,
      senderId
    },
    include: getMessageDataInclude(userData.id)
  })

  // Let the other participant(s) know a new message arrived.
  const participants = await prisma.participant.findMany({
    where: { conversationId },
    select: { userId: true },
  })
  for (const { userId } of participants) {
    if (userId !== userData.id) {
      await publishToUser(userId, {
        type: "new-message",
        payload: { conversationId, senderId: userData.id },
      })
      await publishToUser(userId, { type: "refresh-chat-feed" })
    }
  }

  return message;
}