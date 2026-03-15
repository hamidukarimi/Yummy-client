import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePostService } from "@/features/posts/services/post.service";
import { parseApiError } from "@/utils/errorHandler";
import { postQueryKey } from "@/features/posts/hooks/usePost";
import type { UpdatePostPayload } from "@/features/posts/types/post.types";

const useEditPost = (postId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (payload: UpdatePostPayload) => {
      try {
        return await updatePostService(postId, payload);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });

  return { editPost: mutate, isPending, error, isSuccess };
};

export default useEditPost;
