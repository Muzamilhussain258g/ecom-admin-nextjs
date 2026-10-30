"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVariantTypeMutation,
  useUpdateVariantTypeMutation,
} from "@/features/variant-types/hooks/use-variant-types";
import {
  variantTypeFormSchema,
  type VariantTypeFormValues,
} from "@/features/variant-types/variant-types.schema";
import type { VariantType } from "@/features/variant-types/types";
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

type VariantTypeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantType?: VariantType | null;
};

export function VariantTypeFormDialog({
  open,
  onOpenChange,
  variantType,
}: VariantTypeFormDialogProps) {
  const isEdit = Boolean(variantType);
  const createMutation = useCreateVariantTypeMutation();
  const updateMutation = useUpdateVariantTypeMutation();

  const form = useForm<VariantTypeFormValues>({
    resolver: zodResolver(
      variantTypeFormSchema
    ) as Resolver<VariantTypeFormValues>,
    defaultValues: { name: "", sortOrder: 0 },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      variantType
        ? { name: variantType.name, sortOrder: variantType.sortOrder }
        : { name: "", sortOrder: 0 }
    );
  }, [form, open, variantType]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit && variantType) {
        await updateMutation.mutateAsync({
          id: variantType.id,
          payload: values,
        });
        toast.add({
          type: "success",
          title: "Variant type updated",
          description: `${values.name} was updated.`,
        });
      } else {
        await createMutation.mutateAsync(values);
        toast.add({
          type: "success",
          title: "Variant type created",
          description: `${values.name} was created.`,
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
            {isEdit ? "Edit variant type" : "Create variant type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the type name or sort order."
              : "POST /variant-types — admin/seller only."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="variant-type-name">Name</FieldLabel>
            <Input
              id="variant-type-name"
              placeholder="Color"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.sortOrder}>
            <FieldLabel htmlFor="variant-type-sort">Sort order</FieldLabel>
            <Input
              id="variant-type-sort"
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
