import { useQuery } from "@tanstack/react-query";
import { getMyPostsService } from "@/features/posts/services/post.service";
import type { PaginatedPosts } from "@/features/posts/types/post.types";

export const myPostsQueryKey = ["posts", "my"] as const;

const useMyPosts = () => {
  const { data, isLoading, isError, refetch } = useQuery<PaginatedPosts>({
    queryKey:  myPostsQueryKey,
    queryFn:   () => getMyPostsService(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    posts:     data?.posts ?? [],
    isLoading,
    isError,
    refetch,
  };
};

export default useMyPosts;