import { useQuery } from "@tanstack/react-query";
import { getFeedTagsService } from "@/features/feed/services/feed.service";
import type { FeedFilter, FeedTag } from "@/features/feed/types/feed.types";

export const feedTagsQueryKey = ["feed", "tags"] as const;

const useFeedTags = () => {
  const { data, isLoading } = useQuery<FeedTag[]>({
    queryKey:  feedTagsQueryKey,
    queryFn:   getFeedTagsService,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Build filter tabs from tags
  const filters: FeedFilter[] = [
    { type: "all",     label: "Explore"  },
    { type: "for-you", label: "For You"  },
    ...(data ?? []).map((tag) => ({
      type:  tag.type === "tag" ? "tag" as const : "category" as const,
      value: tag.label,
      label: tag.label.charAt(0).toUpperCase() + tag.label.slice(1),
    })),
  ];

  return { filters, isLoading };
};

export default useFeedTags;