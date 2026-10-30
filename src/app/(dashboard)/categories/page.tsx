import { CategoriesTree } from "./components/categories-tree";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage top-level categories and their subcategories.
          </p>
        </div>
      </div>

      <div className="@container/main mt-4 px-4 lg:px-6">
        <CategoriesTree />
      </div>
    </div>
  );
}
