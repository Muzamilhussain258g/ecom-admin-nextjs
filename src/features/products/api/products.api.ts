import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  CreateProductResult,
  CreateProductWithVariantsPayload,
  ListProductsParams,
  ProductDetail,
  ProductsListData,
} from "@/features/products/types";

function toQueryParams(params: ListProductsParams) {
  const query: Record<string, string | number> = {};

  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.category?.trim()) query.category = params.category.trim();
  if (params.sortOrder) query.sortOrder = params.sortOrder;

  return query;
}

export const productsApi = {
  list: async (params: ListProductsParams = {}): Promise<ProductsListData> => {
    const response = (await apiClient.get(API_ENDPOINTS.products.list, {
      params: toQueryParams(params),
    })) as ApiResponse<ProductsListData>;

    return response.data;
  },

  getBySlug: async (slug: string): Promise<ProductDetail> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.products.bySlug(slug)
    )) as ApiResponse<ProductDetail>;

    return response.data;
  },

  createWithVariants: async (
    payload: CreateProductWithVariantsPayload
  ): Promise<CreateProductResult> => {
    const response = (await apiClient.post(
      API_ENDPOINTS.products.create,
      payload
    )) as ApiResponse<CreateProductResult>;

    return response.data;
  },
};
