import { useQuery } from "@tanstack/react-query";
import { getPostByIdService } from "@/features/posts/services/post.service";
import type { ApiPost } from "@/features/posts/types/post.types";

export const postQueryKey = (id: string) => ["post", id] as const;

const usePost = (id: string) => {
  const { data, isLoading, isError } = useQuery<ApiPost>({
    queryKey: postQueryKey(id),
    queryFn: () => getPostByIdService(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return { post: data, isLoading, isError };
};

export default usePost;
