import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ApiPost,
  CreatePostPayload,
  PaginatedPosts,
} from "@/features/posts/types/post.types";

export const createPostService = async (
  payload: CreatePostPayload,
): Promise<ApiPost> => {
  const response = await api.post<ApiResponse<{ post: ApiPost }>>(
    ENDPOINTS.posts.create,
    payload,
  );
  return response.data.data.post;
};

export const getMyPostsService = async (): Promise<PaginatedPosts> => {
  const response = await api.get<ApiResponse<PaginatedPosts>>(
    ENDPOINTS.posts.my,
  );
  return response.data.data;
};

export const getPagePostsService = async (
  pageId: string,
  type?: string,
): Promise<PaginatedPosts> => {
  const response = await api.get<ApiResponse<PaginatedPosts>>(
    ENDPOINTS.posts.byPage(pageId),
    { params: type ? { type } : {} },
  );
  return response.data.data;
};