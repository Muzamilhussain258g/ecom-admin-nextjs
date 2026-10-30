"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { useCreateCollectionMutation } from "@/features/collections/hooks/use-collections";
import {
  createCollectionFormSchema,
  type CreateCollectionFormValues,
} from "@/features/collections/collection.schema";
import type { CreateCollectionPayload } from "@/features/collections/types";
import { formatCollectionPrice } from "@/features/collections/utils";
import { uploadProductImage } from "@/features/media/upload-to-cloudinary";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function CreateCollectionForm() {
  const router = useRouter();
  const createMutation = useCreateCollectionMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useProductsQuery({
    page: 1,
    limit: 100,
  });

  const products = productsData?.products ?? [];

  const form = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(
      createCollectionFormSchema
    ) as Resolver<CreateCollectionFormValues>,
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      productIds: [],
      coverImage: null,
    },
  });

  const productIds = form.watch("productIds");
  const coverImage = form.watch("coverImage");

  const selectedProducts = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return productIds
      .map((id) => byId.get(id))
      .filter((product): product is (typeof products)[number] => Boolean(product));
  }, [productIds, products]);

  const toggleProduct = (productId: number, checked: boolean) => {
    const current = form.getValues("productIds");
    if (checked) {
      if (current.includes(productId)) return;
      form.setValue("productIds", [...current, productId], {
        shouldValidate: true,
      });
      return;
    }
    form.setValue(
      "productIds",
      current.filter((id) => id !== productId),
      { shouldValidate: true }
    );
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const next = [...form.getValues("productIds")];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    form.setValue("productIds", next, { shouldValidate: true });
  };

  const handleCoverSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadProductImage(file, "collection");
      if (!uploaded.signature) {
        throw new Error(
          "Cloudinary response did not include a signature for the cover."
        );
      }

      form.setValue(
        "coverImage",
        {
          providerPublicId: uploaded.public_id,
          version: uploaded.version,
          signature: uploaded.signature,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
          altText: form.getValues("name") || file.name,
          previewUrl: uploaded.secure_url || uploaded.url,
        },
        { shouldValidate: true }
      );
    } catch (err) {
      toast.add({
        type: "error",
        title: "Cover upload failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload: CreateCollectionPayload = {
        name: values.name.trim(),
        description: values.description.trim(),
        isActive: values.isActive,
        products: values.productIds.map((productId, position) => ({
          productId,
          position,
        })),
      };

      if (values.coverImage) {
        payload.coverImage = {
          providerPublicId: values.coverImage.providerPublicId,
          version: values.coverImage.version,
          signature: values.coverImage.signature,
          format: values.coverImage.format,
          bytes: values.coverImage.bytes,
          width: values.coverImage.width,
          height: values.coverImage.height,
          altText: values.coverImage.altText || values.name.trim(),
        };
      }

      const collection = await createMutation.mutateAsync(payload);
      toast.add({
        type: "success",
        title: "Collection created",
        description: `${collection.name} was created.`,
      });
      router.push(`/collections/${collection.slug}`);
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        title: "Create failed",
        description: getApiErrorMessage(err),
      });
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          <Link
            href="/collections"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Collections
          </Link>
          <span className="mx-1.5">/</span>
          <span>Create</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create collection
        </h1>
        <p className="text-muted-foreground text-sm">
          Name the collection, optionally add a cover, and rank products.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-card flex flex-col gap-6 rounded-xl border p-4 sm:p-6"
        noValidate
      >
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="collection-name">Name</FieldLabel>
          <Input
            id="collection-name"
            placeholder="Summer Fitness Essentials 2026"
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="collection-description">Description</FieldLabel>
          <Textarea
            id="collection-description"
            rows={4}
            placeholder="Featured performance gear for warm weather training."
            {...form.register("description")}
          />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <Field orientation="horizontal" className="items-center justify-between">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="collection-active">Active</FieldLabel>
            <p className="text-muted-foreground text-xs">
              Inactive collections stay hidden from the public list.
            </p>
          </div>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Switch
                id="collection-active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel>Cover image</FieldLabel>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="bg-muted size-28 shrink-0 overflow-hidden rounded-xl border">
              {coverImage?.previewUrl ? (
                <img
                  src={coverImage.previewUrl}
                  alt={coverImage.altText ?? "Collection cover"}
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 text-xs">
                  <ImagePlus className="size-5 opacity-60" />
                  Optional
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleCoverSelected(event)}
              />
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Upload data-icon="inline-start" />
                )}
                {isUploading ? "Uploading..." : "Upload cover"}
              </Button>
              {coverImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() =>
                    form.setValue("coverImage", null, { shouldValidate: true })
                  }
                >
                  <Trash2 data-icon="inline-start" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </Field>

        <Field data-invalid={!!form.formState.errors.productIds}>
          <FieldLabel>Products</FieldLabel>
          <p className="text-muted-foreground mb-2 text-xs">
            Selection order becomes product position in the collection.
          </p>

          {selectedProducts.length ? (
            <ul className="mb-3 flex flex-col gap-2 rounded-xl border p-2">
              {selectedProducts.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                >
                  <span className="text-muted-foreground w-6 text-xs tabular-nums">
                    {index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {formatCollectionPrice(product.basePrice)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="cursor-pointer"
                    disabled={index === 0}
                    onClick={() => moveProduct(index, -1)}
                  >
                    <ArrowUp />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="cursor-pointer"
                    disabled={index === selectedProducts.length - 1}
                    onClick={() => moveProduct(index, 1)}
                  >
                    <ArrowDown />
                    <span className="sr-only">Move down</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {productsLoading ? (
            <p className="text-muted-foreground text-sm">Loading products...</p>
          ) : products.length ? (
            <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
              {products.map((product) => {
                const checked = productIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleProduct(product.id, value === true)
                      }
                      aria-label={`Select ${product.name}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        /{product.slug} ·{" "}
                        {formatCollectionPrice(product.basePrice)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No products available. Create products first.
            </p>
          )}
          <FieldError errors={[form.formState.errors.productIds]} />
        </Field>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/collections")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={createMutation.isPending || isUploading}
          >
            {createMutation.isPending ? "Creating..." : "Create collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
