"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import { Eye, Search } from "lucide-react";

import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import type {
  Product,
  ProductSortOrder,
} from "@/features/products/types";
import {
  formatDate,
  formatPrice,
  getPrimaryCategoryName,
  getPrimaryImage,
} from "@/features/products/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columns: ColumnDef<DataTableFeatures, Product>[] = [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      const image = getPrimaryImage(product);

      return (
        <Link
          href={`/products/${product.slug}`}
          className="hover:bg-muted/40 -mx-2 flex items-center gap-3 rounded-md px-2 py-1"
        >
          <div className="bg-muted size-12 shrink-0 overflow-hidden rounded-md border">
            {image?.media.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.media.url}
                alt={image.altText ?? product.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                N/A
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{product.name}</span>
            <span className="text-muted-foreground truncate text-sm">
              {product.slug}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => getPrimaryCategoryName(row.original),
  },
  {
    accessorKey: "basePrice",
    header: "Price",
    cell: ({ row }) => formatPrice(row.original.basePrice),
  },
  {
    id: "variants",
    header: "Variants",
    cell: ({ row }) => (row.original.hasVariants ? "Yes" : "No"),
  },
  {
    accessorKey: "productStatus",
    header: "Status",
    cell: ({ row }) =>
      row.original.productStatus ? (
        <Badge className="bg-success/10 text-success">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-8 cursor-pointer"
        nativeButton={false}
        render={<Link href={`/products/${row.original.slug}`} />}
      >
        <Eye />
        <span className="sr-only">View product</span>
      </Button>
    ),
  },
];

export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("asc");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCategory(categoryInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput, categoryInput]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useProductsQuery({
      page,
      limit,
      search: search || undefined,
      category: category || undefined,
      sortOrder,
    });

  const products = data?.products ?? [];
  const pagination = data?.meta.pagination;

  const table = useTable({
    features: dataTableFeatures,
    data: products,
    columns,
    getRowId: (row) => String(row.id),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 0,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <Field>
            <FieldLabel htmlFor="product-search">Search</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="product-search"
                placeholder="Search products..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="product-category">Category slug</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="product-category"
                placeholder="e.g. footwear"
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
              />
            </InputGroup>
          </Field>
        </div>

        <Field className="sm:w-40">
          <FieldLabel htmlFor="product-sort">Sort by name</FieldLabel>
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              if (value === "asc" || value === "desc") {
                setSortOrder(value);
                setPage(1);
              }
            }}
          >
            <SelectTrigger id="product-sort" className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  Loading products...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive text-sm">
                      {error instanceof Error
                        ? error.message
                        : "Failed to load products."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => void refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 py-2">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="products-page-size" className="text-sm font-medium">
            Show
          </FieldLabel>
          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="products-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <div className="text-muted-foreground hidden text-sm sm:block">
          {pagination
            ? `${pagination.total} product${pagination.total === 1 ? "" : "s"}${
                isFetching && !isLoading ? " · refreshing" : ""
              }`
            : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!pagination?.hasPreviousPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination?.hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
