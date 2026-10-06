import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiSession } from "@/features/sessions/types/session.types";

export const getSessionsService = async (): Promise<ApiSession[]> => {
  const response = await api.get<ApiResponse<{ sessions: ApiSession[] }>>(
    ENDPOINTS.auth.sessions,
  );
  return response.data.data.sessions;
};

export const revokeSessionService = async (
  sessionId: string,
): Promise<void> => {
  await api.delete(ENDPOINTS.auth.revokeSession(sessionId));
};

export const logoutOtherDevicesService = async (): Promise<number> => {
  const response = await api.delete<
    ApiResponse<{ revokedCount: number }>
  >(ENDPOINTS.auth.logoutOtherDevices);
  return response.data.data.revokedCount;
};
