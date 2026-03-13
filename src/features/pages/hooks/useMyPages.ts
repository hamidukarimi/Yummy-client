import { useQuery } from "@tanstack/react-query";
import { getMyPagesService } from "@/features/pages/services/page.service";
import type { ApiPage } from "@/features/pages/types/page.types";

export const myPagesQueryKey = ["pages", "my"] as const;

const useMyPages = () => {
  const { data, isLoading, isError, refetch } = useQuery<ApiPage[]>({
    queryKey: myPagesQueryKey,
    queryFn:  getMyPagesService,
    staleTime: 1000 * 60 * 5,
  });

  return {
    pages: data ?? [],
    isLoading,
    isError,
    refetch,
  };
};

export default useMyPages;