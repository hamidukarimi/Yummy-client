import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollowService } from "@/features/pages/services/page.service";
import { parseApiError } from "@/utils/errorHandler";
import { pageQueryKey } from "@/features/pages/hooks/usePage";
import type { ParsedError } from "@/utils/errorHandler";
import type { PageViewData } from "@/features/pages/types/page.types";

const useFollowPage = (slug: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
  { following: boolean },
  ParsedError,
  void
>({
  mutationFn: async () => {
    try {
      return await toggleFollowService(slug);
    } catch (rawError) {
      throw parseApiError(rawError);
    }
  },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: pageQueryKey(slug) });

      const previous = queryClient.getQueryData<PageViewData>(pageQueryKey(slug));

      if (previous) {
        queryClient.setQueryData<PageViewData>(pageQueryKey(slug), {
          ...previous,
          isFollowing:    !previous.isFollowing,
          followersCount: previous.isFollowing
            ? previous.followersCount - 1
            : previous.followersCount + 1,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      const ctx = context as { previous?: PageViewData };
      if (ctx?.previous) {
        queryClient.setQueryData(pageQueryKey(slug), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: pageQueryKey(slug) });
    },
  });

  return { toggleFollow: mutate, isPending };
};

export default useFollowPage;