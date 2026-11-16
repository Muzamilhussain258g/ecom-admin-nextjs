import { UsersTable } from "./components/users-table";
import type { ListUsersParams } from "@/features/users/types";

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPositiveInteger(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const values = await searchParams;
  const requestedPage = readPositiveInteger(values.page) ?? 1;
  const requestedLimit = readPositiveInteger(values.limit) ?? 10;
  const limit = [10, 20, 25, 30, 40, 50].includes(requestedLimit)
    ? requestedLimit
    : 10;
  const search = typeof values.search === "string" ? values.search.trim() : "";
  const params: ListUsersParams = {
    page: requestedPage,
    limit,
    ...(search ? { search } : {}),
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Browse user accounts and review their details.
        </p>
      </div>
      <UsersTable key={`${params.page}-${params.limit}-${search}`} params={params} />
    </div>
  );
}
