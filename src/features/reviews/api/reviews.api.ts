import { apiClient } from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import type { ListReviewsParams, ReviewsListData } from "@/features/reviews/types";

export const reviewsApi = {
  async remove(id: number): Promise<{ id: number }> {
    const response = await apiClient.delete<{ id: number }, ApiResponse<{ id: number }>>(
      API_ENDPOINTS.reviews.byId(id),
      { headers: { "ngrok-skip-browser-warning": "true" } },
    );
    return response.data;
  },
  async list(params: ListReviewsParams): Promise<ReviewsListData> {
    const response = await apiClient.get<ReviewsListData, ApiResponse<ReviewsListData>>(
      API_ENDPOINTS.reviews.list,
      { params, headers: { "ngrok-skip-browser-warning": "true" } },
    );
    return response.data;
  },
};
