"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ListPagination } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrdersQuery } from "@/features/orders/hooks/use-orders";
import type { ListOrdersParams, Order } from "@/features/orders/types";
import { formatOrderAmount, getOrderCurrency } from "@/features/orders/utils";
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { serialNumberColumn } from "@/lib/serial-number-column";
import { formatOrderDate } from "./order-details";

const filtersSchema = z.object({
  status: z.string().trim(),
  userId: z.string().trim().refine((value) => !value || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0), "Enter a positive customer ID."),
});
type Filters = z.infer<typeof filtersSchema>;

export function OrdersTable({ params }: { params: ListOrdersParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, startTransition] = useTransition();
  const query = useOrdersQuery(params);
  const pagination = query.data?.pagination;
  const busy = navigating || query.isFetching;
  const form = useForm<Filters>({ resolver: zodResolver(filtersSchema), defaultValues: { status: params.status ?? "", userId: params.userId ? String(params.userId) : "" } });

  function navigate(changes: Partial<ListOrdersParams>) {
    const next = { ...params, ...changes };
    const search = new URLSearchParams({ page: String(next.page), limit: String(next.limit) });
    if (next.status) search.set("status", next.status);
    if (next.userId) search.set("userId", String(next.userId));
    startTransition(() => router.push(`${pathname}?${search}`, { scroll: false }));
  }

  const columns: ColumnDef<DataTableFeatures, Order>[] = [
    serialNumberColumn<Order>(),
    { id: "customer", header: "Recipient", cell: ({ row }) => <div><p className="font-medium">{row.original.shipping.shippingFullName}</p><p className="text-muted-foreground text-xs">{row.original.shipping.shippingPhone}</p></div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> },
    { id: "items", header: "Items", cell: ({ row }) => row.original.items.reduce((total, item) => total + item.quantity, 0) },
    { accessorKey: "totalAmount", header: "Total", cell: ({ row }) => formatOrderAmount(row.original.totalAmount, getOrderCurrency(row.original.payments)) },
    { id: "payment", header: "Payment", cell: ({ row }) => row.original.payments.length ? <div className="flex flex-wrap gap-1">{row.original.payments.map((payment) => <Badge key={payment.id} variant="outline">{payment.gateway.toUpperCase()} / {payment.status}</Badge>)}</div> : "No payments" },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatOrderDate(row.original.createdAt) },
    { id: "actions", header: "Actions", cell: ({ row }) => <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/orders/${row.original.id}`} />} aria-label={`View order for ${row.original.shipping.shippingFullName}`}>View details</Button> },
  ];
  const table = useTable({ features: dataTableFeatures, data: query.data?.orders ?? [], columns,
    getRowId: (order) => String(order.id), manualPagination: true, manualFiltering: true, manualSorting: true,
    state: { pagination: { pageIndex: (pagination?.page ?? params.page) - 1, pageSize: pagination?.limit ?? params.limit } }, pageCount: pagination?.totalPages ?? 0,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex flex-wrap items-end gap-3" onSubmit={form.handleSubmit((values) => navigate({ page: 1, status: values.status || undefined, userId: values.userId ? Number(values.userId) : undefined }))}>
          <Field className="w-full sm:w-48"><FieldLabel htmlFor="order-status">Status</FieldLabel><Input id="order-status" placeholder="e.g. pending" {...form.register("status")} /></Field>
          <Field className="w-full sm:w-48" data-invalid={!!form.formState.errors.userId}><FieldLabel htmlFor="order-customer">Customer ID</FieldLabel><Input id="order-customer" inputMode="numeric" placeholder="All customers" aria-invalid={!!form.formState.errors.userId} {...form.register("userId")} /><FieldError errors={[form.formState.errors.userId]} /></Field>
          <Button type="submit" disabled={busy}>Apply filters</Button>
          {(params.status || params.userId) && <Button type="button" variant="outline" disabled={busy} onClick={() => navigate({ page: 1, status: undefined, userId: undefined })}>Clear</Button>}
        </form>
        <Button variant="outline" disabled={busy} onClick={() => void query.refetch()}>Refresh</Button>
      </div>
      <div className="rounded-md border" aria-busy={busy}>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>
            {group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
          </TableRow>)}</TableHeader>
          <TableBody>
            {query.isPending ? <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><span role="status">Loading orders...</span></TableCell></TableRow>
              : query.isError ? <TableRow><TableCell colSpan={columns.length}><div role="alert" className="flex flex-wrap items-center justify-center gap-3 py-6"><p className="text-destructive">{getApiErrorMessage(query.error, "Unable to load orders.")}</p><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div></TableCell></TableRow>
              : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)
              : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No orders found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <ListPagination page={pagination?.page ?? params.page} pageSize={pagination?.limit ?? params.limit} totalPages={pagination?.totalPages ?? 0} total={pagination?.total}
        disabled={busy} canPrevious={pagination?.hasPrevPage ?? params.page > 1} canNext={pagination?.hasNextPage ?? false}
        onPageChange={(page) => navigate({ page })} onPageSizeChange={(limit) => navigate({ page: 1, limit })} />
    </div>
  );
}
