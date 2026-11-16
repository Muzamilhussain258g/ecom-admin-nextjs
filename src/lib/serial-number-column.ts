import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table";

export function serialNumberColumn<TData extends RowData>(): ColumnDef<DataTableFeatures, TData> {
  return {
    id: "serialNumber",
    header: "S.No.",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.atoms.pagination.get();
      const visibleIndex = table.getRowModel().rows.findIndex((item) => item.id === row.id);
      return pageIndex * pageSize + visibleIndex + 1;
    },
    enableSorting: false,
    enableHiding: false,
  };
}
