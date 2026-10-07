import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiCollection } from "@/features/saved/types/collection.types";
import type { ApiPost } from "@/features/posts/types/post.types";

export const getCollectionsService = async (): Promise<ApiCollection[]> => {
  const response = await api.get<ApiResponse<{ collections: ApiCollection[] }>>(
    ENDPOINTS.saved.collections,
  );
  return response.data.data.collections;
};

export const createCollectionService = async (name: string): Promise<ApiCollection> => {
  const response = await api.post<ApiResponse<{ collection: ApiCollection }>>(
    ENDPOINTS.saved.collections,
    { name },
  );
  return response.data.data.collection;
};

export const renameCollectionService = async (
  id: string,
  name: string,
): Promise<ApiCollection> => {
  const response = await api.patch<ApiResponse<{ collection: ApiCollection }>>(
    ENDPOINTS.saved.collection(id),
    { name },
  );
  return response.data.data.collection;
};

export const deleteCollectionService = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.saved.collection(id));
};

export const getCollectionPostsService = async (id: string): Promise<ApiPost[]> => {
  const response = await api.get<ApiResponse<{ posts: ApiPost[] }>>(
    ENDPOINTS.saved.collection(id),
  );
  return response.data.data.posts;
};

export const addPostToCollectionService = async (
  collectionId: string,
  postId: string,
): Promise<{ added: boolean; newlySaved: boolean }> => {
  const response = await api.post<
    ApiResponse<{ added: boolean; newlySaved: boolean }>
  >(ENDPOINTS.saved.collectionPost(collectionId, postId));
  return response.data.data;
};

export const removePostFromCollectionService = async (
  collectionId: string,
  postId: string,
): Promise<void> => {
  await api.delete(ENDPOINTS.saved.collectionPost(collectionId, postId));
};
