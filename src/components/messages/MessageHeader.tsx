import React from 'react'
import UserAvatar from '../customComponents/UserAvatar'
import { UserData } from '@/lib/types'
import UserTooltip from '../customComponents/UserTooltip'
import Link from 'next/link'

import ChatActionDropdown from './ChatActionDropdown'

function MessageHeader({user, conversationId}:{user:UserData, conversationId:string}) {
  return (
    <div className='p-4 w-full flex justify-between items-center relative'>
        {/* user badge */}
        <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <UserTooltip user={user}>
                      <Link
                        href={`/users/${user.username}`}
                        suppressHydrationWarning
                        className="flex items-center justify-center"
                      >
                        <UserAvatar
                          userAvatarUrl={user.avatarUrl}
                          userName={user.username}
                        />
                      </Link>
                    </UserTooltip>
                    <div>
                      <UserTooltip user={user}>
                        <Link
                          href={`/users/${user.username}`}
                          suppressHydrationWarning
                          className="block font-medium hover:underline"
                        >
                          {user.displayName}
                        </Link>
                      </UserTooltip>

                      <span className="text-muted-foreground text-xs">
                          {user.username}
                        </span>
                    </div>
                  </div>
                </div>

      <ChatActionDropdown conversationId={conversationId} friendId={user.id}/>
    </div>
  )
}

export default MessageHeader