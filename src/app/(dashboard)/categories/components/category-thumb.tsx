import type { CategoryNode } from "@/features/categories/types";
import { categoryInitials } from "@/features/categories/utils";
import { cn } from "@/lib/utils";

export function CategoryThumb({
  category,
  size = "lg",
}: {
  category: Pick<CategoryNode, "categoryName" | "media">;
  size?: "lg" | "sm";
}) {
  const url = category.media?.url;
  const sizeClass = size === "lg" ? "size-16" : "size-12";

  if (url) {
    return (
      <img
        src={url}
        alt={category.categoryName}
        className={cn("bg-muted shrink-0 rounded-lg object-cover", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold tracking-wide",
        sizeClass
      )}
      aria-hidden
    >
      {categoryInitials(category.categoryName)}
    </div>
  );
}
