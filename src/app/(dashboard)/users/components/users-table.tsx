"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { type ColumnDef, flexRender, useTable } from "@tanstack/react-table";
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { serialNumberColumn } from "@/lib/serial-number-column";
import { useUserQuery, useUsersQuery } from "@/features/users/hooks/use-users";
import type { ListUsersParams, User } from "@/features/users/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ListPagination } from "@/components/list-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function displayDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy HH:mm") : "Unavailable";
}

function UserDetails({ id }: { id: number }) {
  const query = useUserQuery(id);
  if (query.isPending) return <p role="status">Loading user details…</p>;
  if (query.isError) return <QueryError error={query.error} retry={() => void query.refetch()} />;
  const user = query.data;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 wrap-break-word">
      <dt className="text-muted-foreground">ID</dt><dd>{user.id}</dd>
      <dt className="text-muted-foreground">Name</dt><dd className="min-w-0">{user.name}</dd>
      <dt className="text-muted-foreground">Email</dt><dd className="min-w-0">{user.email}</dd>
      <dt className="text-muted-foreground">Role</dt><dd><Badge variant="secondary">{user.role}</Badge></dd>
      <dt className="text-muted-foreground">Created</dt><dd>{displayDate(user.createdAt)}</dd>
      <dt className="text-muted-foreground">Updated</dt><dd>{displayDate(user.updatedAt)}</dd>
    </dl>
  );
}

function QueryError({ error, retry }: { error: unknown; retry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 p-4">
    <p className="text-destructive">{getApiErrorMessage(error, "Unable to load users.")}</p>
    <Button variant="outline" onClick={retry}>Retry</Button>
  </div>;
}

export function UsersTable({ params }: { params: ListUsersParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, startTransition] = useTransition();
  const [search, setSearch] = useState(params.search ?? "");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const query = useUsersQuery(params);
  const pagination = query.data?.meta.pagination;
  const busy = isNavigating || query.isFetching;

  function navigate(changes: Partial<ListUsersParams>) {
    const next = { ...params, ...changes };
    const values = new URLSearchParams({ page: String(next.page), limit: String(next.limit) });
    if (next.search) values.set("search", next.search);
    startTransition(() => router.push(`${pathname}?${values}`, { scroll: false }));
  }

  const columns: ColumnDef<DataTableFeatures, User>[] = [
    serialNumberColumn<User>(),
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => displayDate(row.original.createdAt) },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <Button variant="outline" size="sm" aria-label={`View ${row.original.name}`} onClick={() => setSelectedId(row.original.id)}>View details</Button>
    ) },
  ];
  const table = useTable({
    features: dataTableFeatures,
    data: query.data?.users ?? [],
    columns,
    getRowId: (user) => String(user.id),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: { pagination: { pageIndex: params.page - 1, pageSize: params.limit } },
    pageCount: pagination?.totalPages ?? 0,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex w-full max-w-lg items-end gap-2" onSubmit={(event) => {
          event.preventDefault();
          navigate({ page: 1, search: search.trim() || undefined });
        }}>
          <div className="flex-1 space-y-2">
            <label htmlFor="users-search" className="text-sm font-medium">Search users</label>
            <Input id="users-search" type="search" placeholder="Search users…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Button type="submit" disabled={busy}>Search</Button>
          {params.search && <Button variant="outline" disabled={busy} onClick={() => { setSearch(""); navigate({ page: 1, search: undefined }); }}>Clear</Button>}
        </form>
        <Button variant="outline" disabled={busy} onClick={() => void query.refetch()}>Refresh</Button>
      </div>
      {query.isError ? <QueryError error={query.error} retry={() => void query.refetch()} /> : (
        <div className="rounded-lg border" aria-busy={busy}>
          <Table>
            <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>
              {group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
            </TableRow>)}</TableHeader>
            <TableBody>
              {query.isPending ? <TableRow><TableCell colSpan={columns.length} className="h-28 text-center"><span role="status">Loading users…</span></TableCell></TableRow>
                : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-28 text-center">{params.search ? "No users match your search." : "No users found on this page."}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
      <ListPagination
        page={pagination?.page ?? params.page}
        pageSize={params.limit}
        totalPages={pagination?.totalPages ?? 0}
        total={pagination?.total}
        disabled={busy}
        canPrevious={pagination?.hasPreviousPage ?? params.page > 1}
        canNext={pagination?.hasNextPage ?? false}
        onPageChange={(page) => navigate({ page })}
        onPageSizeChange={(limit) => navigate({ page: 1, limit })}
      />
      <Dialog open={selectedId !== null} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>User details</DialogTitle><DialogDescription>Account information. Dates are shown in your local timezone.</DialogDescription></DialogHeader>
          {selectedId !== null && <UserDetails key={selectedId} id={selectedId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
