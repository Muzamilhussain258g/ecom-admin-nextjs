"use client";

import type { ReactTable, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table";
import { ListPagination } from "@/components/list-pagination";

export function DataTablePagination<TData extends RowData>({ table }: {
  table: ReactTable<DataTableFeatures, TData>;
}) {
  return <ListPagination
    page={table.state.pagination.pageIndex + 1}
    pageSize={table.state.pagination.pageSize}
    totalPages={table.getPageCount()}
    summary={
      <>{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</>
    }
    canPrevious={table.getCanPreviousPage()}
    canNext={table.getCanNextPage()}
    onPageChange={(page) => table.setPageIndex(page - 1)}
    onPageSizeChange={(size) => { table.setPageSize(size); table.setPageIndex(0); }}
  />;
}
