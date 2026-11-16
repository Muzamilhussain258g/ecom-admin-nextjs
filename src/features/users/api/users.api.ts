import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type { UsersListData, UsersListParams } from "@/features/users/types";

export const usersApi = {
  list: async (params: UsersListParams): Promise<UsersListData> => {
    const response = (await apiClient.get(API_ENDPOINTS.users.list, {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
      },
    })) as ApiResponse<UsersListData>;

    return response.data;
  },
};
