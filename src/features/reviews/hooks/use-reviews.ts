"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import type { ListReviewsParams } from "@/features/reviews/types";

export function useReviewsQuery(params: ListReviewsParams) {
  return useQuery({
    queryKey: ["reviews", "list", params],
    queryFn: () => reviewsApi.list(params),
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
