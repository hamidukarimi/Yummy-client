import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, ApiUser } from "@/types/api.types";

export const getMyProfileService = async (): Promise<ApiUser> => {
  const response = await api.get<ApiResponse<{ user: ApiUser }>>(
    ENDPOINTS.user.me
  );
  return response.data.data.user;
};