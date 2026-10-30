import { z } from "zod";

const numberFromInput = (message: string) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number({ error: message }));

export const variantTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sortOrder: numberFromInput("Sort order is required").pipe(
    z.number().int().min(0, "Sort order must be 0 or greater")
  ),
});

export const variantValueFormSchema = z.object({
  value: z.string().min(1, "Value is required").max(100),
  code: z
    .string()
    .min(1, "Code is required")
    .regex(
      /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
      "Use uppercase letters, numbers, and hyphens (e.g. MIDNIGHT-BLACK)"
    ),
  sortOrder: numberFromInput("Sort order is required").pipe(
    z.number().int().min(0, "Sort order must be 0 or greater")
  ),
});

export type VariantTypeFormValues = z.infer<typeof variantTypeFormSchema>;
export type VariantValueFormValues = z.infer<typeof variantValueFormSchema>;
