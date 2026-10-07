import { useQuery } from "@tanstack/react-query";
import { getAllPagesService } from "@/features/pages/services/page.service";
import type { PaginatedPages } from "@/features/pages/types/page.types";

export const discoverPagesQueryKey = (
  search: string,
  category: string,
  lat?: number,
  lng?: number,
  openNow?: boolean,
) => ["pages", "discover", search, category, lat, lng, openNow] as const;

const useDiscoverPages = (
  search: string,
  category: string,
  coords?: { lat: number; lng: number } | null,
  openNow = false,
) => {
  const { data, isLoading, isError } = useQuery<PaginatedPages>({
    queryKey:  discoverPagesQueryKey(search, category, coords?.lat, coords?.lng, openNow),
    queryFn:   () => getAllPagesService({
      search,
      limit: 50,
      ...(category && { category }),
      ...(coords && { lat: coords.lat, lng: coords.lng, radiusKm: 10 }),
      ...(openNow && { openNow: true }),
    }),
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
