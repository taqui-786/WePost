import {
    InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./action";
import { toast } from "sonner";
import { PostPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";


export function useSubmitPostMutation() {
  
    const queryClient = useQueryClient();
  
    const { user } = useSession();
  
    const mutation = useMutation({
      mutationFn: submitPost,
      onSuccess: async (newPost) => {
        const queryFilter = {
          queryKey: ["post-feed"] as const,
          predicate(query) {
            return (
              query.queryKey.includes("my-feed") ||
              (query.queryKey.includes("user-posts") &&
                query.queryKey.includes(user.id))
            );
          },
        } satisfies QueryFilters;
  
        await queryClient.cancelQueries(queryFilter);
  
        queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
          queryFilter,
          (oldData) => {
            const firstPage = oldData?.pages[0];
  
            if (firstPage) {
              return {
                pageParams: oldData.pageParams,
                pages: [
                  {
                    posts: [newPost, ...firstPage.posts],
                    nextCursor: firstPage.nextCursor,
                  },
                  ...oldData.pages.slice(1),
                ],
              };
            }
          },
        );
  
        queryClient.invalidateQueries({
          queryKey: queryFilter.queryKey,
          predicate(query) {
            return queryFilter.predicate(query) && !query.state.data;
          },
        });
  
        toast.success("Post created");
      },
      onError(error) {
        console.error(error);
        toast.error("Failed to post. Please try again.");
      },
    });
  
    return mutation;
  }