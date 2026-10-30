"use client";

import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../store/use-user-store";
import { authApi, type LoginCredentials } from "../api/auth.api";

export const useLoginMutation = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.loggedInUser);
      document.cookie = `_at=${data.accessToken}; path=/`;
      document.cookie = `_rt=${data.refreshToken}; path=/`;
      document.cookie = `_rti=${data.refreshTokenId}; path=/`;
    },
  });
};
