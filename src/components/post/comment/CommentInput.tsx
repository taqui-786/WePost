import { PostData } from '@/lib/types'
import React, { useState } from 'react'
import { useSubmitCommentMutation } from './mutation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, SendHorizonal } from 'lucide-react'


interface CommentInputProps {
    post: PostData
}
function CommentInput({post}:CommentInputProps) {
    const [input, setInput] = useState("")
    const mutation  = useSubmitCommentMutation(post.id)
    async function onSubmit(e:React.FormEvent) {
        e.preventDefault()
        if(!input) return;
        mutation.mutate({
            post, content: input
        }, {
            onSuccess: () => setInput("")
        })
        
    }
  return (
  <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
    <Input placeholder='Write a comment...' value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
    <Button type='submit' variant="ghost" size="icon" disabled={!input.trim() || mutation.isPending}>
        {!mutation.isPending ? (
            <SendHorizonal className='size-5' />
        ): (
            <Loader2 className='animate-spin' />
        )}
    </Button>
  </form>
  )
}

export default CommentInput