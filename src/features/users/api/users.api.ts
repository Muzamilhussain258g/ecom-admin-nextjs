import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type { ListUsersParams, UsersListData } from "@/features/users/types";

export const usersApi = {
  async list(params: ListUsersParams): Promise<UsersListData> {
    const response = (await apiClient.get(API_ENDPOINTS.users.list, {
      params,
      headers: { "ngrok-skip-browser-warning": "true" },
    })) as ApiResponse<UsersListData>;
    return response.data;
  },
};
