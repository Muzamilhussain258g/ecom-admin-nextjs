export interface OrdersListParams {
  page: number;
  limit: number;
  status?: OrderStatus;
  userId?: number;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  quantity: number;
  price: string;
  lineTotal: number;
  variant: {
    id: number;
    sku: string;
    combinationKey: string;
    product: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface OrderShipping {
  shippingFullName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

export interface OrderPayment {
  id: number;
  amount: string;
  currency: string;
  status: string;
  gateway: string;
  transactionId?: string | null;
  paidAt?: string | null;
}

export interface AdminOrder {
  id: number;
  userId: number;
  shippingAddressId?: number | null;
  shipping: OrderShipping;
  totalAmount: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface OrdersListData {
  orders: AdminOrder[];
  pagination: OrdersPagination;
}
