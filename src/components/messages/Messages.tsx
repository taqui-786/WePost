import { messageData } from '@/lib/types'
import React from 'react'
import UserAvatar from '../customComponents/UserAvatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface MessagesProps {
  message: messageData
  iAmSender: boolean
  showAvatar: boolean
  showTimestamp: boolean
}

function Messages({ message, iAmSender, showAvatar, showTimestamp }: MessagesProps) {
  return (
    <div
      className={cn(
        "flex w-full items-end gap-2",
        iAmSender ? "justify-end" : "justify-start",
      )}
    >
      {/* Spacer to keep alignment when the other party's avatar is hidden */}
      {!iAmSender && (
        showAvatar ? (
          <UserAvatar
            userAvatarUrl={message.sender.avatarUrl}
            userName={message.sender.username}
            className="rounded-full"
            size={32}
          />
        ) : (
          <span className="w-8 shrink-0" />
        )
      )}

      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1 sm:max-w-lg",
          iAmSender ? "items-end" : "items-start",
        )}
      >
        <p
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words leading-relaxed",
            iAmSender
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-muted text-foreground",
          )}
        >
          {message.content}
        </p>
        {showTimestamp && (
          <span
            className={cn(
              "px-1 text-[10px] tabular-nums text-muted-foreground",
              iAmSender ? "text-right" : "text-left",
            )}
          >
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  )
}

export default Messages
