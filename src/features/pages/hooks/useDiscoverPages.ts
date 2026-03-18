import { useQuery } from "@tanstack/react-query";
import { getAllPagesService } from "@/features/pages/services/page.service";
import type { PaginatedPages } from "@/features/pages/types/page.types";

export const discoverPagesQueryKey = (search: string) =>
  ["pages", "discover", search] as const;

const useDiscoverPages = (search: string) => {
  const { data, isLoading, isError } = useQuery<PaginatedPages>({
    queryKey:  discoverPagesQueryKey(search),
    queryFn:   () => getAllPagesService({ search, limit: 50 }),
    staleTime: 1000 * 60 * 2,
  });

  return {
    pages:     data?.pages ?? [],
    total:     data?.total ?? 0,
    isLoading,
    isError,
  };
};

export default useDiscoverPages;