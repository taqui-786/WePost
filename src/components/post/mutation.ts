import { PostPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./action";
import { toast } from "sonner";

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathName = usePathname();
  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostPage, string | null>,
        Error
      > = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        },
      );
      toast.success("Post Deleted");
      if (pathName === `/posts/${deletedPost.id}`) {
        router.push("/");
      }
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to Delete the Post. Please try again.");
    },
  });
  return mutation;
}
