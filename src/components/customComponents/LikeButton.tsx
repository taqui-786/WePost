'use client'
import { useLikeInfo } from "@/hooks/useLikeInfo";
import kyInstance from "@/lib/ky";
import { LikeInfoType } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../ui/button";
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
        <Button 
        onClick={() => mutate()}
        variant={'ghost'}
        size={'sm'}
        >

<Heart className={cn("size-6 text-red-500 ", data.isLikedByUser&& " fill-red-500")} />
<span className="text-lg text-muted-foreground">{data.likes}</span>
        </Button>
    )
}


export default LikeButton