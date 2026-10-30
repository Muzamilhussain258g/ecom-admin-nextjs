import { notFound } from "next/navigation";

import { EditCategoryForm } from "../../components/edit-category-form";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  return (
    <div className="@container/main px-4 lg:px-6">
      <EditCategoryForm categoryId={id} />
    </div>
  );
}
