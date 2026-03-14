import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLikeService } from "@/features/posts/services/post.service";
import { parseApiError } from "@/utils/errorHandler";
import { postQueryKey } from "@/features/posts/hooks/usePost";

const useLikePost = (postId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        return await toggleLikeService(postId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });

  return { toggleLike: mutate, isPending };
};

export default useLikePost;
