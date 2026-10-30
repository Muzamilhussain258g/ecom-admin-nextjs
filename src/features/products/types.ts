export type ProductSortOrder = "asc" | "desc";

export type ListProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortOrder?: ProductSortOrder;
};

export type ProductCategory = {
  id: number;
  categoryName: string;
  slug: string;
  parentId: number | null;
};

export type ProductCategoryLink = {
  isPrimary: boolean;
  category: ProductCategory;
};

export type ProductMedia = {
  id: number;
  providerAssetId: string;
  providerPublicId: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

export type VariantTypeRef = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type VariantValue = {
  id: number;
  value: string;
  code: string;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  variantType: VariantTypeRef;
};

export type ProductVariantOptionValue = VariantValue & {
  productVariantValueId: number;
};

export type ProductVariantOption = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  values: ProductVariantOptionValue[];
};

export type ProductImage = {
  id: number;
  isPrimary: boolean;
  position: number;
  altText: string | null;
  media: ProductMedia;
  variantValue: VariantValue | null;
};

export type ProductVariant = {
  id: number;
  sku: string;
  price: string;
  stock: number;
  isActive: boolean;
  combinationKey: string;
  values: VariantValue[];
};

export type ProductReviews = {
  averageRating: number;
  totalReviews: number;
  items: unknown[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  basePrice: string;
  productStatus: boolean;
  hasVariants: boolean;
  productCategories: ProductCategoryLink[];
  images: ProductImage[];
};

export type ProductDetail = Product & {
  variantOptions: ProductVariantOption[];
  variants: ProductVariant[];
  reviews: ProductReviews;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProductsListData = {
  products: Product[];
  meta: {
    pagination: PaginationMeta;
  };
};

export type CreateProductCategoryInput = {
  categoryId: number;
  isPrimary: boolean;
};

export type CreateProductMediaInput = {
  providerPublicId: string;
  isPrimary: boolean;
  position: number;
  altText?: string;
  variantValueId?: number;
};

export type CreateProductVariantSelection = {
  variantTypeId: number;
  variantValueIds: number[];
};

export type CreateProductVariantQuantity = {
  variantValueIds: number[];
  quantity: number;
};

export type CreateProductWithVariantsPayload = {
  name: string;
  description: string;
  basePrice: number;
  hasVariants: true;
  categories: CreateProductCategoryInput[];
  media: CreateProductMediaInput[];
  variantSelections: CreateProductVariantSelection[];
  variantQuantities: CreateProductVariantQuantity[];
};

/** Summary returned by POST /products (not a full ProductDetail). */
export type CreateProductResult = {
  id: number;
  name: string;
  slug: string;
  basePrice: string | number;
  hasVariants: boolean;
  variantsCreated: number;
  createdAt: string;
};
