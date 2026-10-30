"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import type {
  CreateProductWithVariantsPayload,
  ListProductsParams,
} from "@/features/products/types";

export const productsQueryKey = (params: ListProductsParams) =>
  ["products", "list", params] as const;

export const productDetailQueryKey = (slug: string) =>
  ["products", "detail", slug] as const;

export function useProductsQuery(params: ListProductsParams) {
  return useQuery({
    queryKey: productsQueryKey(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useProductQuery(slug: string) {
  return useQuery({
    queryKey: productDetailQueryKey(slug),
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateProductWithVariantsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductWithVariantsPayload) =>
      productsApi.createWithVariants(payload),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      // Create response is a summary (no images/variants); fetch full detail by slug.
      void queryClient.invalidateQueries({
        queryKey: productDetailQueryKey(product.slug),
      });
    },
  });
}
