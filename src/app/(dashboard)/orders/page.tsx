import { OrdersTable } from "./components/orders-table";
import { ORDER_STATUSES } from "@/features/orders/types";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPositiveInteger(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const values = await searchParams;
  const requestedStatus =
    typeof values.status === "string" ? values.status.trim() : "";
  const status = ORDER_STATUSES.find(
    (candidate) => candidate === requestedStatus
  );
  const page = readPositiveInteger(values.page) ?? 1;
  const requestedLimit = readPositiveInteger(values.limit) ?? 10;
  const limit = [10, 20, 30, 40, 50].includes(requestedLimit)
    ? requestedLimit
    : 10;
  const userId = readPositiveInteger(values.userId);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Browse orders and review shipping, items, and payments.
        </p>
      </div>
      <OrdersTable
        key={`${page}-${limit}-${status}-${userId}`}
        params={{ page, limit, status, userId }}
      />
    </div>
  );
}
