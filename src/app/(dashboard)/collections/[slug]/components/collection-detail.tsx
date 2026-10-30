"use client";

import Link from "next/link";

import { useCollectionQuery } from "@/features/collections/hooks/use-collections";
import {
  formatCollectionDate,
  formatCollectionPrice,
} from "@/features/collections/utils";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CollectionDetail({ slug }: { slug: string }) {
  const { data, isLoading, isError, error, refetch } = useCollectionQuery(slug);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading collection...</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {getApiErrorMessage(error, "Failed to load collection.")}
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
            nativeButton={false}
            render={<Link href="/collections" />}
            size="sm"
            variant="ghost"
            className="cursor-pointer"
          >
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  const products = [...data.products].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          <Link
            href="/collections"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Collections
          </Link>
          <span className="mx-1.5">/</span>
          <span>{data.name}</span>
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {data.name}
              </h1>
              <Badge variant={data.isActive ? "secondary" : "outline"}>
                {data.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm">
              {data.description}
            </p>
            <p className="text-muted-foreground text-xs">
              /{data.slug} · created {formatCollectionDate(data.createdAt)}
            </p>
          </div>
          {data.media?.url ? (
            <div className="bg-muted size-28 shrink-0 overflow-hidden rounded-xl border sm:size-36">
              <img
                src={data.media.url}
                alt={data.name}
                className="size-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            Products ({products.length})
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pos</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length ? (
              products.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="tabular-nums">
                    {item.position}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="hover:underline"
                    >
                      <span className="font-medium">{item.product.name}</span>
                      <span className="text-muted-foreground block text-xs">
                        /{item.product.slug}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCollectionPrice(item.product.basePrice)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.product.productStatus ? "secondary" : "outline"
                      }
                    >
                      {item.product.productStatus ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-16 text-center"
                >
                  No products in this collection.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
