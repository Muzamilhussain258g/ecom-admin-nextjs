"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { variantTypesApi } from "@/features/variant-types/api/variant-types.api";
import type {
  CreateVariantTypePayload,
  CreateVariantValuePayload,
  UpdateVariantTypePayload,
  UpdateVariantValuePayload,
} from "@/features/variant-types/types";

export const variantTypesQueryKey = ["variant-types", "list"] as const;

export function useVariantTypesQuery() {
  return useQuery({
    queryKey: variantTypesQueryKey,
    queryFn: () => variantTypesApi.list(),
  });
}

function invalidateVariantTypes(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: variantTypesQueryKey });
}

export function useCreateVariantTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantTypePayload) =>
      variantTypesApi.create(payload),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}

export function useUpdateVariantTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateVariantTypePayload;
    }) => variantTypesApi.update(id, payload),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}

export function useDeleteVariantTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => variantTypesApi.remove(id),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}

export function useCreateVariantValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantTypeId,
      payload,
    }: {
      variantTypeId: number;
      payload: CreateVariantValuePayload;
    }) => variantTypesApi.addValue(variantTypeId, payload),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}

export function useUpdateVariantValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      valueId,
      payload,
    }: {
      valueId: number;
      payload: UpdateVariantValuePayload;
    }) => variantTypesApi.updateValue(valueId, payload),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}

export function useDeleteVariantValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valueId: number) => variantTypesApi.removeValue(valueId),
    onSuccess: () => void invalidateVariantTypes(queryClient),
  });
}
