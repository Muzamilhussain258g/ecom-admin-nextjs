import { CategoryForm } from "../components/category-form";

export default function CreateCategoryPage() {
  return (
    <div className="@container/main px-4 lg:px-6">
      <CategoryForm mode="create" />
    </div>
  );
}
