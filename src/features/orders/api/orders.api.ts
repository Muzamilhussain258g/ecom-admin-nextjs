import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  ListOrdersParams,
  Order,
  OrdersListData,
  UpdateOrderStatusPayload,
} from "@/features/orders/types";

const requestHeaders = { "ngrok-skip-browser-warning": "true" };

export const ordersApi = {
  async getById(id: number): Promise<Order> {
    const response = (await apiClient.get(API_ENDPOINTS.orders.byId(id), {
      headers: requestHeaders,
    })) as ApiResponse<Order>;
    return response.data;
  },

  async updateStatus(
    id: number,
    payload: UpdateOrderStatusPayload
  ): Promise<Order> {
    const response = (await apiClient.patch(
      API_ENDPOINTS.orders.status(id),
      payload,
      { headers: requestHeaders }
    )) as ApiResponse<Order>;
    return response.data;
  },

  async list(params: ListOrdersParams): Promise<OrdersListData> {
    const response = (await apiClient.get(API_ENDPOINTS.orders.list, {
      params,
      headers: requestHeaders,
    })) as ApiResponse<OrdersListData>;
    return response.data;
  },
};
