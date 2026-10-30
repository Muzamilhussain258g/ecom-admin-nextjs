"use client";

import { useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormSetValue,
} from "react-hook-form";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { uploadProductImage } from "@/features/media/upload-to-cloudinary";
import type { CreateProductWithVariantsFormValues } from "@/features/products/product.schema";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

const MAX_MEDIA = 10;

type VariantValueOption = {
  id: number;
  label: string;
};

type ProductMediaFieldsProps = {
  control: Control<CreateProductWithVariantsFormValues>;
  errors: FieldErrors<CreateProductWithVariantsFormValues>;
  fields: FieldArrayWithId<
    CreateProductWithVariantsFormValues,
    "media",
    "id"
  >[];
  media: CreateProductWithVariantsFormValues["media"];
  selectedValueOptions: VariantValueOption[];
  append: UseFieldArrayAppend<CreateProductWithVariantsFormValues, "media">;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<CreateProductWithVariantsFormValues>;
  register: ReturnType<
    typeof import("react-hook-form").useForm<CreateProductWithVariantsFormValues>
  >["register"];
};

export function ProductMediaFields({
  control,
  errors,
  fields,
  media,
  selectedValueOptions,
  append,
  remove,
  setValue,
  register,
}: ProductMediaFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setPrimaryMedia = (index: number) => {
    const next = media.map((item, itemIndex) => ({
      ...item,
      isPrimary: itemIndex === index,
      position: itemIndex,
    }));
    setValue("media", next, { shouldValidate: true });
  };

  const renumberMedia = (
    next: CreateProductWithVariantsFormValues["media"]
  ) => {
    const normalized = next.map((item, index) => ({
      ...item,
      position: index,
    }));
    if (normalized.length > 0 && !normalized.some((item) => item.isPrimary)) {
      normalized[0] = { ...normalized[0], isPrimary: true };
    }
    setValue("media", normalized, { shouldValidate: true });
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = MAX_MEDIA - media.length;
    if (remaining <= 0) {
      toast.add({
        type: "error",
        title: "Image limit reached",
        description: "You can attach up to 10 images per product.",
      });
      return;
    }

    const selected = files.slice(0, remaining);
    const seenPublicIds = new Set(
      media.map((item) => item.providerPublicId).filter(Boolean)
    );
    let nextIndex = media.length;
    setIsUploading(true);

    try {
      for (const file of selected) {
        const uploaded = await uploadProductImage(file, "product");
        if (seenPublicIds.has(uploaded.public_id)) {
          toast.add({
            type: "error",
            title: "Duplicate image",
            description: `${uploaded.public_id} is already attached.`,
          });
          continue;
        }

        seenPublicIds.add(uploaded.public_id);
        append({
          providerPublicId: uploaded.public_id,
          previewUrl: uploaded.secure_url || uploaded.url,
          isPrimary: nextIndex === 0,
          position: nextIndex,
          altText: file.name.replace(/\.[^.]+$/, ""),
        });
        nextIndex += 1;
      }
    } catch (error) {
      toast.add({
        type: "error",
        title: "Upload failed",
        description: getApiErrorMessage(
          error,
          "Unable to upload image to Cloudinary."
        ),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Upload images to Cloudinary, then attach them on create. Max{" "}
            {MAX_MEDIA}.
          </CardDescription>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleFilesSelected(event)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={isUploading || media.length >= MAX_MEDIA}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Upload data-icon="inline-start" />
            )}
            {isUploading ? "Uploading..." : "Upload images"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {fields.length === 0 ? (
          <button
            type="button"
            className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/30 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-8 opacity-60" />
            <span>Upload product images to Cloudinary</span>
            <Badge variant="outline">client → Cloudinary → attach on create</Badge>
          </button>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[7rem_1fr_auto]"
            >
              <div className="bg-muted aspect-square overflow-hidden rounded-md border">
                {media[index]?.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media[index]?.previewUrl}
                    alt={media[index]?.altText || media[index]?.providerPublicId}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                    No preview
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field data-invalid={!!errors.media?.[index]?.altText}>
                  <FieldLabel htmlFor={`media-${index}-alt`}>Alt text</FieldLabel>
                  <Input
                    id={`media-${index}-alt`}
                    {...register(`media.${index}.altText`)}
                  />
                  <FieldError errors={[errors.media?.[index]?.altText]} />
                </Field>
                <Field>
                  <FieldLabel>Variant value</FieldLabel>
                  <Controller
                    control={control}
                    name={`media.${index}.variantValueId`}
                    render={({ field: selectField }) => (
                      <Select
                        value={
                          selectField.value
                            ? String(selectField.value)
                            : "none"
                        }
                        onValueChange={(value) =>
                          selectField.onChange(
                            value === "none" ? undefined : Number(value)
                          )
                        }
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="none">None</SelectItem>
                            {selectedValueOptions.map((option) => (
                              <SelectItem
                                key={option.id}
                                value={String(option.id)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              <div className="flex items-start gap-2 md:flex-col">
                <Button
                  type="button"
                  size="sm"
                  variant={media[index]?.isPrimary ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setPrimaryMedia(index)}
                >
                  {media[index]?.isPrimary ? "Primary" : "Set primary"}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => {
                    remove(index);
                    const next = media.filter((_, itemIndex) => itemIndex !== index);
                    renumberMedia(next);
                  }}
                >
                  <Trash2 />
                  <span className="sr-only">Remove media</span>
                </Button>
              </div>
            </div>
          ))
        )}
        <FieldError errors={[errors.media]} />
        {isUploading ? (
          <p className="text-muted-foreground text-sm">
            Getting signed upload, then sending image to Cloudinary...
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
