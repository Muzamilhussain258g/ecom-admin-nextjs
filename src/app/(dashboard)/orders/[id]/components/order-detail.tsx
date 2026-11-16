"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrderQuery, useUpdateAdminOrderStatusMutation } from "@/features/orders/hooks/use-orders";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

export function OrderDetail({ orderId }: { orderId: number }) {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const orderQuery = useOrderQuery(orderId);
  const updateStatus = useUpdateAdminOrderStatusMutation();

  if (!Number.isInteger(orderId) || orderId < 1) {
    return (
      <section className="flex flex-col gap-4 px-4 lg:px-6">
        <p role="alert" className="text-sm text-destructive">
          Invalid order ID.
        </p>
        <Link href="/orders" className="text-sm text-primary hover:underline">
          Back to orders
        </Link>
      </section>
    );
  }

  if (orderQuery.isPending) {
    return (
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Loading order...
      </p>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <section className="flex flex-col gap-4 px-4 lg:px-6">
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(orderQuery.error, "Unable to load this order.")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void orderQuery.refetch()}>
            Retry
          </Button>
          <Button variant="ghost" render={<Link href="/orders" />}>
            Back to orders
          </Button>
        </div>
      </section>
    );
  }

  const order = orderQuery.data;
  const isFinalized = order.status === "cancelled" || order.status === "returned";

  const handleStatusUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!status || status === order.status) return;
    updateStatus.mutate({ id: order.id, status });
  };

  return (
    <section className="flex flex-col gap-5 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Link
            href="/orders"
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        </div>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order status</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleStatusUpdate}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="next-order-status" className="text-sm font-medium">
                New status
              </label>
              <select
                id="next-order-status"
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
                value={status || order.status}
                onChange={(event) => {
                  const nextStatus =
                    ORDER_STATUSES.find(
                      (candidate) => candidate === event.target.value
                    ) ?? "";
                  setStatus(nextStatus);
                  updateStatus.reset();
                }}
                disabled={isFinalized || updateStatus.isPending}
              >
                {ORDER_STATUSES.map((orderStatus) => (
                  <option key={orderStatus} value={orderStatus}>
                    {orderStatus}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={
                isFinalized ||
                updateStatus.isPending ||
                !status ||
                status === order.status
              }
            >
              {updateStatus.isPending ? "Updating..." : "Update status"}
            </Button>
          </form>
          {isFinalized ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Cancelled and returned orders cannot be changed.
            </p>
          ) : null}
          {updateStatus.error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {getApiErrorMessage(
                updateStatus.error,
                "Unable to update order status."
              )}
            </p>
          ) : null}
          {updateStatus.isSuccess ? (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              Order status updated.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>Customer user ID: {order.userId}</p>
            <p>Total: {order.totalAmount}</p>
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            <div className="flex flex-col gap-2 border-t pt-3">
              <h2 className="font-medium">Items</h2>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap justify-between gap-x-4 gap-y-1"
                >
                  <span>
                    {item.variant.product.name} · {item.variant.sku} ×{" "}
                    {item.quantity}
                  </span>
                  <span>{item.lineTotal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>{order.shipping.shippingFullName}</p>
            <p>{order.shipping.shippingPhone}</p>
            <p>{order.shipping.shippingStreet}</p>
            <p>
              {order.shipping.shippingCity}, {order.shipping.shippingProvince}{" "}
              {order.shipping.shippingPostalCode}
            </p>
            <p>{order.shipping.shippingCountry}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {order.payments.length ? (
            order.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
              >
                <span>
                  {payment.gateway} · {payment.status}
                </span>
                <span>
                  {payment.amount} {payment.currency}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No payment details.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
