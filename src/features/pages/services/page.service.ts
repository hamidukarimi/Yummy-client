import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ApiPage,
  CreatePagePayload,
  GetAllPagesParams,
  PageViewData,
  PaginatedPages,
  UpdatePagePayload,
} from "@/features/pages/types/page.types";

export const createPageService = async (
  payload: CreatePagePayload,
): Promise<ApiPage> => {
  const response = await api.post<ApiResponse<{ page: ApiPage }>>(
    ENDPOINTS.pages.create,
    payload,
  );
  return response.data.data.page;
};

export const getMyPagesService = async (): Promise<ApiPage[]> => {
  const response = await api.get<ApiResponse<{ pages: ApiPage[] }>>(
    ENDPOINTS.pages.my,
  );
  return response.data.data.pages;
};

export const getPageBySlugService = async (
  slug: string,
): Promise<PageViewData> => {
  const response = await api.get<ApiResponse<PageViewData>>(
    ENDPOINTS.pages.bySlug(slug),
  );
  return response.data.data;
};

export const toggleFollowService = async (
  slug: string,
): Promise<{ following: boolean }> => {
  const response = await api.post<ApiResponse<{ following: boolean }>>(
    ENDPOINTS.pages.follow(slug),
  );
  return response.data.data;
};

export const getAllPagesService = async (
  params: GetAllPagesParams = {},
): Promise<PaginatedPages> => {
  const response = await api.get<ApiResponse<PaginatedPages>>(
    ENDPOINTS.pages.all,
    { params },
  );
  return response.data.data;
};


export const getFollowedPagesService = async (): Promise<ApiPage[]> => {
  const response = await api.get<ApiResponse<{ pages: ApiPage[] }>>(
    ENDPOINTS.user.followedPages,
  );
  return response.data.data.pages;
};







export const updatePageService = async (
  slug:    string,
  payload: UpdatePagePayload,
): Promise<ApiPage> => {
  const response = await api.put<ApiResponse<{ page: ApiPage }>>(
    ENDPOINTS.pages.update(slug),
    payload,
  );
  return response.data.data.page;
};