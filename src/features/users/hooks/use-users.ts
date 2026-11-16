"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import type { ListUsersParams } from "@/features/users/types";

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: () => usersApi.list(params),
  });
}
