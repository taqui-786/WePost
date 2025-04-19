'use client'
import { useLikeInfo } from "@/hooks/useLikeInfo";
import kyInstance from "@/lib/ky";
import { LikeInfoType } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    postId: string;
    initialState: LikeInfoType;
}
function LikeButton({ initialState, postId }: LikeButtonProps) {
    const { data } = useLikeInfo(postId, initialState)
    const queryClient = useQueryClient();
    const queryKey: QueryKey = ["like-info", postId];
    const { mutate } = useMutation({
        mutationFn: () => data.isLikedByUser ? kyInstance.delete(`/api/posts/${postId}/likes`) : kyInstance.post(`/api/posts/${postId}/likes`),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey });
            const previousState = queryClient.getQueryData<LikeInfoType>(queryKey);
            queryClient.setQueryData<LikeInfoType>(queryKey, () => ({
                likes: (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
                isLikedByUser: !previousState?.isLikedByUser
            }));
            return { previousState };
        },
        onError(error, variables, context){
            queryClient.setQueryData(queryKey, context?.previousState);
            toast.error("Failed to like post.")
            console.log(error);
            
        }

    })

    return (
        <button 
        onClick={() => mutate()}
        className="flex items-center gap-2 cursor-pointer"
      
        >

<Heart className={cn("size-5  ", data.isLikedByUser&& " text-red-500 fill-red-500")} />
<span className="text-sm font-medium tabular-nums ">{data.likes} <span className="hidden sm:inline">likes</span></span>
        </button>
    )
}


export default LikeButton