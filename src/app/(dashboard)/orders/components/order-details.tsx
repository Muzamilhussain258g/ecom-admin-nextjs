"use client";

import Link from "next/link";
import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreditCard, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order, OrderItem } from "@/features/orders/types";
import { formatOrderAmount, getOrderCurrency } from "@/features/orders/utils";
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { serialNumberColumn } from "@/lib/serial-number-column";
import { OrderStatusForm } from "./order-status-form";
import { ShippingAddress } from "./shipping-address";

export function formatOrderDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy HH:mm") : "Unavailable";
}

export function OrderDetails({ order, onStatusSaved }: { order: Order; onStatusSaved: () => void }) {
  const currency = getOrderCurrency(order.payments);
  const columns: ColumnDef<DataTableFeatures, OrderItem>[] = [
    serialNumberColumn<OrderItem>(),
    {
      id: "product", header: "Product",
      cell: ({ row }) => <div className="min-w-40">
        <Link className="font-medium underline-offset-4 hover:underline" href={`/products/${encodeURIComponent(row.original.variant.product.slug)}`}>{row.original.variant.product.name}</Link>
        <p className="text-muted-foreground text-xs">{row.original.variant.sku}</p>
      </div>,
    },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "price", header: "Unit price", cell: ({ row }) => formatOrderAmount(row.original.price, currency) },
    { accessorKey: "lineTotal", header: "Total", cell: ({ row }) => formatOrderAmount(row.original.lineTotal, currency) },
  ];
  const table = useTable({
    features: dataTableFeatures, data: order.items, columns,
    getRowId: (item) => String(item.id), manualPagination: true,
  });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Order summary</h2><Badge variant="secondary" className="capitalize">{order.status}</Badge></div>
          <p className="text-muted-foreground text-sm">Placed {formatOrderDate(order.createdAt)} (local time)</p>
        </div>
        <OrderStatusForm key={order.id} order={order} onSaved={onStatusSaved} />
      </div>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0" aria-label="Order items">
        <Card className="gap-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-2"><Package className="size-4 text-muted-foreground" aria-hidden="true" /><h3 className="text-sm font-semibold">Order items</h3></div>
            <span className="text-muted-foreground text-xs">{order.items.reduce((total, item) => total + item.quantity, 0)} items</span>
          </CardHeader>
        <div className="min-w-0">
          <Table>
            <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>
              {group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
            </TableRow>)}</TableHeader>
            <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
            </TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-20 text-center">No items found.</TableCell></TableRow>}</TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 pt-4">
          <span className="text-sm font-medium">Order total</span><span className="text-lg font-semibold tabular-nums">{formatOrderAmount(order.totalAmount, currency)}</span>
        </div>
        </Card>
      </section>
      <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1">
      <ShippingAddress shipping={order.shipping} />
      <section className="min-w-0" aria-label="Payments">
        <Card className="gap-4 shadow-none">
          <CardHeader className="flex flex-row items-center gap-2 border-b pb-4"><CreditCard className="size-4 text-muted-foreground" aria-hidden="true" /><h3 className="text-sm font-semibold">Payment details</h3></CardHeader>
          <CardContent className="space-y-4">
        {order.payments.length ? order.payments.map((payment) => <div key={payment.id} className="space-y-4 text-sm not-first:border-t not-first:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold tabular-nums">{formatOrderAmount(payment.amount, payment.currency)}</span><Badge variant="outline" className="capitalize">{payment.status}</Badge></div>
          <dl className="space-y-3">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Method</dt><dd className="font-medium uppercase">{payment.gateway}</dd></div>
            <div className="space-y-1"><dt className="text-muted-foreground text-xs">Transaction reference</dt><dd className="break-all font-mono text-xs">{payment.transactionId}</dd></div>
            <div className="space-y-1"><dt className="text-muted-foreground text-xs">Payment date</dt><dd className="text-xs">{payment.paidAt ? `${formatOrderDate(payment.paidAt)} (local time)` : "Awaiting payment"}</dd></div>
          </dl>
        </div>) : <p className="text-muted-foreground text-sm">No payments found.</p>}
          </CardContent>
        </Card>
      </section>
      </div>
      </div>
    </div>
  );
}
