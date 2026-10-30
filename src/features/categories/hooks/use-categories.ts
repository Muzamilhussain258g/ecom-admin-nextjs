"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "@/features/categories/api/categories.api";
import type {
  CreateCategoryPayload,
  ListCategoriesParams,
  UpdateCategoryPayload,
} from "@/features/categories/types";

export const categoriesQueryKey = (params: ListCategoriesParams) =>
  ["categories", "list", params] as const;

export const defaultCategoriesParams: ListCategoriesParams = {
  page: 1,
  limit: 100,
  depth: 5,
};

export function useCategoriesQuery(
  params: ListCategoriesParams = defaultCategoriesParams
) {
  return useQuery({
    queryKey: categoriesQueryKey(params),
    queryFn: () => categoriesApi.list(params),
  });
}

export const categoryDetailQueryKey = (id: number) =>
  ["categories", "detail", id] as const;

export function useCategoryQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: categoryDetailQueryKey(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ["categories"] });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoriesApi.create(payload),
    onSuccess: () => void invalidateCategories(queryClient),
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCategoryPayload;
    }) => categoriesApi.update(id, payload),
    onSuccess: () => void invalidateCategories(queryClient),
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => void invalidateCategories(queryClient),
  });
}
