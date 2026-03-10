import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { LoginPayload, RegisterPayload, AuthResult } from "@/features/auth/types/auth.types";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const loginService = async (
  payload: LoginPayload
): Promise<AuthResult> => {
  const response = await api.post<ApiResponse<AuthResult>>(
    ENDPOINTS.auth.login,
    payload
  );

  return response.data.data;
};

export const registerService = async (
  payload: RegisterPayload
): Promise<AuthResult> => {
  const response = await api.post<ApiResponse<AuthResult>>(
    ENDPOINTS.auth.register,
    payload
  );

  return response.data.data;
};

export const logoutService = async (): Promise<void> => {
  await api.post(ENDPOINTS.auth.logout);
};

export const logoutAllService = async (): Promise<void> => {
  await api.post(ENDPOINTS.auth.logoutAll);
};