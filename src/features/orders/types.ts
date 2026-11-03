export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
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
    product: { id: number; name: string; slug: string };
  };
}

export interface OrderPayment {
  id: number;
  orderId: number;
  amount: string;
  currency: string;
  status: string;
  gateway: string;
  transactionId: string;
  paidAt: string | null;
}

export interface Order {
  id: number;
  userId: number;
  shippingAddressId: number;
  shipping: OrderShipping;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface ListOrdersParams {
  page: number;
  limit: number;
  status?: string;
  userId?: number;
}

export interface OrdersListData {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
