import kyInstance from "@/lib/ky";
import { LikeInfoType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";



export function useLikeInfo (postId: string | undefined, initialState: LikeInfoType){
    const query = useQuery({
        queryKey:['like-info', postId],
        queryFn: () => 
            kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfoType>()
        ,
        initialData: initialState,
        staleTime: Infinity

    });
    return query
}