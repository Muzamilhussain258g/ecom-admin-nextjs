"use client";

import { useMutation } from "@tanstack/react-query";
import type { LoginCredentials } from "../types";
import { authApi } from "../api/auth.api";

export const useLoginMutation= ()=>{
    return useMutation<void, Error, LoginCredentials>({
        mutationFn:async(credentials:LoginCredentials)=>{
            const result = await authApi.login(credentials);
            console.log("Login result:", result);
            // if (result.error) throw new Error(result.error);
        },
        // retry: false,
        // gcTime: 0,
        // networkMode: "always",
    })
}
