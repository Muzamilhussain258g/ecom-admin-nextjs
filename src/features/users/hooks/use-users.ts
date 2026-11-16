"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import type { UsersListParams } from "@/features/users/types";

export const usersQueryKey = (params: UsersListParams) =>
  ["users", "list", params] as const;

export function useUsersQuery(params: UsersListParams) {
  return useQuery({
    queryKey: usersQueryKey(params),
    queryFn: () => usersApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}
