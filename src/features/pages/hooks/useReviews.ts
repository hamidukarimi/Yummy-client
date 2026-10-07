import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReviewService,
  deleteReviewService,
  getReviewsService,
  reportReviewService,
  updateReviewService,
} from "@/features/pages/services/review.service";
import type { PaginatedReviews } from "@/features/pages/types/review.types";
import type { CreateReportPayload } from "@/features/reports/types/report.types";
import { parseApiError } from "@/utils/errorHandler";

export const reviewsQueryKey = (slug: string) => ["reviews", slug] as const;

const useReviews = (slug: string) => {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<PaginatedReviews>({
    queryKey: reviewsQueryKey(slug),
    queryFn: ({ pageParam = 1 }) => getReviewsService(slug, pageParam as number),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    enabled: Boolean(slug),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: reviewsQueryKey(slug) });
  };

  const createMutation = useMutation({
    mutationFn: async (input: { rating: number; content?: string }) => {
      try {
        return await createReviewService(slug, input.rating, input.content);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { reviewId: string; rating: number; content?: string }) => {
      try {
        return await updateReviewService(
          slug,
          input.reviewId,
          input.rating,
          input.content,
        );
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      try {
        await deleteReviewService(slug, reviewId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const reportMutation = useMutation({
    mutationFn: async (input: { reviewId: string; payload: CreateReportPayload }) => {
      try {
        await reportReviewService(slug, input.reviewId, input.payload);
      } catch (error) {
        throw parseApiError(error);
      }
    },
  });

  const first = query.data?.pages[0];

  return {
    reviews: query.data?.pages.flatMap((page) => page.reviews) ?? [],
    averageRating: first?.averageRating ?? null,
    ratingCount: first?.ratingCount ?? 0,
    mine: first?.mine ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    saveReview: createMutation.mutateAsync,
    updateReview: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    saveError: createMutation.error ?? updateMutation.error,
    deleteReview: deleteMutation.mutate,
    deletingReviewId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    reportReview: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
    reportError: reportMutation.error,
  };
};

export default useReviews;
