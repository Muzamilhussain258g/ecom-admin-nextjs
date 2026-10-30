import { CategoryForm } from "../../components/category-form";

type CreateSubCategoryPageProps = {
  searchParams: Promise<{ parentId?: string }>;
};

export default async function CreateSubCategoryPage({
  searchParams,
}: CreateSubCategoryPageProps) {
  const params = await searchParams;
  const parsed = Number(params.parentId);
  const defaultParentId =
    Number.isFinite(parsed) && parsed > 0 ? parsed : null;

  return (
    <div className="@container/main px-4 lg:px-6">
      <CategoryForm mode="create-sub" defaultParentId={defaultParentId} />
    </div>
  );
}
