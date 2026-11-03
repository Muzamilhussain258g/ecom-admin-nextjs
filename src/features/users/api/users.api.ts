import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type { ListUsersParams, User, UsersListData } from "@/features/users/types";

export const usersApi = {
  async list(params: ListUsersParams): Promise<UsersListData> {
    const response = await apiClient.get<UsersListData, ApiResponse<UsersListData>>(
      API_ENDPOINTS.users.list, { params }
    );
    return response.data;
  },
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User, ApiResponse<User>>(
      API_ENDPOINTS.users.byId(id)
    );
    return response.data;
  },
};
