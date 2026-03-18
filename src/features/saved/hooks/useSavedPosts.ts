import { useQuery } from "@tanstack/react-query";
import { getSavedPostsService } from "@/features/saved/services/saved.service";
import type { ApiPost } from "@/features/posts/types/post.types";

export const savedPostsQueryKey = ["saved", "posts"] as const;

const useSavedPosts = () => {
  const { data, isLoading, isError, refetch } = useQuery<ApiPost[]>({
    queryKey: savedPostsQueryKey,
    queryFn: getSavedPostsService,
    staleTime: 1000 * 60 * 2,
  });

  return {
    posts: data ?? [],
    isLoading,
    isError,
    refetch,
  };
};

export default useSavedPosts;
