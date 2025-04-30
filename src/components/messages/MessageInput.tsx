'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, SendHorizonal } from 'lucide-react'
import { useMessageSendMutation } from './mutation'
import { User } from '@prisma/client'

interface MessageInputProps {
    messageId: string,
    friendId: string,
    loggedInUserData:User
}

function MessageInput({ messageId, friendId, loggedInUserData }: MessageInputProps) {
    const [input, setInput] = useState("")
    
    const mutation = useMessageSendMutation(messageId,loggedInUserData,friendId)
    
    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim()) return;
        
        // Send the message
        mutation.mutate({
            content: input,
            conversationId: messageId,
            senderId:loggedInUserData.id
        })
        
        // Clear input immediately for instant feedback
        setInput("")
    }
    
    return (
        <form onSubmit={onSubmit} className="flex w-full items-center gap-2 p-4">
            <Input 
                placeholder='Write a message...'
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                autoFocus
            />
            <Button 
                type='submit' 
                variant="ghost" 
                size="icon" 
                disabled={mutation.isPending}
            >
                {mutation.isPending ? (
                    <Loader2 className='size-5 animate-spin' />
                ) : (
                    <SendHorizonal className='size-5' />
                )}
            </Button>
        </form>
    )
}

export default MessageInput