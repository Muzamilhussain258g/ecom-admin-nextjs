"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVariantValueMutation,
  useUpdateVariantValueMutation,
} from "@/features/variant-types/hooks/use-variant-types";
import {
  variantValueFormSchema,
  type VariantValueFormValues,
} from "@/features/variant-types/variant-types.schema";
import type {
  VariantType,
  VariantTypeValue,
} from "@/features/variant-types/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type VariantValueFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantType: VariantType | null;
  variantValue?: VariantTypeValue | null;
};

export function VariantValueFormDialog({
  open,
  onOpenChange,
  variantType,
  variantValue,
}: VariantValueFormDialogProps) {
  const isEdit = Boolean(variantValue);
  const createMutation = useCreateVariantValueMutation();
  const updateMutation = useUpdateVariantValueMutation();

  const form = useForm<VariantValueFormValues>({
    resolver: zodResolver(
      variantValueFormSchema
    ) as Resolver<VariantValueFormValues>,
    defaultValues: { value: "", code: "", sortOrder: 0 },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      variantValue
        ? {
            value: variantValue.value,
            code: variantValue.code,
            sortOrder: variantValue.sortOrder,
          }
        : { value: "", code: "", sortOrder: 0 }
    );
  }, [form, open, variantValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!variantType) return;

    try {
      if (isEdit && variantValue) {
        await updateMutation.mutateAsync({
          valueId: variantValue.id,
          payload: values,
        });
        toast.add({
          type: "success",
          title: "Value updated",
          description: `${values.value} was updated.`,
        });
      } else {
        await createMutation.mutateAsync({
          variantTypeId: variantType.id,
          payload: values,
        });
        toast.add({
          type: "success",
          title: "Value added",
          description: `${values.value} was added to ${variantType.name}.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast.add({
        type: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description: getApiErrorMessage(error),
      });
    }
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? `Edit ${variantType?.name ?? "value"}`
              : `Add value to ${variantType?.name ?? "type"}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "PATCH /variant-values/:id"
              : "POST /variant-types/:id/values — code must be uppercase alphanumeric with hyphens."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field data-invalid={!!form.formState.errors.value}>
            <FieldLabel htmlFor="variant-value-name">Value</FieldLabel>
            <Input
              id="variant-value-name"
              placeholder="Midnight Black"
              {...form.register("value")}
            />
            <FieldError errors={[form.formState.errors.value]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="variant-value-code">Code</FieldLabel>
            <Input
              id="variant-value-code"
              placeholder="MIDNIGHT-BLACK"
              {...form.register("code")}
            />
            <FieldError errors={[form.formState.errors.code]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.sortOrder}>
            <FieldLabel htmlFor="variant-value-sort">Sort order</FieldLabel>
            <Input
              id="variant-value-sort"
              type="number"
              min="0"
              {...form.register("sortOrder")}
            />
            <FieldError errors={[form.formState.errors.sortOrder]} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add value"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
