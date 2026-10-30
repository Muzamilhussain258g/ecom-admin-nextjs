import { z } from "zod";

export const collectionCoverImageSchema = z.object({
  providerPublicId: z.string().min(1),
  version: z.number().int().positive(),
  signature: z.string().min(1),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  altText: z.string().max(200).optional(),
  previewUrl: z.string().url().optional(),
});

export const createCollectionFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  description: z.string().min(1, "Description is required").max(2000),
  isActive: z.boolean(),
  productIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one product"),
  coverImage: collectionCoverImageSchema.nullable(),
});

export type CreateCollectionFormValues = z.infer<
  typeof createCollectionFormSchema
>;
