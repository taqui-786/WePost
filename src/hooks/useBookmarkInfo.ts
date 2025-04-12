import kyInstance from "@/lib/ky";
import { BookmarkInfoType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";


export const useBookmarkInfo = (postId:string | undefined,initialState:BookmarkInfoType) => {
 const query =    useQuery({
        queryKey: ['bookmark-info', postId],
        queryFn:() => kyInstance.get(`/api/posts/${postId}/bookmarks`).json<BookmarkInfoType>(),
        initialData: initialState,
        staleTime: Infinity
    })
    return query;
}

