import { UsersTable } from "./components/users-table";

export default async function UsersPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const page = Number(values.page);
  const limit = Number(values.limit);
  const search = typeof values.search === "string" ? values.search.trim() : "";
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">Browse user accounts and view their details.</p>
      </div>
      <UsersTable key={`${page}-${limit}-${search}`} params={{
        page: Number.isSafeInteger(page) && page > 0 ? page : 1,
        limit: [10, 20, 25, 30, 40, 50].includes(limit) ? limit : 10,
        search: search || undefined,
      }} />
    </div>
  );
}
