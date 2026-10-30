import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  CategoriesListData,
  CategoryNode,
  CreateCategoryPayload,
  ListCategoriesParams,
  UpdateCategoryPayload,
} from "@/features/categories/types";

export const categoriesApi = {
  list: async (
    params: ListCategoriesParams = { page: 1, limit: 100, depth: 5 }
  ): Promise<CategoriesListData> => {
    const response = (await apiClient.get(API_ENDPOINTS.categories.list, {
      params,
    })) as ApiResponse<CategoriesListData>;

    return response.data;
  },

  getById: async (id: number): Promise<CategoryNode> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.categories.byId(id)
    )) as ApiResponse<CategoryNode>;

    return response.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<CategoryNode> => {
    const response = (await apiClient.post(API_ENDPOINTS.categories.create, {
      categoryName: payload.categoryName,
      parentId: payload.parentId ?? null,
    })) as ApiResponse<CategoryNode>;

    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateCategoryPayload
  ): Promise<CategoryNode> => {
    const response = (await apiClient.patch(
      API_ENDPOINTS.categories.byId(id),
      payload
    )) as ApiResponse<CategoryNode>;

    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.categories.byId(id));
  },
};
