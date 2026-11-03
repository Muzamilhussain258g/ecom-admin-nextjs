"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { useCollectionsQuery } from "@/features/collections/hooks/use-collections";
import {
  formatCollectionDate,
  formatCollectionPrice,
} from "@/features/collections/utils";
import { ListPagination } from "@/components/list-pagination";
import { useListPagination } from "@/hooks/use-list-pagination";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CollectionsList() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCollectionsQuery();

  const collections = data ?? [];

  const pagination = useListPagination(collections);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading collections...</p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {getApiErrorMessage(error, "Failed to load collections.")}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {collections.length} collection
          {collections.length === 1 ? "" : "s"}
          {isFetching ? " · refreshing" : ""}
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/collections/new" />}
          className="cursor-pointer"
        >
          <Plus data-icon="inline-start" />
          Create collection
        </Button>
      </div>

      {!collections.length ? (
        <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-16 text-center text-sm">
          No collections yet. Create one to feature products together.
        </div>
      ) : (
        <div className="grid gap-4">
          {pagination.items.map((collection) => {
            const products = [...collection.products].sort(
              (a, b) => a.position - b.position
            );

            return (
              <Card key={collection.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-lg border">
                      {collection.media?.url ? (
                        <img
                          src={collection.media.url}
                          alt={collection.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                          No cover
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        <span className="truncate">{collection.name}</span>
                        <Badge
                          variant={
                            collection.isActive ? "secondary" : "outline"
                          }
                        >
                          {collection.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {collection.description}
                      </CardDescription>
                      <p className="text-muted-foreground text-xs">
                        /{collection.slug} · {products.length} product
                        {products.length === 1 ? "" : "s"} · updated{" "}
                        {formatCollectionDate(collection.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/collections/${collection.slug}`} />
                    }
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Eye data-icon="inline-start" />
                    View
                  </Button>
                </CardHeader>
                <CardContent>
                  {products.length ? (
                    <ul className="flex flex-col gap-2">
                      {products.slice(0, 4).map((item) => (
                        <li
                          key={item.id}
                          className="text-muted-foreground flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-foreground truncate font-medium">
                            {item.position + 1}. {item.product.name}
                          </span>
                          <span className="shrink-0 tabular-nums">
                            {formatCollectionPrice(item.product.basePrice)}
                          </span>
                        </li>
                      ))}
                      {products.length > 4 ? (
                        <li className="text-muted-foreground text-xs">
                          +{products.length - 4} more
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No products linked.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <ListPagination {...pagination} disabled={isFetching} />
    </div>
  );
}
