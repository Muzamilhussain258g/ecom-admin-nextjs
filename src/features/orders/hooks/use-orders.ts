"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { OrderStatus, OrdersListParams } from "@/features/orders/types";

export const ordersQueryKey = (params: OrdersListParams) =>
  ["orders", "admin-list", params] as const;

export function useAdminOrdersQuery(params: OrdersListParams) {
  return useQuery({
    queryKey: ordersQueryKey(params),
    queryFn: () => ordersApi.listAdmin(params),
    placeholderData: (previousData) => previousData,
  });
}

export const orderDetailQueryKey = (id: number) =>
  ["orders", "detail", id] as const;

export function useOrderQuery(id: number) {
  return useQuery({
    queryKey: orderDetailQueryKey(id),
    queryFn: () => ordersApi.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useUpdateAdminOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateAdminStatus(id, status),
    onSuccess: (order) => {
      queryClient.setQueryData(orderDetailQueryKey(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ["orders", "admin-list"] });
    },
  });
}
