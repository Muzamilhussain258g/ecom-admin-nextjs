import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  Collection,
  CreateCollectionPayload,
} from "@/features/collections/types";

export const collectionsApi = {
  list: async (): Promise<Collection[]> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.collections.list
    )) as ApiResponse<Collection[]>;

    return response.data;
  },

  getBySlug: async (slug: string): Promise<Collection> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.collections.bySlug(slug)
    )) as ApiResponse<Collection>;

    return response.data;
  },

  create: async (payload: CreateCollectionPayload): Promise<Collection> => {
    const body: Record<string, unknown> = {
      name: payload.name,
      description: payload.description,
      isActive: payload.isActive,
      products: payload.products,
    };

    if (payload.coverImage) {
      body.coverImage = payload.coverImage;
    }

    const response = (await apiClient.post(
      API_ENDPOINTS.collections.create,
      body
    )) as ApiResponse<Collection>;

    return response.data;
  },
};
