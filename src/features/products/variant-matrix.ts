import type {
  CreateProductVariantQuantity,
  CreateProductVariantSelection,
} from "@/features/products/types";

export type VariantTypeOption = {
  id: number;
  name: string;
  sortOrder: number;
  values: Array<{
    id: number;
    value: string;
    code: string;
    sortOrder: number;
  }>;
};

function cartesianProduct<T>(sets: T[][]): T[][] {
  if (sets.length === 0) return [];
  return sets.reduce<T[][]>(
    (acc, current) => acc.flatMap((combo) => current.map((item) => [...combo, item])),
    [[]]
  );
}

export function buildVariantSelections(
  selectedByType: Record<number, number[]>
): CreateProductVariantSelection[] {
  return Object.entries(selectedByType)
    .map(([variantTypeId, variantValueIds]) => ({
      variantTypeId: Number(variantTypeId),
      variantValueIds: [...variantValueIds].sort((a, b) => a - b),
    }))
    .filter((selection) => selection.variantValueIds.length > 0)
    .sort((a, b) => a.variantTypeId - b.variantTypeId);
}

export function buildVariantQuantities(
  variantTypes: VariantTypeOption[],
  selectedByType: Record<number, number[]>,
  previous: CreateProductVariantQuantity[] = [],
  defaultQuantity = 0
): CreateProductVariantQuantity[] {
  const orderedTypes = [...variantTypes]
    .filter((type) => (selectedByType[type.id] ?? []).length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (orderedTypes.length === 0) return [];

  const valueSets = orderedTypes.map((type) => {
    const selectedIds = new Set(selectedByType[type.id] ?? []);
    return type.values
      .filter((value) => selectedIds.has(value.id))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((value) => value.id);
  });

  const combinations = cartesianProduct(valueSets);
  const previousByKey = new Map(
    previous.map((item) => [item.variantValueIds.join("-"), item.quantity])
  );

  return combinations.map((variantValueIds) => {
    const key = variantValueIds.join("-");
    return {
      variantValueIds,
      quantity: previousByKey.get(key) ?? defaultQuantity,
    };
  });
}

export function describeVariantCombination(
  variantTypes: VariantTypeOption[],
  variantValueIds: number[]
): string {
  const labels: string[] = [];

  for (const type of [...variantTypes].sort((a, b) => a.sortOrder - b.sortOrder)) {
    for (const valueId of variantValueIds) {
      const value = type.values.find((item) => item.id === valueId);
      if (value) labels.push(`${type.name}: ${value.value}`);
    }
  }

  return labels.join(" · ");
}
