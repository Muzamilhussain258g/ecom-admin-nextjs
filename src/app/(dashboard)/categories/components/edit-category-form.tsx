"use client";

import { useCategoryQuery } from "@/features/categories/hooks/use-categories";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";

export function EditCategoryForm({ categoryId }: { categoryId: number }) {
  const { data, isLoading, isError, error, refetch } =
    useCategoryQuery(categoryId);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading category...</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {getApiErrorMessage(error, "Failed to load category.")}
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

  return <CategoryForm mode="edit" category={data} />;
}
