"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import { useCategoriesQuery } from "@/features/categories/hooks/use-categories";
import { flattenCategories } from "@/features/categories/utils";
import { useVariantTypesQuery } from "@/features/variant-types/hooks/use-variant-types";
import { useCreateProductWithVariantsMutation } from "@/features/products/hooks/use-products";
import {
  createProductWithVariantsSchema,
  type CreateProductWithVariantsFormValues,
} from "@/features/products/product.schema";
import type { CreateProductWithVariantsPayload } from "@/features/products/types";
import {
  buildVariantQuantities,
  buildVariantSelections,
  describeVariantCombination,
} from "@/features/products/variant-matrix";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ProductMediaFields } from "./product-media-fields";

const defaultValues: CreateProductWithVariantsFormValues = {
  name: "",
  description: "",
  basePrice: 0,
  hasVariants: true,
  categories: [],
  media: [],
  variantSelections: [],
  variantQuantities: [],
};

export function CreateProductForm() {
  const router = useRouter();
  const categoriesQuery = useCategoriesQuery();
  const variantTypesQuery = useVariantTypesQuery();
  const createMutation = useCreateProductWithVariantsMutation();

  const form = useForm<CreateProductWithVariantsFormValues>({
    resolver: zodResolver(
      createProductWithVariantsSchema
    ) as Resolver<CreateProductWithVariantsFormValues>,
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const mediaArray = useFieldArray({ control, name: "media" });
  const categories = watch("categories");
  const variantSelections = watch("variantSelections");
  const variantQuantities = watch("variantQuantities");
  const media = watch("media");

  const categoryOptions = useMemo(
    () => flattenCategories(categoriesQuery.data?.categories ?? []),
    [categoriesQuery.data?.categories]
  );

  const variantTypes = useMemo(
    () =>
      [...(variantTypesQuery.data ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
    [variantTypesQuery.data]
  );

  const selectedByType = useMemo(() => {
    const map: Record<number, number[]> = {};
    for (const selection of variantSelections) {
      map[selection.variantTypeId] = selection.variantValueIds;
    }
    return map;
  }, [variantSelections]);

  const selectedValueOptions = useMemo(() => {
    const options: Array<{ id: number; label: string }> = [];
    for (const type of variantTypes) {
      const selectedIds = new Set(selectedByType[type.id] ?? []);
      for (const value of type.values) {
        if (selectedIds.has(value.id)) {
          options.push({
            id: value.id,
            label: `${type.name}: ${value.value}`,
          });
        }
      }
    }
    return options;
  }, [selectedByType, variantTypes]);

  useEffect(() => {
    const previous = form.getValues("variantQuantities");
    const nextQuantities = buildVariantQuantities(
      variantTypes,
      selectedByType,
      previous
    );

    const currentKey = previous
      .map((item) => item.variantValueIds.join("-"))
      .join("|");
    const nextKey = nextQuantities
      .map((item) => item.variantValueIds.join("-"))
      .join("|");

    if (currentKey !== nextKey) {
      setValue("variantQuantities", nextQuantities, { shouldValidate: true });
    }
  }, [form, selectedByType, setValue, variantTypes]);

  const toggleCategory = (categoryId: number, checked: boolean) => {
    const current = form.getValues("categories");
    if (checked) {
      const next = [
        ...current,
        {
          categoryId,
          isPrimary: current.length === 0,
        },
      ];
      setValue("categories", next, { shouldValidate: true });
      return;
    }

    const next = current.filter((item) => item.categoryId !== categoryId);
    if (next.length > 0 && !next.some((item) => item.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    setValue("categories", next, { shouldValidate: true });
  };

  const setPrimaryCategory = (categoryId: number) => {
    const next = form.getValues("categories").map((item) => ({
      ...item,
      isPrimary: item.categoryId === categoryId,
    }));
    setValue("categories", next, { shouldValidate: true });
  };

  const toggleVariantValue = (
    variantTypeId: number,
    variantValueId: number,
    checked: boolean
  ) => {
    const current = { ...selectedByType };
    const existing = new Set(current[variantTypeId] ?? []);
    if (checked) existing.add(variantValueId);
    else existing.delete(variantValueId);

    if (existing.size === 0) delete current[variantTypeId];
    else current[variantTypeId] = [...existing];

    setValue("variantSelections", buildVariantSelections(current), {
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateProductWithVariantsPayload = {
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        hasVariants: true,
        categories: values.categories,
        variantSelections: values.variantSelections,
        variantQuantities: values.variantQuantities,
        media: values.media.map((item, index) => ({
          providerPublicId: item.providerPublicId,
          isPrimary: item.isPrimary,
          position: index,
          ...(item.altText?.trim()
            ? { altText: item.altText.trim() }
            : {}),
          ...(item.variantValueId
            ? { variantValueId: item.variantValueId }
            : {}),
        })),
      };

      const product = await createMutation.mutateAsync(payload);
      toast.add({
        type: "success",
        title: "Product created",
        description: `${product.name} was created successfully.`,
      });
      router.push(`/products/${product.slug}`);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Create failed",
        description: getApiErrorMessage(error, "Unable to create product."),
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit cursor-pointer px-0"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to products
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create product with variants
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure categories, variant matrix, stock, and media, then
              submit to `POST /products`.
            </p>
          </div>
        </div>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={isSubmitting || createMutation.isPending}
        >
          {isSubmitting || createMutation.isPending
            ? "Creating..."
            : "Create product"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Core product details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            className="md:col-span-2"
            data-invalid={!!errors.name}
          >
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field
            className="md:col-span-2"
            data-invalid={!!errors.description}
          >
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={4}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            <FieldError errors={[errors.description]} />
          </Field>
          <Field data-invalid={!!errors.basePrice}>
            <FieldLabel htmlFor="basePrice">Base price</FieldLabel>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              {...register("basePrice")}
              aria-invalid={!!errors.basePrice}
            />
            <FieldError errors={[errors.basePrice]} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Select one or more categories and mark a primary category
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {categoriesQuery.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading categories...</p>
          ) : categoriesQuery.isError ? (
            <p className="text-destructive text-sm">
              {getApiErrorMessage(
                categoriesQuery.error,
                "Failed to load categories."
              )}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categoryOptions.map((option) => {
                const selected = categories.find(
                  (item) => item.categoryId === option.id
                );
                return (
                  <div
                    key={option.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={Boolean(selected)}
                      onCheckedChange={(checked) =>
                        toggleCategory(option.id, checked === true)
                      }
                      aria-label={`Select ${option.label}`}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-sm font-medium">{option.label}</span>
                      {selected ? (
                        <Button
                          type="button"
                          size="xs"
                          variant={selected.isPrimary ? "default" : "outline"}
                          className="w-fit cursor-pointer"
                          onClick={() => setPrimaryCategory(option.id)}
                        >
                          {selected.isPrimary ? "Primary" : "Set primary"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <FieldError errors={[errors.categories]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variant options</CardTitle>
          <CardDescription>
            Choose variant types and values to build the SKU matrix
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {variantTypesQuery.isLoading ? (
            <p className="text-muted-foreground text-sm">
              Loading variant types...
            </p>
          ) : variantTypesQuery.isError ? (
            <p className="text-destructive text-sm">
              {getApiErrorMessage(
                variantTypesQuery.error,
                "Failed to load variant types."
              )}
            </p>
          ) : (
            variantTypes.map((type) => (
              <div key={type.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <p className="font-medium">{type.name}</p>
                  <Badge variant="outline">{type.slug}</Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  {type.values
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((value) => {
                      const checked = (selectedByType[type.id] ?? []).includes(
                        value.id
                      );
                      return (
                        <label
                          key={value.id}
                          className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) =>
                              toggleVariantValue(
                                type.id,
                                value.id,
                                next === true
                              )
                            }
                          />
                          <span>
                            {value.value}{" "}
                            <span className="text-muted-foreground">
                              ({value.code})
                            </span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            ))
          )}
          <FieldError errors={[errors.variantSelections]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variant quantities</CardTitle>
          <CardDescription>
            Stock for each generated combination ({variantQuantities.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Combination</TableHead>
                  <TableHead className="w-40">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantQuantities.length ? (
                  variantQuantities.map((item, index) => (
                    <TableRow key={item.variantValueIds.join("-")}>
                      <TableCell>
                        {describeVariantCombination(
                          variantTypes,
                          item.variantValueIds
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          {...register(
                            `variantQuantities.${index}.quantity` as const
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground h-20 text-center"
                    >
                      Select variant values to generate the quantity matrix.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <FieldError errors={[errors.variantQuantities]} />
        </CardContent>
      </Card>

      <ProductMediaFields
        control={control}
        errors={errors}
        fields={mediaArray.fields}
        media={media}
        selectedValueOptions={selectedValueOptions}
        append={mediaArray.append}
        remove={mediaArray.remove}
        setValue={setValue}
        register={register}
      />

      <div className="flex justify-end gap-2 pb-8">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={isSubmitting || createMutation.isPending}
        >
          {isSubmitting || createMutation.isPending
            ? "Creating..."
            : "Create product"}
        </Button>
      </div>
    </form>
  );
}
