import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiPost, PaginatedPosts } from "@/features/posts/types/post.types";

export interface ReviewPostPayload {
  status: "approved" | "rejected";
  rejectedReason?: string;
}

export const getPendingPostsAdminService = async (): Promise<PaginatedPosts> => {
  const response = await api.get<ApiResponse<PaginatedPosts>>(
    ENDPOINTS.posts.adminPending,
    { params: { limit: 20 } },
  );
  return response.data.data;
};

export const reviewPostAdminService = async (
  postId: string,
  payload: ReviewPostPayload,
): Promise<ApiPost> => {
  const response = await api.patch<ApiResponse<{ post: ApiPost }>>(
    ENDPOINTS.posts.adminReview(postId),
    payload,
  );
  return response.data.data.post;
};
