'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, SendHorizontal } from 'lucide-react'
import { useMessageSendMutation } from './mutation'
import { User } from '@prisma/client'

interface MessageInputProps {
    messageId: string,
    loggedInUserData:User
}

function MessageInput({ messageId, loggedInUserData }: MessageInputProps) {
    const [input, setInput] = useState("")

    const mutation = useMessageSendMutation(messageId, loggedInUserData)
    const canSend = input.trim().length > 0 && !mutation.isPending

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        const value = input.trim()
        if (!value || mutation.isPending) return;

        mutation.mutate({
            content: value,
            conversationId: messageId,
        })
        setInput("")
    }

    return (
        <form
          onSubmit={onSubmit}
          className="flex w-full shrink-0 items-center gap-2 border-t p-3 sm:p-4"
        >
            <Input
                placeholder='Write a message...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                autoComplete="off"
                className="rounded-full bg-muted border-transparent focus-visible:bg-background"
            />
            <Button
                type='submit'
                variant="default"
                size="icon"
                disabled={!canSend}
                aria-label="Send message"
                className="rounded-full"
            >
                {mutation.isPending ? (
                    <Loader2 className='size-5 animate-spin' />
                ) : (
                    <SendHorizontal className='size-5' />
                )}
            </Button>
        </form>
    )
}

export default MessageInput
