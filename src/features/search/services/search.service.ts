import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { PaginatedPosts } from "@/features/posts/types/post.types";
import type { PaginatedPages } from "@/features/pages/types/page.types";
import type {
  PageSearchFilters,
  PostSearchFilters,
} from "@/features/search/types/search.types";

export const searchPostsService = async (
  search: string,
  filters: PostSearchFilters = {},
): Promise<PaginatedPosts> => {
  const response = await api.get<ApiResponse<PaginatedPosts>>(
    ENDPOINTS.search.posts,
    {
      params: {
        limit: 20,
        ...(search.trim() && { search: search.trim() }),
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.tag?.trim() && { tag: filters.tag.trim() }),
        ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
      },
    },
  );
  return response.data.data;
};

export const searchPagesService = async (
  search: string,
  filters: PageSearchFilters = {},
): Promise<PaginatedPages> => {
  const response = await api.get<ApiResponse<PaginatedPages>>(
    ENDPOINTS.search.pages,
    {
      params: {
        limit: 20,
        ...(search.trim() && { search: search.trim() }),
        ...(filters.category && { category: filters.category }),
        ...(filters.tag?.trim() && { tags: filters.tag.trim() }),
      },
    },
  );
  return response.data.data;
};
