"use client";

import { useState } from "react";

/** Pagination for endpoints that return the complete list. */
export function useListPagination<T>(items: readonly T[]) {
  const [requestedPage, setPage] = useState(1);
  const [pageSize, setSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Keep the last page valid after deletion or a refreshed list shrinks.
  const page = Math.min(requestedPage, totalPages);

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalPages,
    total: items.length,
    onPageChange: setPage,
    onPageSizeChange: (size: number) => {
      setSize(size);
      setPage(1);
    },
  };
}
