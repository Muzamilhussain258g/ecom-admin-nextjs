"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOrderQuery } from "@/features/orders/hooks/use-orders";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { OrderDetails } from "../../components/order-details";

export function OrderDetailPage({ id }: { id: number }) {
  const query = useOrderQuery(id);
  const [statusMessage, setStatusMessage] = useState("");
  const missing = axios.isAxiosError(query.error) && query.error.response?.status === 404;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" nativeButton={false} render={<Link href="/orders" />}>
          <ArrowLeft /> Back to orders
        </Button>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
          {query.isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order details</h1>
        <p className="text-muted-foreground text-sm">Review shipping, items, payments, and order status.</p>
      </div>
      {statusMessage && <p role="status" className="text-sm">{statusMessage}</p>}
      {query.isPending ? <p role="status" className="text-muted-foreground text-sm">Loading order...</p>
        : query.isError ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="text-destructive text-sm">{missing ? "Order not found." : getApiErrorMessage(query.error, "Unable to load this order.")}</p>
            {!missing && <Button variant="outline" onClick={() => void query.refetch()}>Retry</Button>}
          </div>
        ) : (
              <OrderDetails order={query.data} onStatusSaved={() => setStatusMessage("Order status updated successfully.")} />
        )}
    </div>
  );
}
