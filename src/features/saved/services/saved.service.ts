import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiPost } from "@/features/posts/types/post.types";

export const toggleSaveService = async (
  postId: string,
): Promise<{ saved: boolean }> => {
  const response = await api.post<ApiResponse<{ saved: boolean }>>(
    ENDPOINTS.saved.toggle(postId),
  );
  return response.data.data;
};

export const getSavedPostsService = async (): Promise<ApiPost[]> => {
  const response = await api.get<ApiResponse<{ posts: ApiPost[] }>>(
    ENDPOINTS.saved.all,
  );
  return response.data.data.posts;
};