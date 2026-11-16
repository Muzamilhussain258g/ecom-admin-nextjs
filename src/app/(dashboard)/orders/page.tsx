"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminOrdersQuery } from "@/features/orders/hooks/use-orders";
import {
  ORDER_STATUSES,
  type OrderStatus,
  type OrdersListParams,
} from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

const PAGE_SIZE = 10;
export default function OrdersPage() {
  const [statusInput, setStatusInput] = useState<OrderStatus | "">("");
  const [userIdInput, setUserIdInput] = useState("");
  const [filterError, setFilterError] = useState("");
  const [filters, setFilters] = useState<Pick<OrdersListParams, "status" | "userId">>({});
  const [page, setPage] = useState(1);
  const { data, error, isPending, isFetching, refetch } = useAdminOrdersQuery({
    page,
    limit: PAGE_SIZE,
    ...filters,
  });

  const handleFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUserId = userIdInput.trim();
    const parsedUserId = trimmedUserId ? Number(trimmedUserId) : undefined;

    if (
      parsedUserId !== undefined &&
      (!Number.isInteger(parsedUserId) || parsedUserId < 1)
    ) {
      setFilterError("Enter a valid positive whole-number customer ID.");
      return;
    }

    setFilterError("");
    setPage(1);
    setFilters({
      ...(statusInput ? { status: statusInput } : {}),
      ...(parsedUserId !== undefined ? { userId: parsedUserId } : {}),
    });
  };

  const pagination = data?.pagination;

  return (
    <section className="flex flex-col gap-5 px-4 lg:px-6">
      <header>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review orders and filter by status or customer.
        </p>
      </header>

      <form
        onSubmit={handleFilter}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="order-status"
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={statusInput}
            onChange={(event) => {
              const nextStatus =
                ORDER_STATUSES.find(
                  (status) => status === event.target.value
                ) ?? "";
              setStatusInput(nextStatus);
            }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-user-id" className="text-sm font-medium">
            Customer user ID
          </label>
          <Input
            id="order-user-id"
            type="number"
            min="1"
            step="1"
            value={userIdInput}
            onChange={(event) => {
              setUserIdInput(event.target.value);
              setFilterError("");
            }}
            placeholder="Any customer"
            className="sm:w-44"
          />
        </div>
        <Button type="submit" disabled={isFetching}>
          Apply filters
        </Button>
      </form>
      {filterError ? (
        <p role="alert" className="text-sm text-destructive">
          {filterError}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          <span>{getApiErrorMessage(error, "Unable to load orders.")}</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : data?.orders.length ? (
                  data.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          #{order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.userId}</TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        {order.items
                          .map(
                            (item) =>
                              `${item.variant.product.name} × ${item.quantity}`
                          )
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell>{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {pagination
                ? `${pagination.total} orders · Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`
                : ""}
              {isFetching && !isPending ? " · Updating..." : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination?.hasPrevPage || isFetching}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!pagination?.hasNextPage || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
