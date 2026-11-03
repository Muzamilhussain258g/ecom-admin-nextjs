"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { ListOrdersParams, UpdateOrderStatusPayload } from "@/features/orders/types";

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOrderStatusPayload }) => ordersApi.updateStatus(id, payload),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["orders"] }); },
  });
}

export function useOrdersQuery(params: ListOrdersParams) {
  return useQuery({
    queryKey: ["orders", "list", params],
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrderQuery(id: number) {
  return useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: () => ordersApi.getById(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}
