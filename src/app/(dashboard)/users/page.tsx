"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
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
import { useUsersQuery } from "@/features/users/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, isPending, isFetching, refetch } = useUsersQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const pagination = data?.meta.pagination;

  return (
    <section className="flex flex-col gap-5 px-4 lg:px-6">
      <header>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Search and review user accounts.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-lg items-center gap-2"
      >
        <label htmlFor="user-search" className="sr-only">
          Search users by name or email
        </label>
        <Input
          id="user-search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name or email"
        />
        <Button type="submit" disabled={isFetching}>
          <Search data-icon="inline-start" />
          Search
        </Button>
      </form>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          <span>{getApiErrorMessage(error, "Unable to load users.")}</span>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : data?.users.length ? (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {pagination
                ? `${pagination.total} users · Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`
                : ""}
              {isFetching && !isPending ? " · Updating..." : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination?.hasPreviousPage || isFetching}
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
