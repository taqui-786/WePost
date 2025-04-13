import { InfiniteData, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment, submitComment } from "./action";
import { CommentsPage } from "@/lib/types";
import { toast } from "sonner";

export function useSubmitCommentMutation(postId: string) {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: submitComment,
        onSuccess: async (newComment) => {
            const queryKey: QueryKey = ["comments", postId]
            await queryClient.cancelQueries({ queryKey })
            queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(queryKey, (oldData) => {
                const firstPage = oldData?.pages[0];
                if (firstPage) {
                    return {
                        pageParams: oldData.pageParams,
                        pages: [{ previousCursor: firstPage.previousCursor, comments: [...firstPage.comments, newComment] }], ...oldData.pages.slice(1)
                    }
                }
            });
            queryClient.invalidateQueries({
                queryKey,
                predicate(query) {
                    return !query.state.data
                }
            })
            toast.success("Comment Created.")
        },
        onError(error) {
            console.log(error);
            toast.error("Failed To Create Comment.")

        }
    });
    return mutation;
}

export function useDeleteCommentMutation() {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: async (deletedComment) => {
            const queryKey: QueryKey = ["comments", deletedComment.postId];
            await queryClient.cancelQueries({ queryKey })
            queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        previousCursor: page.previousCursor,
                        comments: page.comments.filter((comment) => comment.id !== deletedComment.id)
                    }))
                }
            });
            toast.success("Comment Deleted.")

        },
        onError(error) {
            console.log(error);
            toast.error("Failed To delete Comment.")

        }

    });
    return mutation;

}