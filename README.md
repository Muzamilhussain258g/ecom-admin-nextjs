# ecom-admin-nextjs

## Backend API

Set `NEXT_PUBLIC_API_BASE_URL` to the backend API base URL, including its
versioned prefix. For local development:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

The admin sign-in flow stores the returned access token for authenticated API
requests. The Users page calls `GET /users` (admin only). The Orders page calls
`GET /orders/admin/all` (admin or seller), and an order detail page calls
`GET /orders/:id` and `PATCH /orders/admin/:id/status`. Backend role and order
transition checks remain authoritative.

Product list and detail responses may include `isWishlisted` when the request
is authenticated. Without a token, the frontend leaves the wishlist state
unavailable; an invalid token is surfaced as the backend's `401` error.