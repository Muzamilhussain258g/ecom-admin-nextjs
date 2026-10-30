import type {
  CategoryNode,
  FlatCategoryOption,
} from "@/features/categories/types";

export type FlatCategoryPickerItem = {
  id: number;
  categoryName: string;
  slug: string;
  media: CategoryNode["media"];
  depth: number;
  isMain: boolean;
};

export function flattenCategories(
  categories: CategoryNode[],
  parentLabel = ""
): FlatCategoryOption[] {
  const options: FlatCategoryOption[] = [];

  for (const category of categories) {
    const label = parentLabel
      ? `${parentLabel} / ${category.categoryName}`
      : category.categoryName;

    options.push({ id: category.id, label });

    if (category.children?.length) {
      options.push(...flattenCategories(category.children, label));
    }
  }

  return options;
}

export function flattenCategoriesForPicker(
  categories: CategoryNode[],
  depth = 0
): FlatCategoryPickerItem[] {
  const items: FlatCategoryPickerItem[] = [];

  for (const category of categories) {
    items.push({
      id: category.id,
      categoryName: category.categoryName,
      slug: category.slug,
      media: category.media,
      depth,
      isMain: depth === 0,
    });

    if (category.children?.length) {
      items.push(...flattenCategoriesForPicker(category.children, depth + 1));
    }
  }

  return items;
}

export function findCategoryById(
  nodes: CategoryNode[],
  id: number
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function collectSelfAndDescendantIds(node: CategoryNode): Set<number> {
  const ids = new Set<number>([node.id]);
  for (const child of node.children ?? []) {
    for (const id of collectSelfAndDescendantIds(child)) {
      ids.add(id);
    }
  }
  return ids;
}

export function categoryInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
