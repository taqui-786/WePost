import { PostData } from '@/lib/types'
import Link from 'next/link'
import React from 'react'
import UserAvatar from '../customComponents/UserAvatar'
import { formatRelativeDate } from '@/lib/utils'

function Post({post}:{post:PostData}) {
  
  return (
    <article className='space-y-3 rounded-2xl bg-card p-5 shadow-sm'>
      <div className="flex flex-wrap gap-3 ">
        <Link href={`/user/${post.user.username}`} className='flex items-center justify-center' >
        <UserAvatar userAvatarUrl={post.user.avatarUrl} userName={post.user.username} />
        </Link>
        <div className="">

        <Link href={`/user/${post.user.username}`} className='block font-medium hover:underline'>
        {post.user.username}
        </Link>
        <span className="text-xs text-muted-foreground">{formatRelativeDate(post.createdAt)}</span>
        </div>
      </div>
      <div className=" text-sm whitespace-pre-line font-normal break-words">{post.content}</div>
    </article>
  )
}

export default Post