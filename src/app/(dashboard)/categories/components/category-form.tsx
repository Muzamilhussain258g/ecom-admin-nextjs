"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  defaultCategoriesParams,
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/hooks/use-categories";
import {
  categoryFormSchema,
  subCategoryFormSchema,
  type CategoryFormValues,
  type SubCategoryFormValues,
} from "@/features/categories/category.schema";
import type { CategoryNode } from "@/features/categories/types";
import {
  collectSelfAndDescendantIds,
  findCategoryById,
  flattenCategoriesForPicker,
} from "@/features/categories/utils";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ParentCategoryPicker } from "./parent-category-picker";

type CategoryFormMode = "create" | "create-sub" | "edit";

type CategoryFormProps = {
  mode: CategoryFormMode;
  category?: CategoryNode | null;
  defaultParentId?: number | null;
};

export function CategoryForm({
  mode,
  category = null,
  defaultParentId = null,
}: CategoryFormProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useCategoriesQuery(
    defaultCategoriesParams
  );
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const categories = data?.categories ?? [];
  const isSubCreate = mode === "create-sub";
  const isEdit = mode === "edit";

  const form = useForm<CategoryFormValues | SubCategoryFormValues>({
    resolver: zodResolver(
      isSubCreate ? subCategoryFormSchema : categoryFormSchema
    ) as Resolver<CategoryFormValues | SubCategoryFormValues>,
    defaultValues: {
      categoryName: category?.categoryName ?? "",
      parentId: isSubCreate
        ? (defaultParentId ?? undefined)
        : (category?.parentId ?? defaultParentId ?? null),
    },
  });

  useEffect(() => {
    form.reset({
      categoryName: category?.categoryName ?? "",
      parentId: isSubCreate
        ? (defaultParentId ?? undefined)
        : (category?.parentId ?? defaultParentId ?? null),
    });
  }, [category, defaultParentId, form, isSubCreate]);

  const pickerItems = useMemo(
    () => flattenCategoriesForPicker(categories),
    [categories]
  );

  const disabledIds = useMemo(() => {
    if (!isEdit || !category) return undefined;
    const current =
      findCategoryById(categories, category.id) ?? category;
    return collectSelfAndDescendantIds(current);
  }, [categories, category, isEdit]);

  const title =
    mode === "create"
      ? "Create category"
      : mode === "create-sub"
        ? "Create subcategory"
        : "Edit category";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const categoryName = values.categoryName.trim();
      const parentId =
        mode === "create"
          ? null
          : ((values.parentId as number | null | undefined) ?? null);

      if (isSubCreate && parentId == null) {
        form.setError("parentId", {
          message: "Select a parent category",
        });
        return;
      }

      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: { categoryName, parentId },
        });
        toast.add({
          type: "success",
          title: "Category updated",
          description: `${categoryName} was updated.`,
        });
      } else {
        await createMutation.mutateAsync({ categoryName, parentId });
        toast.add({
          type: "success",
          title: isSubCreate ? "Subcategory created" : "Category created",
          description: `${categoryName} was created.`,
        });
      }

      router.push("/categories");
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description: getApiErrorMessage(err),
      });
    }
  });

  const pending = createMutation.isPending || updateMutation.isPending;

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          <Link href="/categories" className="hover:text-foreground underline-offset-4 hover:underline">
            Categories
          </Link>
          <span className="mx-1.5">/</span>
          <span>{isEdit ? "Edit" : "Create"}</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">
          {mode === "create"
            ? "Add a top-level category for organizing products."
            : mode === "create-sub"
              ? "Choose a parent, then name the subcategory."
              : "Update the category name or move it under another parent."}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-card flex flex-col gap-5 rounded-xl border p-4 sm:p-6"
        noValidate
      >
        <Field data-invalid={!!form.formState.errors.categoryName}>
          <FieldLabel htmlFor="category-name">Name</FieldLabel>
          <Input
            id="category-name"
            placeholder={
              isSubCreate ? "Drop Earrings" : "Electronics"
            }
            {...form.register("categoryName")}
          />
          <FieldError errors={[form.formState.errors.categoryName]} />
        </Field>

        {mode !== "create" ? (
          <Controller
            control={form.control}
            name="parentId"
            render={({ field, fieldState }) => (
              <ParentCategoryPicker
                items={pickerItems}
                value={
                  typeof field.value === "number" ? field.value : null
                }
                onChange={field.onChange}
                allowNone={isEdit}
                error={fieldState.error}
                disabledIds={disabledIds}
              />
            )}
          />
        ) : null}

        {isSubCreate && pickerItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Create a top-level category first before adding subcategories.
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/categories")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={pending || (isSubCreate && pickerItems.length === 0)}
          >
            {pending
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : isSubCreate
                  ? "Create subcategory"
                  : "Create category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
