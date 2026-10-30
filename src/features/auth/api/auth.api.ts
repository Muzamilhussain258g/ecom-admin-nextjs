import type { LoggedInUser, LoginData } from "@/features/auth/types";
import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/lib/api/generic-response.types";

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginSuccessBody = {
  success: true;
  data: { loggedInUser: LoggedInUser };
  message?: string;
};

type LoginErrorBody = {
  message?: string;
};

export const authApi = {
  /** Same-origin login; JWT is set as HttpOnly cookie by the API route. */
  login: async (credentials: LoginCredentials): Promise<LoginData> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials);
    // console.log(response.data,"response.data");
    return response.data;
  }
};
