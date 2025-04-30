import { validateRequest } from "@/auth";
import MessageHeader from "@/components/messages/MessageHeader";
import MessagePage from "@/components/messages/MessagePage";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { User } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { cache } from "react";
interface PageProps {
  params: Promise<{ messageId: string }>;
}
export const metadata: Metadata = {
  title: "Messages"
}
const getConversation = cache(
  async (conversationId: string, loggedInUserId: string) => {
    const user = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        createdByUser: true,
        participants: {
          select: {
            user: {
              select: getUserDataSelect(loggedInUserId),
            },
            conversationId: true,
            userId: true,
            id: true,
          },
        },
        messages: true,
      },
    });
    if (!user) notFound();
    return user;
  },
);
async function page({ params }: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const { messageId } = await params;
  const conversation = await getConversation(messageId, loggedInUser.id);
  const headerUser = conversation.participants.filter(
    (user) => user.userId !== loggedInUser.id,
  );

  return (
    <div className="flex w-2/3 flex-col">
      <MessageHeader user={headerUser[0].user} conversationId={messageId} />
      <MessagePage
        messageId={messageId}
        friendId={headerUser[0].user.id}
        loggedInUserData={loggedInUser as User}
      />
    </div>
  );
}

export default page;
