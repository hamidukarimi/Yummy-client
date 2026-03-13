import { useQuery } from "@tanstack/react-query";
import { getFollowedPagesService } from "@/features/pages/services/page.service";
import type { ApiPage } from "@/features/pages/types/page.types";

export const followedPagesQueryKey = ["pages", "followed"] as const;

const useFollowedPages = () => {
  const { data, isLoading, isError } = useQuery<ApiPage[]>({
    queryKey: followedPagesQueryKey,
    queryFn:  getFollowedPagesService,
    staleTime: 1000 * 60 * 2,
  });

  return {
    pages:     data ?? [],
    isLoading,
    isError,
  };
};

export default useFollowedPages;