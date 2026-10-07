import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, ApiUser } from "@/types/api.types";

export const getMyProfileService = async (): Promise<ApiUser> => {
  const response = await api.get<ApiResponse<{ user: ApiUser }>>(
    ENDPOINTS.user.me
  );
  return response.data.data.user;
};



export interface UpdateProfilePayload {
  firstname?: string;
  lastname?:  string;
  username?:  string;
  avatar?:    string;
  birthday?:  string;
  gender?:    "male" | "female" | "other";
  location?: {
    city?: string;
    country?: string;
  };
  dietaryPreferences?: string[];
}

export const updateProfileService = async (
  payload: UpdateProfilePayload,
): Promise<ApiUser> => {
  const response = await api.put<ApiResponse<{ user: ApiUser }>>(
    ENDPOINTS.user.updateProfile,
    payload,
  );
  return response.data.data.user;
};