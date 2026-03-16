import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getExploreFeedService,
  getForYouFeedService,
} from "@/features/feed/services/feed.service";
import type { FeedFilter, PaginatedFeed } from "@/features/feed/types/feed.types";

const useFeed = (filter: FeedFilter, isAuthenticated: boolean) => {
  const isForYou = filter.type === "for-you";

  const queryKey = ["feed", filter.type, filter.value ?? ""] as const;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedFeed>({
    queryKey,
    queryFn: ({ pageParam = 1 }) => {
      const params = {
        page:  pageParam as number,
        limit: 10,
        ...(filter.type === "tag"      && { tag:      filter.value }),
        ...(filter.type === "category" && { category: filter.value }),
      };

      if (isForYou) return getForYouFeedService(params);
      return getExploreFeedService(params);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: isForYou ? isAuthenticated : true,
    staleTime: 1000 * 60 * 2,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];
  const total  = data?.pages[0]?.total ?? 0;

  return {
    posts,
    total,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage:         hasNextPage ?? false,
    isFetchingNextPage,
  };
};

export default useFeed;