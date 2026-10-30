import { z } from "zod";

export const categoryFormSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(120),
  parentId: z
    .union([z.number().int().positive(), z.null()])
    .optional()
    .nullable(),
});

export const subCategoryFormSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(120),
  parentId: z.number().int().positive("Select a parent category"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type SubCategoryFormValues = z.infer<typeof subCategoryFormSchema>;
