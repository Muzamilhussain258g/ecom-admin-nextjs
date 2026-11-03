"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { Star, Trash2 } from "lucide-react";

import { ListPagination } from "@/components/list-pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteReviewMutation, useReviewsQuery } from "@/features/reviews/hooks/use-reviews";
import type { ListReviewsParams, Review } from "@/features/reviews/types";
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { serialNumberColumn } from "@/lib/serial-number-column";

function displayDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Unavailable";
}

const reviewColumns: ColumnDef<DataTableFeatures, Review>[] = [
  serialNumberColumn<Review>(),
  { id: "customer", header: "Customer", cell: ({ row }) => <span className="font-medium">{row.original.user.name}</span> },
  {
    id: "product", header: "Product",
    cell: ({ row }) => <Link href={`/products/${encodeURIComponent(row.original.product.slug)}`} className="block min-w-36 max-w-64 whitespace-normal font-medium underline-offset-4 hover:underline">{row.original.product.name}</Link>,
  },
  {
    accessorKey: "stars", header: "Rating",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap" role="img" aria-label={`${row.original.stars} out of 5 stars`}>
        <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
        <span className="font-medium tabular-nums">{row.original.stars}<span className="text-muted-foreground font-normal"> / 5</span></span>
      </span>
    ),
  },
  { accessorKey: "review", header: "Review", cell: ({ row }) => <p className="min-w-52 max-w-xl whitespace-pre-wrap break-words leading-relaxed">{row.original.review || "No written review."}</p> },
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => displayDate(row.original.createdAt) },
  { accessorKey: "updatedAt", header: "Updated", cell: ({ row }) => displayDate(row.original.updatedAt) },
];

export function ReviewsTable({ params }: { params: ListReviewsParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, startTransition] = useTransition();
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const deleteMutation = useDeleteReviewMutation();
  const query = useReviewsQuery(params);
  const pagination = query.data?.pagination;
  const busy = navigating || query.isFetching || deleteMutation.isPending;
  const columns: ColumnDef<DataTableFeatures, Review>[] = [
    ...reviewColumns,
    {
      id: "actions", header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={busy}
          aria-label={`Delete review by ${row.original.user.name} for ${row.original.product.name}`}
          onClick={() => { deleteMutation.reset(); setDeletingReview(row.original); }}>
          <Trash2 />
        </Button>
      ),
    },
  ];
  const table = useTable({
    features: dataTableFeatures, data: query.data?.reviews ?? [], columns,
    getRowId: (review) => String(review.id), manualPagination: true, manualFiltering: true, manualSorting: true,
    state: { pagination: { pageIndex: (pagination?.page ?? params.page) - 1, pageSize: pagination?.limit ?? params.limit } },
    pageCount: pagination?.totalPages ?? 0,
  });

  function navigate(changes: Partial<ListReviewsParams>) {
    const next = { ...params, ...changes };
    const search = new URLSearchParams({ page: String(next.page), limit: String(next.limit) });
    startTransition(() => router.push(`${pathname}?${search}`, { scroll: false }));
  }

  async function confirmDelete() {
    if (!deletingReview || deleteMutation.isPending) return;
    // Capture the page before invalidation refreshes the list.
    const currentPage = pagination?.page ?? params.page;
    const pageSize = pagination?.limit ?? params.limit;
    const remainingTotal = Math.max(0, (pagination?.total ?? 1) - 1);
    try {
      await deleteMutation.mutateAsync(deletingReview.id);
      setDeletingReview(null);
      toast.add({ type: "success", title: "Review deleted", description: "The review was deleted successfully." });
      const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize));
      if (currentPage > lastPage) navigate({ page: lastPage });
    } catch {
      // Keep the confirmation open; the mutation error is displayed below.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{pagination ? `${pagination.total} review${pagination.total === 1 ? "" : "s"}` : "Customer reviews"}</p>
        <Button variant="outline" disabled={busy} onClick={() => void query.refetch()}>{query.isFetching && !query.isPending ? "Refreshing..." : "Refresh"}</Button>
      </div>
      <div className="rounded-md border" aria-busy={busy}>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>
            {group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
          </TableRow>)}</TableHeader>
          <TableBody>
            {query.isPending ? <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><span role="status">Loading reviews...</span></TableCell></TableRow>
              : query.isError ? <TableRow><TableCell colSpan={columns.length}><div role="alert" className="flex flex-wrap items-center justify-center gap-3 py-6"><p className="text-destructive">{getApiErrorMessage(query.error, "Unable to load reviews.")}</p><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div></TableCell></TableRow>
              : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)
              : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No reviews found on this page.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        page={pagination?.page ?? params.page} pageSize={pagination?.limit ?? params.limit}
        totalPages={pagination?.totalPages ?? 0} total={pagination?.total} disabled={busy}
        canPrevious={pagination?.hasPreviousPage ?? params.page > 1} canNext={pagination?.hasNextPage ?? false}
        onPageChange={(page) => navigate({ page })} onPageSizeChange={(limit) => navigate({ page: 1, limit })}
      />
      <Dialog open={deletingReview !== null} onOpenChange={(open) => {
        if (!open && !deleteMutation.isPending) { setDeletingReview(null); deleteMutation.reset(); }
      }}>
        <DialogContent showCloseButton={!deleteMutation.isPending}>
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription>This permanently removes {deletingReview?.user.name}&apos;s review for {deletingReview?.product.name}. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {deletingReview && <blockquote className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{deletingReview.review || "No written review."}</blockquote>}
          {deleteMutation.isError && <p role="alert" className="text-destructive text-sm">{getApiErrorMessage(deleteMutation.error, "Unable to delete this review.")}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => { setDeletingReview(null); deleteMutation.reset(); }}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => void confirmDelete()}>{deleteMutation.isPending ? "Deleting..." : "Delete review"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
