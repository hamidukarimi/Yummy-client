import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePageService } from "@/features/pages/services/page.service";
import { parseApiError } from "@/utils/errorHandler";
import { pageQueryKey } from "@/features/pages/hooks/usePage";
import type { UpdatePagePayload } from "@/features/pages/types/page.types";

const useEditPage = (slug: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (payload: UpdatePagePayload) => {
      try {
        return await updatePageService(slug, payload);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageQueryKey(slug) });
    },
  });

  return { editPage: mutate, isPending, error, isSuccess };
};

export default useEditPage;