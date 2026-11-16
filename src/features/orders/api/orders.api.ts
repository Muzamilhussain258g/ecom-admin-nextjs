import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type {
  AdminOrder,
  OrderStatus,
  OrdersListData,
  OrdersListParams,
} from "@/features/orders/types";

export const ordersApi = {
  listAdmin: async (params: OrdersListParams): Promise<OrdersListData> => {
    const response = (await apiClient.get(API_ENDPOINTS.orders.adminList, {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.status ? { status: params.status } : {}),
        ...(params.userId ? { userId: params.userId } : {}),
      },
    })) as ApiResponse<OrdersListData>;

    return response.data;
  },

  getById: async (id: number): Promise<AdminOrder> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.orders.byId(id)
    )) as ApiResponse<AdminOrder>;

    return response.data;
  },

  updateAdminStatus: async (
    id: number,
    status: OrderStatus
  ): Promise<AdminOrder> => {
    const response = (await apiClient.patch(
      API_ENDPOINTS.orders.adminStatus(id),
      { status }
    )) as ApiResponse<AdminOrder>;

    return response.data;
  },
};
