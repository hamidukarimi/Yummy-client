import { useQuery } from "@tanstack/react-query";
import { getMyProfileService } from "@/features/profile/services/profile.service";
import type { ApiUser } from "@/types/api.types";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const profileQueryKey = ["profile", "me"] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useProfile = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<ApiUser>({
    queryKey: profileQueryKey,
    queryFn: getMyProfileService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useProfile;