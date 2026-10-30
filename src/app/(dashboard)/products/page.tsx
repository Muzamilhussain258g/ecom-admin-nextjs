import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductsTable } from "./components/products-table";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            <p className="text-muted-foreground text-sm">
              Browse catalogue products with search, category filter, and
              pagination.
            </p>
          </div>
          <Button
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/products/new" />}
          >
            <Plus data-icon="inline-start" />
            Create product
          </Button>
        </div>
      </div>

      <div className="@container/main mt-4 px-4 lg:px-6">
        <ProductsTable />
      </div>
    </div>
  );
}
