"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { collectionsApi } from "@/features/collections/api/collections.api";
import type { CreateCollectionPayload } from "@/features/collections/types";

export const collectionsQueryKey = ["collections", "list"] as const;

export const collectionDetailQueryKey = (slug: string) =>
  ["collections", "detail", slug] as const;

export function useCollectionsQuery() {
  return useQuery({
    queryKey: collectionsQueryKey,
    queryFn: () => collectionsApi.list(),
  });
}

export function useCollectionQuery(slug: string) {
  return useQuery({
    queryKey: collectionDetailQueryKey(slug),
    queryFn: () => collectionsApi.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) =>
      collectionsApi.create(payload),
    onSuccess: (collection) => {
      void queryClient.invalidateQueries({ queryKey: collectionsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: collectionDetailQueryKey(collection.slug),
      });
    },
  });
}
