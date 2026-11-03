'use server'

import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { getMessageDataInclude } from "@/lib/types"
import { createMessageSchema } from "@/lib/validation"
import { publishToUser } from "@/lib/realtime"
import { checkRateLimit } from "@/lib/r2"

export const checkServerSideAuthenticated = async () => {
  const { user: loggedInUser } = await validateRequest()
  if (!loggedInUser) throw new Error("Unauthenticated")
  return loggedInUser;
}
export const createUserChat = async (friendId: string) => {

  const loggedInUser = await checkServerSideAuthenticated()
  if (friendId === loggedInUser.id) throw new Error("You cannot chat with yourself.")

  // Get the existing 1:1 conversation (idempotent — navigating is the goal).
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
    return existingConversation.id;
  }

  const conversation = await prisma.conversation.create({
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
    payload: { conversationId: conversation.id, friendId: loggedInUser.id },
  });
  await publishToUser(friendId, { type: "refresh-chat-feed" });

  return conversation.id;
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

export const submitMessagesAction = async({content,conversationId}:{content:string, conversationId:string}) =>{
  const userData = await checkServerSideAuthenticated()

  const allowed = checkRateLimit(`msg:${userData.id}`, 60, 60 * 1000)
  if (!allowed.allowed) throw new Error("Too many messages. Please slow down.")

  const { content: contentValidated } = createMessageSchema.parse({ content })

  // Authorise the sender as a participant before writing.
  const senderParticipant = await prisma.participant.findFirst({
    where: { conversationId, userId: userData.id },
    select: { id: true },
  })
  if (!senderParticipant) throw new Error("Unauthorized")

const message =   await prisma.message.create({
    data:{
      content:contentValidated,
      conversationId,
      senderId: userData.id,
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
        payload: { conversationId, message },
      })
      await publishToUser(userId, { type: "refresh-chat-feed" })
    }
  }

  return message;
}