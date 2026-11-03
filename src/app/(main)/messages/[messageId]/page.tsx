import { validateRequest } from "@/auth";
import MessageHeader from "@/components/messages/MessageHeader";
import MessagePage from "@/components/messages/MessagePage";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { User } from "@prisma/client";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React, { cache } from "react";

interface PageProps {
  params: Promise<{ messageId: string }>;
}
export const metadata: Metadata = {
  title: "Messages"
}

const getConversation = cache(
  async (conversationId: string, loggedInUserId: string) => {
    // Only participants may open the conversation.
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId: loggedInUserId } },
      },
      include: {
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
      },
    });
    if (!conversation) notFound();
    return conversation;
  },
);

async function page({ params }: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    redirect("/login");
  }

  const { messageId } = await params;
  const conversation = await getConversation(messageId, loggedInUser.id);
  const otherParticipant = conversation.participants.find(
    (participant) => participant.userId !== loggedInUser.id,
  );

  if (!otherParticipant) {
    return (
      <p className="text-muted-foreground p-8 text-center">
        This conversation has no other participant.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <MessageHeader user={otherParticipant.user} conversationId={messageId} />
      <MessagePage
        messageId={messageId}
        loggedInUserData={loggedInUser as User}
      />
    </div>
  );
}

export default page;
