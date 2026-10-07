import { useMutation } from "@tanstack/react-query";
import { createReportService } from "@/features/reports/services/report.service";
import type { CreateReportPayload } from "@/features/reports/types/report.types";
import { parseApiError } from "@/utils/errorHandler";

const useReportPost = (postId: string) => {
  const mutation = useMutation({
    mutationFn: async (payload: CreateReportPayload) => {
      try {
        return await createReportService(postId, payload);
      } catch (error) {
        throw parseApiError(error);
      }
    },
  });

  return {
    reportPost: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useReportPost;
