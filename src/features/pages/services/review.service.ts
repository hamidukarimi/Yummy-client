import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiReview, PaginatedReviews } from "@/features/pages/types/review.types";
import type { CreateReportPayload } from "@/features/reports/types/report.types";

export const getReviewsService = async (
  slug: string,
  page = 1,
): Promise<PaginatedReviews> => {
  const response = await api.get<ApiResponse<PaginatedReviews>>(
    ENDPOINTS.pages.reviews(slug),
    { params: { page, limit: 20 } },
  );
  return response.data.data;
};

export const createReviewService = async (
  slug: string,
  rating: number,
  content?: string,
): Promise<ApiReview> => {
  const response = await api.post<ApiResponse<{ review: ApiReview }>>(
    ENDPOINTS.pages.reviews(slug),
    { rating, ...(content ? { content } : {}) },
  );
  return response.data.data.review;
};

export const updateReviewService = async (
  slug: string,
  reviewId: string,
  rating: number,
  content?: string,
): Promise<ApiReview> => {
  const response = await api.patch<ApiResponse<{ review: ApiReview }>>(
    ENDPOINTS.pages.review(slug, reviewId),
    { rating, ...(content ? { content } : {}) },
  );
  return response.data.data.review;
};

export const deleteReviewService = async (
  slug: string,
  reviewId: string,
): Promise<void> => {
  await api.delete(ENDPOINTS.pages.review(slug, reviewId));
};

export const reportReviewService = async (
  slug: string,
  reviewId: string,
  payload: CreateReportPayload,
): Promise<void> => {
  await api.post(ENDPOINTS.pages.reportReview(slug, reviewId), payload);
};
