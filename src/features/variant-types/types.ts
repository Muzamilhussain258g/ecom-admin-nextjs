export type VariantTypeValue = {
  id: number;
  variantTypeId: number;
  value: string;
  code: string;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
};

export type VariantType = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  values: VariantTypeValue[];
};

export type CreateVariantTypePayload = {
  name: string;
  sortOrder: number;
};

export type UpdateVariantTypePayload = {
  name?: string;
  sortOrder?: number;
};

export type CreateVariantValuePayload = {
  value: string;
  code: string;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
};

export type UpdateVariantValuePayload = {
  value?: string;
  code?: string;
  sortOrder?: number;
  metadata?: Record<string, unknown> | null;
};
