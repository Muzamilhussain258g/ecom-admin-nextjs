import { z } from "zod";

const numberFromInput = (message: string) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number({ error: message }));

export const createProductCategorySchema = z.object({
  categoryId: z.number().int().positive("Select a category"),
  isPrimary: z.boolean(),
});

export const createProductMediaSchema = z.object({
  providerPublicId: z.string().min(1, "Upload an image first"),
  isPrimary: z.boolean(),
  position: z.number().int().min(0),
  altText: z.string().optional(),
  previewUrl: z.string().optional(),
  variantValueId: z.number().int().positive().optional(),
});

export const createProductVariantSelectionSchema = z.object({
  variantTypeId: z.number().int().positive(),
  variantValueIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one value"),
});

export const createProductVariantQuantitySchema = z.object({
  variantValueIds: z.array(z.number().int().positive()).min(1),
  quantity: numberFromInput("Quantity is required").pipe(
    z.number().int().min(0, "Quantity must be 0 or greater")
  ),
});

export const createProductWithVariantsSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().min(1, "Description is required"),
    basePrice: numberFromInput("Base price is required").pipe(
      z.number().positive("Base price must be greater than 0")
    ),
    hasVariants: z.literal(true),
    categories: z
      .array(createProductCategorySchema)
      .min(1, "Select at least one category"),
    media: z
      .array(createProductMediaSchema)
      .min(1, "Upload at least one image")
      .max(10, "Maximum 10 images allowed"),
    variantSelections: z
      .array(createProductVariantSelectionSchema)
      .min(1, "Select at least one variant type"),
    variantQuantities: z
      .array(createProductVariantQuantitySchema)
      .min(1, "Generate at least one variant quantity"),
  })
  .superRefine((value, ctx) => {
    const primaryCategories = value.categories.filter(
      (category) => category.isPrimary
    );
    if (primaryCategories.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Exactly one category must be marked as primary",
      });
    }

    const primaryMedia = value.media.filter((item) => item.isPrimary);
    if (primaryMedia.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["media"],
        message: "Exactly one media item must be marked as primary",
      });
    }

    const publicIds = value.media.map((item) => item.providerPublicId);
    if (new Set(publicIds).size !== publicIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["media"],
        message: "Each image must have a unique providerPublicId",
      });
    }

    const positions = value.media.map((item) => item.position);
    if (new Set(positions).size !== positions.length) {
      ctx.addIssue({
        code: "custom",
        path: ["media"],
        message: "Each image must have a unique position",
      });
    }
  });

export type CreateProductWithVariantsFormValues = z.infer<
  typeof createProductWithVariantsSchema
>;
