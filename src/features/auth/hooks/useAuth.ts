"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserStore } from "../store/use-user-store";
import { authApi, type LoginCredentials } from "../api/auth.api";

export const currentUserQueryKey = ["auth", "me"] as const;

export function useCurrentUserQuery() {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authApi.getCurrentUser,
    initialData: user ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export const useLoginMutation = () => {
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.loggedInUser);
      queryClient.setQueryData(currentUserQueryKey, data.loggedInUser);
      document.cookie = `_at=${data.accessToken}; path=/`;
      document.cookie = `_rt=${data.refreshToken}; path=/`;
      document.cookie = `_rti=${data.refreshTokenId}; path=/`;
    },
  });
};

function readCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie?.slice(name.length + 1) || undefined;
}

export function useLogoutMutation() {
  const clearUser = useUserStore((state) => state.clearUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = readCookie("_rt");
      const refreshTokenId = readCookie("_rti");

      if (!refreshToken || !refreshTokenId) {
        throw new Error("Your session is missing its refresh credentials. Please sign in again.");
      }

      await authApi.logout({ refreshToken, refreshTokenId });
    },
    onSuccess: () => {
      for (const name of ["_at", "_rt", "_rti"]) {
        document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
      }

      clearUser();
      queryClient.clear();
      router.replace("/sign-in");
    },
  });
}
