import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  CreateVariantTypePayload,
  CreateVariantValuePayload,
  UpdateVariantTypePayload,
  UpdateVariantValuePayload,
  VariantType,
  VariantTypeValue,
} from "@/features/variant-types/types";

export const variantTypesApi = {
  list: async (): Promise<VariantType[]> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.variantTypes.list
    )) as ApiResponse<VariantType[]>;

    return response.data;
  },

  create: async (payload: CreateVariantTypePayload): Promise<VariantType> => {
    const response = (await apiClient.post(
      API_ENDPOINTS.variantTypes.create,
      payload
    )) as ApiResponse<VariantType>;

    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateVariantTypePayload
  ): Promise<VariantType> => {
    const response = (await apiClient.patch(
      API_ENDPOINTS.variantTypes.byId(id),
      payload
    )) as ApiResponse<VariantType>;

    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.variantTypes.byId(id));
  },

  addValue: async (
    variantTypeId: number,
    payload: CreateVariantValuePayload
  ): Promise<VariantTypeValue> => {
    const response = (await apiClient.post(
      API_ENDPOINTS.variantTypes.values(variantTypeId),
      payload
    )) as ApiResponse<VariantTypeValue>;

    return response.data;
  },

  updateValue: async (
    valueId: number,
    payload: UpdateVariantValuePayload
  ): Promise<VariantTypeValue> => {
    const response = (await apiClient.patch(
      API_ENDPOINTS.variantValues.byId(valueId),
      payload
    )) as ApiResponse<VariantTypeValue>;

    return response.data;
  },

  removeValue: async (valueId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.variantValues.byId(valueId));
  },
};
