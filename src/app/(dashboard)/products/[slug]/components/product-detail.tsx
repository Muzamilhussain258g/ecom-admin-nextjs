"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useProductQuery } from "@/features/products/hooks/use-products";
import {
  formatDate,
  formatPrice,
  getPrimaryImage,
} from "@/features/products/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data: product, isLoading, isError, error, refetch } =
    useProductQuery(slug);

  const images = useMemo(() => {
    if (!product?.images) return [];
    return [...product.images].sort((a, b) => a.position - b.position);
  }, [product]);

  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedImageId(null);
  }, [product?.id]);

  const activeImage = useMemo(() => {
    if (!product) return null;
    if (selectedImageId != null) {
      return images.find((image) => image.id === selectedImageId) ?? null;
    }
    return getPrimaryImage(product);
  }, [images, product, selectedImageId]);

  if (!slug) {
    return (
      <div className="text-muted-foreground px-4 text-sm lg:px-6">
        Invalid product slug.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground px-4 text-sm lg:px-6">
        Loading product...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-start gap-3 px-4 lg:px-6">
        <p className="text-destructive text-sm">
          {error instanceof Error
            ? error.message
            : "Failed to load product details."}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Back to products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit cursor-pointer px-0"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to products
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.productStatus ? (
              <Badge className="bg-success/10 text-success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {product.hasVariants ? (
              <Badge variant="outline">Has variants</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">{product.slug}</p>
        </div>
        <div className="text-sm sm:text-right">
          <p className="text-2xl font-semibold">
            {formatPrice(product.basePrice)}
          </p>
          <p className="text-muted-foreground">
            Updated {formatDate(product.updatedAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>
              {images.length} image{images.length === 1 ? "" : "s"}. Linked
              images use `variantValue` (e.g. Color: Blue); others are product
              images.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-muted aspect-[4/5] overflow-hidden rounded-lg border">
              {activeImage?.media.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage.media.url}
                  alt={activeImage.altText ?? product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                  No image available
                </div>
              )}
            </div>
            {activeImage ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeImage.isPrimary ? (
                  <Badge className="bg-success/10 text-success">Primary</Badge>
                ) : null}
                {activeImage.variantValue ? (
                  <Badge variant="outline">
                    {activeImage.variantValue.variantType.name}:{" "}
                    {activeImage.variantValue.value}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Product image</Badge>
                )}
              </div>
            ) : null}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => {
                  const isSelected =
                    (selectedImageId ?? activeImage?.id) === image.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      className={`overflow-hidden rounded-md border text-left ${
                        isSelected ? "ring-ring ring-2" : ""
                      }`}
                      onClick={() => setSelectedImageId(image.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.media.url}
                        alt={image.altText ?? product.name}
                        className="aspect-square size-full object-cover"
                      />
                      <div className="p-2">
                        {image.variantValue ? (
                          <p className="truncate text-xs font-medium">
                            {image.variantValue.variantType.name}:{" "}
                            {image.variantValue.value}
                          </p>
                        ) : (
                          <p className="text-muted-foreground truncate text-xs">
                            Product image
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {(product.productCategories ?? []).map((link) => (
                  <Badge key={link.category.id} variant="secondary">
                    {link.category.categoryName}
                    {link.isPrimary ? " · Primary" : ""}
                  </Badge>
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Product ID</dt>
                  <dd className="font-medium">{product.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {formatDate(product.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reviews</dt>
                  <dd className="font-medium">
                    {(product.reviews?.averageRating ?? 0).toFixed(1)} /{" "}
                    {product.reviews?.totalReviews ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Variants</dt>
                  <dd className="font-medium">
                    {(product.variants ?? []).length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variant options</CardTitle>
              <CardDescription>
                Available option types and values for this product
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {(product.variantOptions ?? []).length ? (
                (product.variantOptions ?? []).map((option) => (
                  <div key={option.id} className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <Badge key={value.id} variant="outline">
                          {value.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No variant options.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SKU variants</CardTitle>
          <CardDescription>
            Inventory and pricing for each combination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Combination</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(product.variants ?? []).length ? (
                  (product.variants ?? []).map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">
                        {variant.sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {variant.values.map((value) => (
                            <Badge key={value.id} variant="outline">
                              {value.variantType.name}: {value.value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(variant.price)}</TableCell>
                      <TableCell>{variant.stock}</TableCell>
                      <TableCell>
                        {variant.isActive ? (
                          <Badge className="bg-success/10 text-success">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground h-20 text-center"
                    >
                      No variants for this product.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
