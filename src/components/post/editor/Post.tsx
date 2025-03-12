import { Post as PostTypes } from '@prisma/client'
import React from 'react'

function Post({post}:{post:PostTypes}) {
  return (
    <article className='space-y-3 rounded-2xl bg-card p-5 shadow-sm'>{post.content}</article>
  )
}

export default Post