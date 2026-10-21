import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/lib/api/generic-response.types";
import { LoginData } from "../types";


export type LoginCredentials = {
  email: string
  password: string
}
export const authApi = {
  /**
   * Admin Login: POST /auth/signin
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginData>> => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.auth.login,
      credentials
    );
    // console.log("Login API response:", res.data);
    return data
  },
}
