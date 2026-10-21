"use client";

import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../store/use-user-store";
import { authApi, LoginCredentials } from "../api/auth.api";

export const useLoginMutation = () => {
    const setUser = useUserStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await authApi.login(credentials);
            return response.data
        },
        onSuccess: (data) => {
            setUser(data.loggedInUser);
            // set tokens in cookies using document.cookie 
            document.cookie = `access_token=${data.accessToken}; path=/`;
            document.cookie = `refresh_token=${data.refreshToken}; path=/`;
            document.cookie = `refresh_token_id=${data.refreshTokenId}; path=/`;
        },
        // retry: false,
        // gcTime: 0,
        // networkMode: "always",
    })
}
