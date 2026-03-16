import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { PaginatedPosts } from "@/features/posts/types/post.types";
import type { PaginatedPages } from "@/features/pages/types/page.types";

export const searchPostsService = async (
  query: string,
): Promise<PaginatedPosts> => {
  const response = await api.get<ApiResponse<PaginatedPosts>>(
    ENDPOINTS.search.posts,
    { params: { search: query, limit: 20 } },
  );
  return response.data.data;
};

export const searchPagesService = async (
  query: string,
): Promise<PaginatedPages> => {
  const response = await api.get<ApiResponse<PaginatedPages>>(
    ENDPOINTS.search.pages,
    { params: { search: query, limit: 20 } },
  );
  return response.data.data;
};