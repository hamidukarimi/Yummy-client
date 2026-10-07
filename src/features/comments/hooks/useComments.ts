import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCommentService,
  deleteCommentService,
  getCommentsService,
  reportCommentService,
} from "@/features/comments/services/comment.service";
import type { PaginatedComments } from "@/features/comments/types/comment.types";
import type { CreateReportPayload } from "@/features/reports/types/report.types";
import { parseApiError } from "@/utils/errorHandler";

export const commentsQueryKey = (postId: string) => ["comments", postId] as const;

const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<PaginatedComments>({
    queryKey: commentsQueryKey(postId),
    queryFn: ({ pageParam = 1 }) => getCommentsService(postId, pageParam as number),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    enabled: Boolean(postId),
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        return await createCommentService(postId, content);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      try {
        await deleteCommentService(postId, commentId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(postId) });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (input: { commentId: string; payload: CreateReportPayload }) => {
      try {
        await reportCommentService(postId, input.commentId, input.payload);
      } catch (error) {
        throw parseApiError(error);
      }
    },
  });

  return {
    comments: query.data?.pages.flatMap((page) => page.comments) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    addComment: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    addError: createMutation.error,
    deleteComment: deleteMutation.mutate,
    deletingCommentId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    reportComment: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
    reportError: reportMutation.error,
  };
};

export default useComments;
