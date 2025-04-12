
'use client'
import { useBookmarkInfo } from '@/hooks/useBookmarkInfo'
import kyInstance from '@/lib/ky';
import { BookmarkInfoType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
interface BookmarkInfoProps {
    postId:string;
    initialState: BookmarkInfoType
}
function BookmarkButton({postId,initialState}:BookmarkInfoProps) {

    const {data} = useBookmarkInfo(postId, initialState)
    const queryKey:QueryKey = ['bookmark-info',postId]
    const queryClient = useQueryClient()

    const {mutate} = useMutation({
        mutationFn: () => data.isBookmarkByUser ? kyInstance.delete(`/api/posts/${postId}/bookmarks`) : kyInstance.post(`/api/posts/${postId}/bookmarks`),
        onMutate: async () => {
           await queryClient.cancelQueries({queryKey});
           const previousState = queryClient.getQueryData<BookmarkInfoType>(queryKey)
           queryClient.setQueryData<BookmarkInfoType>(queryKey, () => ({
            isBookmarkByUser: !previousState?.isBookmarkByUser
           }))
           toast.message( `Post ${data.isBookmarkByUser ? "un" : ""}bookmarked`)

          return {previousState}
        },
        
        onError(error, variables, context){
            queryClient.setQueryData(queryKey, context?.previousState);
            toast.error("Failed to bookmark post.")
            console.log(error);
            
        }
        
    })
  return (
    <button 
    onClick={() => mutate()}
    className="flex items-center cursor-pointer ml-auto"
  
    >

<Bookmark className={cn("size-5  ", data.isBookmarkByUser&& " text-primary fill-primary")} />
    </button>
  )
}

export default BookmarkButton