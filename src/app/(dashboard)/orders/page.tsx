import { OrdersTable } from "./components/orders-table";

export default async function OrdersPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const page = Number(values.page);
  const limit = Number(values.limit);
  const userId = Number(values.userId);
  const status = typeof values.status === "string" ? values.status.trim() : undefined;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">Browse orders and review shipping, items, and payments.</p>
      </div>
      <OrdersTable key={`${page}-${limit}-${status}-${userId}`} params={{
        page: Number.isSafeInteger(page) && page > 0 ? page : 1,
        limit: [10, 20, 30, 40, 50].includes(limit) ? limit : 10,
        status: status || undefined,
        userId: Number.isSafeInteger(userId) && userId > 0 ? userId : undefined,
      }} />
    </div>
  );
}
