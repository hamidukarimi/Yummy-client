import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiPage, CreatePagePayload } from "@/features/pages/types/page.types";

export const createPageService = async (
  payload: CreatePagePayload
): Promise<ApiPage> => {
  const response = await api.post<ApiResponse<{ page: ApiPage }>>(
    ENDPOINTS.pages.create,
    payload
  );
  return response.data.data.page;
};

export const getMyPagesService = async (): Promise<ApiPage[]> => {
  const response = await api.get<ApiResponse<{ pages: ApiPage[] }>>(
    ENDPOINTS.pages.my
  );
  return response.data.data.pages;
};