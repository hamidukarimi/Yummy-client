import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiComment, PaginatedComments } from "@/features/comments/types/comment.types";
import type { CreateReportPayload } from "@/features/reports/types/report.types";

export const getCommentsService = async (
  postId: string,
  page = 1,
): Promise<PaginatedComments> => {
  const response = await api.get<ApiResponse<PaginatedComments>>(
    ENDPOINTS.posts.comments(postId),
    { params: { page, limit: 20 } },
  );
  return response.data.data;
};

export const createCommentService = async (
  postId: string,
  content: string,
): Promise<ApiComment> => {
  const response = await api.post<ApiResponse<{ comment: ApiComment }>>(
    ENDPOINTS.posts.comments(postId),
    { content },
  );
  return response.data.data.comment;
};

export const deleteCommentService = async (
  postId: string,
  commentId: string,
): Promise<void> => {
  await api.delete(ENDPOINTS.posts.comment(postId, commentId));
};

export const reportCommentService = async (
  postId: string,
  commentId: string,
  payload: CreateReportPayload,
): Promise<void> => {
  await api.post(ENDPOINTS.posts.reportComment(postId, commentId), payload);
};
