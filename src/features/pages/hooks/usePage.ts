import { useQuery } from "@tanstack/react-query";
import { getPageBySlugService } from "@/features/pages/services/page.service";
import type { PageViewData } from "@/features/pages/types/page.types";

export const pageQueryKey = (slug: string) => ["page", slug] as const;

const usePage = (slug: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery<PageViewData>({
    queryKey:  pageQueryKey(slug),
    queryFn:   () => getPageBySlugService(slug),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled:   !!slug,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default usePage;