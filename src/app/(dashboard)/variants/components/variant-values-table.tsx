"use client";

import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { VariantTypeValue } from "@/features/variant-types/types";
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { serialNumberColumn } from "@/lib/serial-number-column";

interface VariantValuesTableProps {
  values: VariantTypeValue[];
  onEdit: (value: VariantTypeValue) => void;
  onDelete: (value: VariantTypeValue) => void;
  isDeleting: boolean;
}

export function VariantValuesTable({ values, onEdit, onDelete, isDeleting }: VariantValuesTableProps) {
  const columns: ColumnDef<DataTableFeatures, VariantTypeValue>[] = [
    serialNumberColumn<VariantTypeValue>(),
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => <span className="font-medium">{row.original.value}</span>,
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <Badge variant="secondary">{row.original.code}</Badge>,
    },
    { accessorKey: "sortOrder", header: "Sort" },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button type="button" size="icon" variant="ghost" className="size-8 cursor-pointer" onClick={() => onEdit(row.original)}>
            <Pencil />
            <span className="sr-only">Edit value {row.original.value}</span>
          </Button>
          <Button type="button" size="icon" variant="ghost" className="size-8 cursor-pointer" onClick={() => onDelete(row.original)} disabled={isDeleting}>
            <Trash2 />
            <span className="sr-only">Delete value {row.original.value}</span>
          </Button>
        </div>
      ),
    },
  ];

  const table = useTable({
    features: dataTableFeatures,
    data: values,
    columns,
    getRowId: (value) => String(value.id),
    // The parent list paginates variant types; show all values in each card.
    manualPagination: true,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} className={header.column.id === "actions" ? "w-28" : undefined}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-muted-foreground h-16 text-center">
                No values yet. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
