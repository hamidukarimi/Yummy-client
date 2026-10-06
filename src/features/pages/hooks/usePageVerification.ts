import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPendingPageVerificationsService,
  requestPageVerificationService,
  reviewPageVerificationService,
} from "@/features/pages/services/page.service";
import type { ReviewPageVerificationPayload } from "@/features/pages/services/page.service";
import { pageQueryKey } from "@/features/pages/hooks/usePage";
import { parseApiError } from "@/utils/errorHandler";

export const pageVerificationRequestsQueryKey = [
  "pages",
  "verification-requests",
] as const;

export const useRequestPageVerification = (slug: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        return await requestPageVerificationService(slug);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageQueryKey(slug) });
    },
  });

  return {
    requestVerification: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};

export const usePendingPageVerifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: pageVerificationRequestsQueryKey,
    queryFn: getPendingPageVerificationsService,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      pageId,
      payload,
    }: {
      pageId: string;
      payload: ReviewPageVerificationPayload;
    }) => {
      try {
        return await reviewPageVerificationService(pageId, payload);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pageVerificationRequestsQueryKey,
      });
    },
  });

  return {
    requests: query.data?.pages ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    reviewVerification: reviewMutation.mutate,
    reviewingPageId: reviewMutation.isPending
      ? reviewMutation.variables?.pageId
      : undefined,
    reviewError: reviewMutation.error,
  };
};
