"use client";

import { useMutation } from "@tanstack/react-query";
import type { LoginCredentials } from "../types";
import { authApi } from "../api/auth.api";

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const res = await authApi.login(credentials);
            return res.data;
        },
        // retry: false,
        // gcTime: 0,
        // networkMode: "always",
    })
}
