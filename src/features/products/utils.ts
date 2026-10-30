import type { Product, ProductImage } from "@/features/products/types";

export function getPrimaryImage(product: Product): ProductImage | null {
  const images = product.images ?? [];
  return images.find((image) => image.isPrimary) ?? images[0] ?? null;
}

export function getPrimaryCategoryName(product: Product): string {
  const categories = product.productCategories ?? [];
  const primary =
    categories.find((link) => link.isPrimary) ?? categories[0];
  return primary?.category.categoryName ?? "—";
}

export function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
