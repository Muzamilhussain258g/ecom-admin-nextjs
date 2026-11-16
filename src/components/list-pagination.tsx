"use client";

import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ListPaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  total?: number;
  summary?: ReactNode;
  disabled?: boolean;
  canPrevious?: boolean;
  canNext?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ListPagination({
  page, pageSize, totalPages, total, summary, disabled = false,
  canPrevious = page > 1, canNext = page < totalPages,
  onPageChange, onPageSizeChange,
}: ListPaginationProps) {
  const id = useId();
  const pageSizes = [...new Set([10, 20, 30, 40, 50, pageSize])].sort((a, b) => a - b);

  return (
    <nav aria-label="List pagination" className="flex flex-wrap items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium">Rows per page</label>
        <Select value={String(pageSize)} disabled={disabled} onValueChange={(value) => {
          if (value !== null) onPageSizeChange(Number(value));
        }}>
          <SelectTrigger id={id} className="w-20 cursor-pointer"><SelectValue /></SelectTrigger>
          <SelectContent side="top"><SelectGroup>
            {pageSizes.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>
      </div>
      <div role="status" className="text-muted-foreground text-sm">
        {summary ?? (total !== undefined ? `${total} result${total === 1 ? "" : "s"}` : null)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium">Page {page} of {Math.max(1, totalPages)}</span>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !canPrevious} onClick={() => onPageChange(Math.max(1, page - 1))}>Previous</Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !canNext} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </nav>
  );
}
