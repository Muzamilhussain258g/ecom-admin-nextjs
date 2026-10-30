export type CollectionMedia = {
  id: number;
  url?: string;
  providerPublicId?: string;
} | null;

export type CollectionProductSummary = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  basePrice: string;
  productStatus: boolean;
  hasVariants: boolean;
};

export type CollectionProductLink = {
  id: number;
  collectionId: number;
  productId: number;
  position: number;
  product: CollectionProductSummary;
};

export type Collection = {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  media: CollectionMedia;
  products: CollectionProductLink[];
};

export type CollectionCoverImageInput = {
  providerPublicId: string;
  version: number;
  signature: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  altText?: string;
};

export type CollectionProductInput = {
  productId: number;
  position: number;
};

export type CreateCollectionPayload = {
  name: string;
  description: string;
  isActive: boolean;
  products: CollectionProductInput[];
  coverImage?: CollectionCoverImageInput;
};
