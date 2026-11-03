import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type { ListOrdersParams, Order, OrdersListData, UpdateOrderStatusPayload } from "@/features/orders/types";

export const ordersApi = {
  async getById(id: number): Promise<Order> {
    const response = await apiClient.get<Order, ApiResponse<Order>>(
      API_ENDPOINTS.orders.byId(id),
      { headers: { "ngrok-skip-browser-warning": "true" } },
    );
    return response.data;
  },
  async updateStatus(id: number, payload: UpdateOrderStatusPayload): Promise<void> {
    // The collection does not specify a success response body.
    await apiClient.patch<unknown, unknown>(API_ENDPOINTS.orders.status(id), payload, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  },
  async list(params: ListOrdersParams): Promise<OrdersListData> {
    const response = await apiClient.get<OrdersListData, ApiResponse<OrdersListData>>(
      API_ENDPOINTS.orders.list,
      { params, headers: { "ngrok-skip-browser-warning": "true" } },
    );
    return response.data;
  },
};
