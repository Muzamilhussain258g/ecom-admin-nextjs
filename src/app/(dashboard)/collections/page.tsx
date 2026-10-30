import { CollectionsList } from "./components/collections-list";

export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Collections
          </h1>
          <p className="text-muted-foreground text-sm">
            Curate promotional product groups for the storefront.
          </p>
        </div>
      </div>

      <div className="@container/main mt-4 px-4 lg:px-6">
        <CollectionsList />
      </div>
    </div>
  );
}
