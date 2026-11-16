export interface Review {
  id: number;
  userId: number;
  productId: number;
  stars: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string };
  product: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ListReviewsParams {
  page: number;
  limit: number;
  search?: string;
  productId?: number;
  stars?: number;
}

export interface ReviewsListData {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
