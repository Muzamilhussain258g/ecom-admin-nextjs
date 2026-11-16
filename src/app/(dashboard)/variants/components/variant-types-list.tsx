"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  useDeleteVariantTypeMutation,
  useDeleteVariantValueMutation,
  useVariantTypesQuery,
} from "@/features/variant-types/hooks/use-variant-types";
import type {
  VariantType,
  VariantTypeValue,
} from "@/features/variant-types/types";
import { ListPagination } from "@/components/list-pagination";
import { useListPagination } from "@/hooks/use-list-pagination";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { VariantTypeFormDialog } from "./variant-type-form-dialog";
import { VariantValueFormDialog } from "./variant-value-form-dialog";
import { VariantValuesTable } from "./variant-values-table";

export function VariantTypesList() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useVariantTypesQuery();
  const deleteTypeMutation = useDeleteVariantTypeMutation();
  const deleteValueMutation = useDeleteVariantValueMutation();

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<VariantType | null>(null);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState<VariantType | null>(null);
  const [editingValue, setEditingValue] = useState<VariantTypeValue | null>(
    null
  );

  const variantTypes = [...(data ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const openCreateType = () => {
    setEditingType(null);
    setTypeDialogOpen(true);
  };

  const openEditType = (type: VariantType) => {
    setEditingType(type);
    setTypeDialogOpen(true);
  };

  const openCreateValue = (type: VariantType) => {
    setActiveType(type);
    setEditingValue(null);
    setValueDialogOpen(true);
  };

  const openEditValue = (type: VariantType, value: VariantTypeValue) => {
    setActiveType(type);
    setEditingValue(value);
    setValueDialogOpen(true);
  };

  const handleDeleteType = async (type: VariantType) => {
    const confirmed = window.confirm(
      `Delete variant type "${type.name}"? This fails if it is linked to active products.`
    );
    if (!confirmed) return;

    try {
      await deleteTypeMutation.mutateAsync(type.id);
      toast.add({
        type: "success",
        title: "Variant type deleted",
        description: `${type.name} was deleted.`,
      });
    } catch (err) {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getApiErrorMessage(err),
      });
    }
  };

  const handleDeleteValue = async (value: VariantTypeValue) => {
    const confirmed = window.confirm(
      `Delete value "${value.value}" (${value.code})?`
    );
    if (!confirmed) return;

    try {
      await deleteValueMutation.mutateAsync(value.id);
      toast.add({
        type: "success",
        title: "Value deleted",
        description: `${value.value} was deleted.`,
      });
    } catch (err) {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getApiErrorMessage(err),
      });
    }
  };

  const pagination = useListPagination(variantTypes);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading variant types...</p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive text-sm">
          {getApiErrorMessage(error, "Failed to load variant types.")}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* <p className="text-muted-foreground text-sm">
          {variantTypes.length} variant type
          {variantTypes.length === 1 ? "" : "s"} from `GET /variant-types`
          {isFetching ? " · refreshing" : ""}
        </p> */}
        <Button className="cursor-pointer" onClick={openCreateType}>
          <Plus data-icon="inline-start" />
          Create type
        </Button>
      </div>

      {!variantTypes.length ? (
        <p className="text-muted-foreground text-sm">No variant types found.</p>
      ) : (
        <div className="grid gap-4">
          {pagination.items.map((type) => {
            const values = [...type.values].sort(
              (a, b) => a.sortOrder - b.sortOrder
            );

            return (
              <Card key={type.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {type.name}
                      {/* <Badge variant="outline">{type.slug}</Badge> */}
                    </CardTitle>
                    {/* <CardDescription>
                      ID {type.id} · sort {type.sortOrder} · {values.length}{" "}
                      value{values.length === 1 ? "" : "s"}
                    </CardDescription> */}
                    {/* {values.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Badge key={value.id} variant="secondary">
                            {value.value}
                            <span className="text-muted-foreground ml-1">
                              ({value.code})
                            </span>
                          </Badge>
                        ))}
                      </div>
                    ) : null} */}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => openCreateValue(type)}
                    >
                      <Plus data-icon="inline-start" />
                      Add value
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => openEditType(type)}
                    >
                      <Pencil data-icon="inline-start" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => void handleDeleteType(type)}
                      disabled={deleteTypeMutation.isPending}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <VariantValuesTable
                    values={values}
                    onEdit={(value) => openEditValue(type, value)}
                    onDelete={(value) => void handleDeleteValue(value)}
                    isDeleting={deleteValueMutation.isPending}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ListPagination {...pagination} disabled={isFetching} />

      <VariantTypeFormDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        variantType={editingType}
      />
      <VariantValueFormDialog
        open={valueDialogOpen}
        onOpenChange={setValueDialogOpen}
        variantType={activeType}
        variantValue={editingValue}
      />
    </div>
  );
}
