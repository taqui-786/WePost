'use client'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { EllipsisVertical, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { deleteConversationAction } from './action'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/hooks/SocketContext'

function ChatActionDropdown({conversationId, friendId}:{conversationId:string, friendId:string}) {
    const router = useRouter()
    const {socket} = useSocket()
    const queryClient = useQueryClient()
    async function handleDeleteChat() {
        try {
            const deleteChat  = await deleteConversationAction(conversationId)
            if(!deleteChat) return toast.error("Failed to deleteChat!")
                toast.success("Chat Deleted Successfully.")
              await queryClient.invalidateQueries({ queryKey: ['chat-users'] })
              socket?.emit("new-chat-created", friendId)
            router.push('/messages')
        } catch (error) {
            console.log(error);
            toast.error("Internal Server Error")
            
        }
    }
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
           <Button variant='ghost' size="icon"><EllipsisVertical size={16} aria-hidden="true"  /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className='w-fit'>
      <DropdownMenuItem onClick={handleDeleteChat} className='cursor-pointer text-red-500 hover:bg-red-200'>
            <TrashIcon size={16} aria-hidden="true" />
            Delete
          </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}

export default ChatActionDropdown