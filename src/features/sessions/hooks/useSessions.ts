import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSessionsService,
  logoutOtherDevicesService,
  revokeSessionService,
} from "@/features/sessions/services/session.service";
import { parseApiError } from "@/utils/errorHandler";

export const sessionsQueryKey = ["auth", "sessions"] as const;

const useSessions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: getSessionsService,
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      try {
        await revokeSessionService(sessionId);
        return sessionId;
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      try {
        return await logoutOtherDevicesService();
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    revokeSession: revokeMutation.mutate,
    revokingSessionId: revokeMutation.isPending
      ? revokeMutation.variables
      : undefined,
    revokeError: revokeMutation.error,
    logoutOtherDevices: revokeOthersMutation.mutate,
    isLoggingOutOthers: revokeOthersMutation.isPending,
    logoutOthersError: revokeOthersMutation.error,
    revokedCount: revokeOthersMutation.data,
  };
};

export default useSessions;
