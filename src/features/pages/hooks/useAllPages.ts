import { useQuery } from "@tanstack/react-query";
import { getAllPagesService } from "@/features/pages/services/page.service";
import type { PaginatedPages } from "@/features/pages/types/page.types";

export const allPagesQueryKey = (search: string, category: string) =>
  ["pages", "all", search, category] as const;

const useAllPages = (search: string, category: string) => {
  const { data, isLoading, isError } = useQuery<PaginatedPages>({
    queryKey: allPagesQueryKey(search, category),
    queryFn:  () => getAllPagesService({ search, category, limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  return {
    pages:      data?.pages ?? [],
    total:      data?.total ?? 0,
    isLoading,
    isError,
  };
};

export default useAllPages;