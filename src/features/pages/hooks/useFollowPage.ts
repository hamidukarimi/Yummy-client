import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollowService } from "@/features/pages/services/page.service";
import { parseApiError } from "@/utils/errorHandler";
import { pageQueryKey } from "@/features/pages/hooks/usePage";
import type { PageViewData } from "@/features/pages/types/page.types";

const useFollowPage = (slug: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        return await toggleFollowService(slug);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },

    // Optimistic update for page view
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
      const ctx = context as { previous?: PageViewData };
      if (ctx?.previous) {
        queryClient.setQueryData(pageQueryKey(slug), ctx.previous);
      }
    },

    onSettled: () => {
      // Invalidate single page query
      void queryClient.invalidateQueries({ queryKey: pageQueryKey(slug) });
      // Invalidate discover pages — updates follow state and follower counts
      void queryClient.invalidateQueries({ queryKey: ["pages", "discover"] });
      // Invalidate followed pages tab
      void queryClient.invalidateQueries({ queryKey: ["pages", "followed"] });
    },
  });

  return { toggleFollow: mutate, isPending };
};

export default useFollowPage;