"use client";

import type { FlatCategoryPickerItem } from "@/features/categories/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CategoryThumb } from "./category-thumb";

type ParentCategoryPickerProps = {
  items: FlatCategoryPickerItem[];
  value: number | null;
  onChange: (value: number | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
  error?: { message?: string } | undefined;
  disabledIds?: Set<number>;
};

export function ParentCategoryPicker({
  items,
  value,
  onChange,
  allowNone = false,
  noneLabel = "Top-level (no parent)",
  error,
  disabledIds,
}: ParentCategoryPickerProps) {
  // Always pass a string so RadioGroup stays controlled for its lifetime.
  const selected =
    value == null ? (allowNone ? "none" : "") : String(value);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>Select parent category</FieldLabel>
      <RadioGroup
        value={selected}
        onValueChange={(next) => {
          if (next == null || next === "") return;
          onChange(next === "none" ? null : Number(next));
        }}
        className="mt-2 gap-2"
      >
        {allowNone ? (
          <label
            className={cn(
              "border-border hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
              selected === "none" && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value="none" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{noneLabel}</p>
              <p className="text-muted-foreground text-xs">Main category</p>
            </div>
          </label>
        ) : null}

        {items.map((item) => {
          const disabled = disabledIds?.has(item.id) ?? false;
          const itemValue = String(item.id);

          return (
            <label
              key={item.id}
              className={cn(
                "border-border flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted/40 cursor-pointer",
                selected === itemValue && !disabled && "border-primary bg-primary/5",
                item.depth > 0 && "ml-6 sm:ml-10"
              )}
            >
              <RadioGroupItem value={itemValue} disabled={disabled} />
              <CategoryThumb
                category={{
                  categoryName: item.categoryName,
                  media: item.media,
                }}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {item.categoryName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {item.isMain ? "Main Category" : "— Sub Category"}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
      <FieldError errors={[error]} />
    </Field>
  );
}
