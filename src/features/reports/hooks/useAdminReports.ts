import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPendingReportsService,
  reviewReportService,
} from "@/features/reports/services/report.service";
import { parseApiError } from "@/utils/errorHandler";

export const adminReportsQueryKey = ["reports", "admin", "pending"] as const;

const useAdminReports = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: adminReportsQueryKey,
    queryFn: getPendingReportsService,
  });

  const reviewMutation = useMutation({
    mutationFn: async (reportId: string) => {
      try {
        return await reviewReportService(reportId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReportsQueryKey });
    },
  });

  return {
    reports: query.data?.reports ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    reviewReport: reviewMutation.mutate,
    reviewingReportId: reviewMutation.isPending
      ? reviewMutation.variables
      : undefined,
    reviewError: reviewMutation.error,
  };
};

export default useAdminReports;
