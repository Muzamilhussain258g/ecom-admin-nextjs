"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";

import {
  defaultCategoriesParams,
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/features/categories/hooks/use-categories";
import type { CategoryNode } from "@/features/categories/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CategoryThumb } from "./category-thumb";

function SubCategoryRow({
  category,
  onDelete,
}: {
  category: CategoryNode;
  onDelete: (category: CategoryNode) => void;
}) {
  const [open, setOpen] = useState(false);
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const productCount = category._count?.productCategories ?? 0;

  return (
    <li className="flex flex-col gap-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg",
          hasChildren && "bg-background/60 ring-border/60 -mx-2 px-2 py-1.5 ring-1"
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
              open
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            )}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
            <span className="sr-only">Toggle {category.categoryName}</span>
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}

        <CategoryThumb category={category} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {category.categoryName}
            </p>
            {hasChildren ? (
              <Badge variant="secondary" className="shrink-0 font-normal">
                {children.length} sub
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground truncate text-xs">
            /{category.slug}
            {productCount > 0
              ? ` · ${productCount} product${productCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            nativeButton={false}
            render={<Link href={`/categories/sub-categories/new?parentId=${category.id}`} />}
            size="icon-sm"
            variant="outline"
            className="cursor-pointer rounded-full"
          >
            <Plus />
            <span className="sr-only">Add subcategory</span>
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/categories/${category.id}/edit`} />}
            size="icon-sm"
            variant="outline"
            className="cursor-pointer rounded-full"
          >
            <Pencil />
            <span className="sr-only">Edit category</span>
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="text-destructive hover:text-destructive cursor-pointer rounded-full"
            onClick={() => onDelete(category)}
          >
            <Trash2 />
            <span className="sr-only">Delete category</span>
          </Button>
        </div>
      </div>

      {hasChildren && open ? (
        <SubCategoriesPanel categories={children} onDelete={onDelete} parentId={category.id} />
      ) : null}
    </li>
  );
}

function SubCategoriesPanel({
  categories,
  onDelete,
  parentId,
}: {
  categories: CategoryNode[];
  onDelete: (category: CategoryNode) => void;
  parentId: number;
}) {
  return (
    <div className="bg-muted/40 ml-8 rounded-xl px-4 py-4 sm:ml-12 sm:px-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
          Sub categories
        </p>
        <Button
          nativeButton={false}
          render={
            <Link href={`/categories/sub-categories/new?parentId=${parentId}`} />
          }
          size="xs"
          variant="ghost"
          className="cursor-pointer"
        >
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>

      {categories.length ? (
        <ul className="flex flex-col gap-4">
          {categories.map((child) => (
            <SubCategoryRow
              key={child.id}
              category={child}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          No subcategories yet.
        </p>
      )}
    </div>
  );
}

function TopCategoryRow({
  category,
  onDelete,
}: {
  category: CategoryNode;
  onDelete: (category: CategoryNode) => void;
}) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const [open, setOpen] = useState(false);
  const productCount = category._count?.productCategories ?? 0;

  return (
    <li className="flex flex-col gap-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl sm:gap-4",
          hasChildren && "bg-muted/35 ring-border/70 px-2 py-2 ring-1 sm:px-3"
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors",
              open
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            )}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
            <span className="sr-only">Toggle {category.categoryName}</span>
          </button>
        ) : (
          <span className="hidden size-8 shrink-0 sm:block" aria-hidden />
        )}

        <CategoryThumb category={category} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold tracking-tight">
              {category.categoryName}
            </p>
            {hasChildren ? (
              <Badge variant="secondary" className="shrink-0 font-normal">
                {children.length} subcategor
                {children.length === 1 ? "y" : "ies"}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground truncate text-sm">
            /{category.slug}
            {productCount > 0
              ? ` · ${productCount} product${productCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            nativeButton={false}
            render={<Link href={`/categories/${category.id}/edit`} />}
            size="sm"
            className="cursor-pointer"
          >
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onDelete(category)}
          >
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      {open ? (
        <SubCategoriesPanel
          categories={children}
          onDelete={onDelete}
          parentId={category.id}
        />
      ) : null}
    </li>
  );
}

export function CategoriesTree() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCategoriesQuery(defaultCategoriesParams);
  const deleteMutation = useDeleteCategoryMutation();

  const categories = data?.categories ?? [];
  const total = data?.meta.pagination.total ?? categories.length;

  const handleDelete = async (category: CategoryNode) => {
    const confirmed = window.confirm(
      `Delete "${category.categoryName}"? This fails if products are linked to it.`
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      toast.add({
        type: "success",
        title: "Category deleted",
        description: `${category.categoryName} was deleted.`,
      });
    } catch (err) {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getApiErrorMessage(err),
      });
    }
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading categories...</p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {getApiErrorMessage(error, "Failed to load categories.")}
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
          {total} top-level categor{total === 1 ? "y" : "ies"}
          {isFetching ? " · refreshing" : ""}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/categories/new" />}
            className="cursor-pointer"
          >
            <Plus data-icon="inline-start" />
            Add new category
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/categories/sub-categories/new" />}
            variant="outline"
            className="cursor-pointer"
          >
            <Plus data-icon="inline-start" />
            Add new subcategory
          </Button>
        </div>
      </div>

      {categories.length ? (
        <ul className="flex flex-col gap-8">
          {categories.map((category) => (
            <TopCategoryRow
              key={category.id}
              category={category}
              onDelete={(item) => void handleDelete(item)}
            />
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-16 text-center text-sm">
          No categories yet. Create one to start organizing products.
        </div>
      )}
    </div>
  );
}
