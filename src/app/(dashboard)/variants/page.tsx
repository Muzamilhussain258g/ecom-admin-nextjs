import { VariantTypesList } from "./components/variant-types-list";

export default function VariantsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Variants</h1>
          <p className="text-muted-foreground text-sm">
            Manage variant types and values used when creating products.
          </p>
        </div>
      </div>

      <div className="@container/main mt-4 px-4 lg:px-6">
        <VariantTypesList />
      </div>
    </div>
  );
}
