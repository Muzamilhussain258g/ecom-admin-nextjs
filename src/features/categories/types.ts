export type CategoryMedia = {
  id: number;
  url?: string;
  providerPublicId?: string;
} | null;

export type CategoryNode = {
  id: number;
  categoryName: string;
  slug: string;
  parentId: number | null;
  media: CategoryMedia;
  children?: CategoryNode[];
  _count?: {
    productCategories: number;
  };
};

export type ListCategoriesParams = {
  page?: number;
  limit?: number;
  depth?: number;
};

export type CategoriesListData = {
  categories: CategoryNode[];
  meta: {
    parentId: number | null;
    depth: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type FlatCategoryOption = {
  id: number;
  label: string;
};

export type CreateCategoryPayload = {
  categoryName: string;
  parentId?: number | null;
};

export type UpdateCategoryPayload = {
  categoryName?: string;
  parentId?: number | null;
};
