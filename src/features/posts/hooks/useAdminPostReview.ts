import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPendingPostsAdminService,
  reviewPostAdminService,
} from "@/features/posts/services/adminPost.service";
import type { ReviewPostPayload } from "@/features/posts/services/adminPost.service";
import { parseApiError } from "@/utils/errorHandler";

export const adminPendingPostsQueryKey = ["posts", "admin", "pending"] as const;

const useAdminPostReview = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: adminPendingPostsQueryKey,
    queryFn: getPendingPostsAdminService,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      postId,
      payload,
    }: {
      postId: string;
      payload: ReviewPostPayload;
    }) => {
      try {
        return await reviewPostAdminService(postId, payload);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminPendingPostsQueryKey,
      });
    },
  });

  return {
    posts: query.data?.posts ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    reviewPost: reviewMutation.mutate,
    reviewingPostId: reviewMutation.isPending
      ? reviewMutation.variables?.postId
      : undefined,
    reviewError: reviewMutation.error,
  };
};

export default useAdminPostReview;
