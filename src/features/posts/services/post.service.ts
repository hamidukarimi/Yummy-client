import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ApiPost,
  CreatePostPayload,
  UpdatePostPayload,
  PaginatedPosts,
} from "@/features/posts/types/post.types";
import type { PostViewData } from "../hooks/usePost";

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

export const getPostByIdService = async (id: string): Promise<PostViewData> => {
  const response = await api.get<ApiResponse<PostViewData>>(
    ENDPOINTS.posts.byId(id),
  );
  return response.data.data;
};

export const toggleLikeService = async (
  id: string,
): Promise<{ liked: boolean }> => {
  const response = await api.post<ApiResponse<{ liked: boolean }>>(
    ENDPOINTS.posts.like(id),
  );
  return response.data.data;
};

export const deletePostService = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.posts.delete(id));
};

export const updatePostService = async (
  id: string,
  payload: UpdatePostPayload,
): Promise<ApiPost> => {
  const response = await api.put<ApiResponse<{ post: ApiPost }>>(
    ENDPOINTS.posts.update(id),
    payload,
  );
  return response.data.data.post;
};
