export interface Review {
  id: number;
  userId: number;
  productId: number;
  stars: number;
  review: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string };
  product: {
    id: number;
    name: string;
    slug: string;
    // Image fields are not defined by the supplied response.
    images: unknown[];
  };
}

export interface ListReviewsParams {
  page: number;
  limit: number;
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
