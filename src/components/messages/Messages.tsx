import { messageData } from '@/lib/types'
import React from 'react'
import UserAvatar from '../customComponents/UserAvatar'
import { cn } from '@/lib/utils'
// import { Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function Messages({ message, iAmSender = false }: { message: messageData; iAmSender: boolean }) {
  return (
    <div className="group/message">
      <div
        className={cn(
          "flex items-start gap-3 mb-1",
          iAmSender ? "flex-row-reverse text-right" : "flex-row"
        )}
      >
        <UserAvatar
          userAvatarUrl={message.sender.avatarUrl}
          userName={message.sender.username}
          className={cn(
            "rounded-xl",
            "ring-2 ring-white dark:ring-zinc-900",
            "transition-transform duration-200",
            "group-hover/message:scale-105"
          )}
        />

        <div className="flex-1 space-y-1">
          <div
            className={cn(
              "flex items-baseline gap-2",
              iAmSender ? "justify-start flex-row-reverse" : "flex-row"
            )}
          >
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {message.sender.displayName}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{message.content}</p>
        </div>
      </div>

      {/* {message.content && (
        <div
          className={cn(
            "flex items-center gap-1.5",
            iAmSender ? "justify-end mr-11" : "ml-11"
          )}
        >
          {[{ emoji: "🙌", reacted: true }, { emoji: "🔥", reacted: false }].map((reaction) => (
            <button
              type="button"
              key={reaction.emoji}
              className={cn(
                "px-2 py-1 rounded-lg text-xs",
                "transition-colors duration-200",
                reaction.reacted
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                "hover:bg-violet-200 dark:hover:bg-violet-800/30"
              )}
            >
              {reaction.emoji} 2
            </button>
          ))}
        </div>
      )} */}
    </div>
  );
}


export default Messages