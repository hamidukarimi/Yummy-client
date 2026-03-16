import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { FeedTag, PaginatedFeed } from "@/features/feed/types/feed.types";

export interface GetFeedParams {
  page?:     number;
  limit?:    number;
  tag?:      string;
  category?: string;
}

export const getExploreFeedService = async (
  params: GetFeedParams = {},
): Promise<PaginatedFeed> => {
  const response = await api.get<ApiResponse<PaginatedFeed>>(
    ENDPOINTS.feed.explore,
    { params },
  );
  return response.data.data;
};

export const getForYouFeedService = async (
  params: GetFeedParams = {},
): Promise<PaginatedFeed> => {
  const response = await api.get<ApiResponse<PaginatedFeed>>(
    ENDPOINTS.feed.forYou,
    { params },
  );
  return response.data.data;
};

export const getFeedTagsService = async (): Promise<FeedTag[]> => {
  const response = await api.get<ApiResponse<{ tags: FeedTag[] }>>(
    ENDPOINTS.feed.tags,
  );
  return response.data.data.tags;
};