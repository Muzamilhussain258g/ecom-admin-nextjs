import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginCredentials, LoginData } from "../types";
import { ApiResponse } from "@/lib/api/generic-response.types";

export const authApi = {
    /**
     * Admin Login: POST /auth/signin
     */
    login: async (credentials: LoginCredentials) => {
        let res = await apiClient.post<ApiResponse<LoginData>>(
            API_ENDPOINTS.auth.login,
            credentials
        );
        // console.log("Login API response:", res);
        return res
    },
}
