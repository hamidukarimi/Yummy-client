import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPostService } from "@/features/posts/services/post.service";
import { parseApiError } from "@/utils/errorHandler";
import type { CreatePostPayload } from "@/features/posts/types/post.types";

const useCreatePost = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      try {
        return await createPostService(payload);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts", "my"] });
    },
  });

  return {
    createPost: mutate,
    isPending,
    error,
    isSuccess,
  };
};

export default useCreatePost;