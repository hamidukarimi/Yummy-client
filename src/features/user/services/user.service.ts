import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ChangePasswordPayload,
  ChangePasswordResult,
} from "@/features/user/types/user.types";

// ─── User Service ─────────────────────────────────────────────────────────────

export const changePasswordService = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResult> => {
  const response = await api.put<ApiResponse<ChangePasswordResult>>(
    ENDPOINTS.user.changePassword,
    payload
  );

  return response.data.data;
};