import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSaveService } from "@/features/saved/services/saved.service";
import { parseApiError } from "@/utils/errorHandler";
import { savedPostsQueryKey } from "@/features/saved/hooks/useSavedPosts";
import useAuthStore from "@/store/authStore";

const useToggleSave = (postId: string) => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        return await toggleSaveService(postId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    onMutate: () => {
      // Optimistically update the auth store
      if (!user) return;
      const isSaved = user.savedPosts?.includes(postId) ?? false;
      setUser({
        ...user,
        savedPosts: isSaved
          ? (user.savedPosts ?? []).filter((id) => id !== postId)
          : [...(user.savedPosts ?? []), postId],
      });
    },
    onError: () => {
      // Rollback — refetch the user profile to restore correct state
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: savedPostsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["saved", "collections"] });
      void queryClient.invalidateQueries({ queryKey: ["saved", "collection"] });
    },
  });

  return { toggleSave: mutate, isPending };
};

export default useToggleSave;
