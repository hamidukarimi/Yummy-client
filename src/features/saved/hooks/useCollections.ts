import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPostToCollectionService,
  createCollectionService,
  deleteCollectionService,
  getCollectionPostsService,
  getCollectionsService,
  removePostFromCollectionService,
  renameCollectionService,
} from "@/features/saved/services/collection.service";
import { savedPostsQueryKey } from "@/features/saved/hooks/useSavedPosts";
import { parseApiError } from "@/utils/errorHandler";
import useAuthStore from "@/store/authStore";

export const collectionsQueryKey = ["saved", "collections"] as const;
export const collectionPostsQueryKey = (id: string) =>
  ["saved", "collection", id] as const;

const useCollections = (selectedId: string | null) => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const collectionsQuery = useQuery({
    queryKey: collectionsQueryKey,
    queryFn: getCollectionsService,
  });

  const postsQuery = useQuery({
    queryKey: collectionPostsQueryKey(selectedId ?? ""),
    queryFn: () => getCollectionPostsService(selectedId ?? ""),
    enabled: Boolean(selectedId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: collectionsQueryKey });
    void queryClient.invalidateQueries({ queryKey: ["saved", "collection"] });
  };

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      try {
        return await createCollectionService(name);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const renameMutation = useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      try {
        return await renameCollectionService(input.id, input.name);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteCollectionService(id);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  const addMutation = useMutation({
    mutationFn: async (input: { collectionId: string; postId: string }) => {
      try {
        return await addPostToCollectionService(input.collectionId, input.postId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: (result, input) => {
      if (result.newlySaved && user && !user.savedPosts.includes(input.postId)) {
        setUser({
          ...user,
          savedPosts: [...user.savedPosts, input.postId],
        });
      }
      invalidate();
      void queryClient.invalidateQueries({ queryKey: savedPostsQueryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (input: { collectionId: string; postId: string }) => {
      try {
        await removePostFromCollectionService(input.collectionId, input.postId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  return {
    collections: collectionsQuery.data ?? [],
    isLoadingCollections: collectionsQuery.isLoading,
    collectionPosts: postsQuery.data ?? [],
    isLoadingCollectionPosts: postsQuery.isLoading,
    isCollectionPostsError: postsQuery.isError,
    createCollection: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    renameCollection: renameMutation.mutateAsync,
    isRenaming: renameMutation.isPending,
    renameError: renameMutation.error,
    deleteCollection: deleteMutation.mutateAsync,
    addPost: addMutation.mutateAsync,
    addingPostId: addMutation.isPending ? addMutation.variables?.postId : undefined,
    addError: addMutation.error,
    removePost: removeMutation.mutate,
    removingPostId: removeMutation.isPending
      ? removeMutation.variables?.postId
      : undefined,
  };
};

export default useCollections;
