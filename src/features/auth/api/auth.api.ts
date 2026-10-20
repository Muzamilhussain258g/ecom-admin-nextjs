import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginCredentials } from "../types";

export const authApi = {
    /**
     * Admin Login: POST /auth/signin
     */
    login: async (credentials: LoginCredentials) => {
        return apiClient.post<unknown>(
            API_ENDPOINTS.auth.login,
            credentials
        );
    },
}
