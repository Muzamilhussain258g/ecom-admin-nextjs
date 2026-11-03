export const API_ENDPOINTS = {
  reviews: {
    list: "/admin/reviews",
    byId: (id: number) => `/reviews/${id}`,
  },
  orders: {
    list: "/orders/admin/all",
    byId: (id: number) => `/orders/${id}`,
    status: (id: number) => `/orders/admin/${id}/status`,
  },
  users: {
    list: "/users",
    byId: (id: number) => `/users/${id}`,
  },
  auth: {
    login: "/auth/signin",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    // forgotPassword: "/auth/password/forgot",
    // verifyPasswordOtp: "/auth/password/otp/verify",
    // resetPassword: "/auth/password/reset",
    // changePassword: "/auth/password/change",
  },
  products: {
    list: "/products",
    create: "/products",
    bySlug: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  categories: {
    list: "/categories",
    create: "/categories",
    byId: (id: number) => `/categories/${id}`,
  },
  collections: {
    list: "/collections",
    create: "/collections",
    bySlug: (slug: string) => `/collections/${encodeURIComponent(slug)}`,
  },
  variantTypes: {
    list: "/variant-types",
    create: "/variant-types",
    byId: (id: number) => `/variant-types/${id}`,
    values: (id: number) => `/variant-types/${id}/values`,
  },
  variantValues: {
    byId: (id: number) => `/variant-values/${id}`,
  },
  media: {
    uploadSignature: "/media/upload-signature",
  },
};
