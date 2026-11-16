import type { LoggedInUser, LoginData } from "@/features/auth/types";
import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LogoutCredentials = {
  refreshToken: string;
  refreshTokenId: string;
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginData> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<LoggedInUser> => {
    const response = (await apiClient.get(
      API_ENDPOINTS.auth.me
    )) as ApiResponse<LoggedInUser>;

    return response.data;
  },

  logout: async (credentials: LogoutCredentials): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout, credentials);
  },
};
