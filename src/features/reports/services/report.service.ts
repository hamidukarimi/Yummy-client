import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ApiReport,
  CreateReportPayload,
  PaginatedReports,
} from "@/features/reports/types/report.types";

export const createReportService = async (
  postId: string,
  payload: CreateReportPayload,
): Promise<ApiReport> => {
  const response = await api.post<ApiResponse<{ report: ApiReport }>>(
    ENDPOINTS.posts.report(postId),
    payload,
  );
  return response.data.data.report;
};

export const getPendingReportsService = async (): Promise<PaginatedReports> => {
  const response = await api.get<ApiResponse<PaginatedReports>>(
    ENDPOINTS.posts.adminReports,
  );
  return response.data.data;
};

export const reviewReportService = async (
  reportId: string,
): Promise<ApiReport> => {
  const response = await api.patch<ApiResponse<{ report: ApiReport }>>(
    ENDPOINTS.posts.reviewReport(reportId),
    { status: "reviewed" },
  );
  return response.data.data.report;
};
