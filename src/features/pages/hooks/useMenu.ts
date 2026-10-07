import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMenuService, saveMenuService } from "@/features/pages/services/menu.service";
import type { MenuSection } from "@/features/pages/types/menu.types";
import { parseApiError } from "@/utils/errorHandler";

export const menuQueryKey = (slug: string) => ["menu", slug] as const;

const useMenu = (slug: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: menuQueryKey(slug),
    queryFn: () => getMenuService(slug),
    enabled: Boolean(slug),
  });

  const saveMutation = useMutation({
    mutationFn: async (sections: MenuSection[]) => {
      try {
        return await saveMenuService(slug, sections);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuQueryKey(slug) });
    },
  });

  return {
    sections: query.data?.sections ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    saveMenu: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
};

export default useMenu;
