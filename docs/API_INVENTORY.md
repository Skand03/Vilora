# Vilora Naturals — Comprehensive API Inventory & Specification

- **Project**: Vilora Naturals E-commerce Platform
- **Base URL**: `http://localhost:9999`
- **Authentication**: Stateless Bearer JWT (`Authorization: Bearer <token>`)
- **Default Response Envelope**:
  ```json
  {
    "success": true,
    "message": "Human-readable status message",
    "data": { ... }
  }
  ```
- **Error Response Envelope**:
  ```json
  {
    "success": false,
    "message": "Error description or 'Validation failed'",
    "data": null // or object mapping field names to error messages
  }
  ```

---

## 1. Authentication Module (`/api/auth`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | Public | None | None | `{"fullName": "Aarav Sharma", "email": "aarav.test@vilora.com", "password": "Password123!", "address": "123 Green Orchard Lane"}` | `201 Created` | `400 Bad Request` (Email already registered, invalid email format, password < 6 chars, blank name) |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public | None | None | `{"email": "aarav.test@vilora.com", "password": "Password123!"}` | `200 OK` | `401 Unauthorized` (Bad credentials / incorrect password), `400 Bad Request` (blank fields) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Required | Any | None | None | `200 OK` | `401 Unauthorized` (Missing / invalid / expired JWT token) |
| `GET` | `/api/auth/profile` | Alternate alias for user profile | Required | Any | None | None | `200 OK` | `401 Unauthorized` (Missing / invalid token) |
| `POST` | `/api/auth/logout` | Client logout acknowledgement | Public | None | None | None | `200 OK` | None (Stateless acknowledgement) |

---

## 2. User Profile Module (`/api/users`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Fetch current user account info | Required | Any | None | None | `200 OK` | `401 Unauthorized` (Unauthenticated) |
| `PUT` | `/api/users/me` | Update current user name, address, phone | Required | Any | None | `{"fullName": "Aarav K. Sharma", "address": "456 Blossom Road", "phone": "+919876543210"}` | `200 OK` | `401 Unauthorized`, `400 Bad Request` (Blank fullName) |

---

## 3. Categories Module (`/api/categories`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | List all active categories | Public | None | None | None | `200 OK` | None (Returns empty array if no categories) |
| `GET` | `/api/categories/{id}` | Get category by UUID | Public | None | `id` (UUID) | None | `200 OK` | `404 Not Found` (Category ID does not exist), `400 Bad Request` (Invalid UUID format) |
| `POST` | `/api/categories` | Create new product category | Required | `ROLE_ADMIN` | None | `{"name": "Organic Dry Fruits", "description": "Naturally sun-dried premium nuts and dry fruits"}` | `201 Created` | `401 Unauthorized`, `403 Forbidden` (Non-admin), `400 Bad Request` (Duplicate category name, blank name, >100 chars) |
| `PUT` | `/api/categories/{id}` | Update existing category | Required | `ROLE_ADMIN` | `id` (UUID) | `{"name": "Premium Organic Dry Fruits", "description": "Updated description"}` | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request` (Duplicate name) |
| `DELETE` | `/api/categories/{id}` | Delete / deactivate category | Required | `ROLE_ADMIN` | `id` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

---

## 4. Products & Catalog Module (`/api/products`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | List all active products | Public | None | None | None | `200 OK` | None |
| `GET` | `/api/products/search` | Search, filter, and paginate catalog | Public | None | `search`, `categories`, `minPrice`, `maxPrice`, `rating`, `inStock`, `organic`, `isOrganic`, `sort` (`price-asc`, `price-desc`, `newest`, `top-rated`), `page` (default 0), `size` (default 12) | None | `200 OK` | None (Returns empty `PageResponse` on no matches) |
| `GET` | `/api/products/{id}` | Get product details by UUID | Public | None | `id` (UUID) | None | `200 OK` | `404 Not Found` (Product ID not found) |
| `POST` | `/api/products` | Create new product | Required | `ROLE_ADMIN` | None | `{"name": "Royal Kashmiri Almonds", "description": "100% organic raw Mamra almonds", "price": 899.00, "originalPrice": 1099.00, "stockQuantity": 50, "inStock": true, "organic": true, "categoryId": "{{categoryId}}", "image": "https://viloranaturals.com/images/almonds.jpg", "images": ["https://viloranaturals.com/images/almonds.jpg"], "ingredients": "Raw Organic Almonds", "nutrition": "Protein: 21g, Fiber: 12g"}` | `201 Created` | `401 Unauthorized`, `403 Forbidden`, `400 Bad Request` (Duplicate product name, price <= 0, originalPrice < price, missing categoryId), `404 Not Found` (categoryId does not exist) |
| `PUT` | `/api/products/{id}` | Update existing product | Required | `ROLE_ADMIN` | `id` (UUID) | `{"name": "Royal Kashmiri Almonds (500g)", "description": "Updated description", "price": 949.00, "originalPrice": 1199.00, "stockQuantity": 40, "inStock": true, "organic": true, "categoryId": "{{categoryId}}"}` | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` (Product or category not found), `400 Bad Request` (Name conflict, negative stock) |
| `DELETE` | `/api/products/{id}` | Delete / deactivate product | Required | `ROLE_ADMIN` | `id` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/products/upload-image` | Upload image to Supabase Storage | Required | `ROLE_ADMIN` | `file` (Multipart form-data) | Form field `file`: binary (JPEG, PNG, WEBP, GIF) | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `400 Bad Request` (Empty file, invalid mime type) |
| `POST` | `/api/products/{id}/images` | Attach image URL to product gallery | Required | `ROLE_ADMIN` | `id` (UUID) | `{"imageUrl": "https://example.com/almonds-extra.jpg"}` | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request` (Empty URL) |
| `DELETE` | `/api/products/{id}/images` | Remove image URL from product gallery | Required | `ROLE_ADMIN` | `id` (UUID), `imageUrl` (Query param) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

---

## 5. Addresses Module (`/api/addresses`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/addresses` | Add new delivery address | Required | Customer | None | `{"fullName": "Aarav Sharma", "street": "Flat 302, Palm Heights", "addressLine2": "Green Valley", "city": "Bengaluru", "state": "Karnataka", "zipCode": "560001", "phone": "+919876543210", "isDefault": true}` | `201 Created` | `401 Unauthorized`, `400 Bad Request` (Blank fullName, city, or state) |
| `GET` | `/api/addresses` | List all saved addresses for user | Required | Customer | None | None | `200 OK` | `401 Unauthorized` |
| `GET` | `/api/addresses/{addressId}` | Get address by ID | Required | Customer | `addressId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden` / `SecurityException` (Address belongs to another user), `404 Not Found` |
| `PUT` | `/api/addresses/{addressId}` | Update address | Required | Customer | `addressId` (UUID) | `{"fullName": "Aarav Sharma", "street": "Flat 405, Palm Heights", "addressLine2": "Green Valley", "city": "Bengaluru", "state": "Karnataka", "zipCode": "560001", "phone": "+919876543210", "isDefault": false}` | `200 OK` | `401 Unauthorized`, `403 Forbidden` (Belongs to another user), `404 Not Found` |
| `PATCH` | `/api/addresses/{addressId}/default` | Set address as default | Required | Customer | `addressId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `DELETE` | `/api/addresses/{addressId}` | Delete address | Required | Customer | `addressId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

---

## 6. Cart Module (`/api/cart`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/cart` | Add item to user cart | Required | Customer | None | `{"productId": "{{productId}}", "quantity": 2}` | `200 OK` | `401 Unauthorized`, `404 Not Found` (Product ID not found), `400 Bad Request` (Product out of stock, requested quantity > available inventory, quantity < 1) |
| `GET` | `/api/cart` | Get current user's cart items | Required | Customer | None | None | `200 OK` | `401 Unauthorized` |
| `PUT` | `/api/cart/{cartItemId}` | Update item quantity in cart | Required | Customer | `cartItemId` (UUID), optional `quantity` param or JSON body `{"quantity": 3}` | `{"quantity": 3}` | `401 Unauthorized`, `403 Forbidden` (Item belongs to another user), `404 Not Found`, `400 Bad Request` (Quantity < 1, insufficient stock) |
| `DELETE` | `/api/cart/{cartItemId}` | Remove single item from cart | Required | Customer | `cartItemId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `DELETE` | `/api/cart` | Clear entire cart | Required | Customer | None | None | `200 OK` | `401 Unauthorized` |

---

## 7. Wishlist Module (`/api/wishlist`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/wishlist/{productId}` | Add product to wishlist (idempotent) | Required | Customer | `productId` (UUID) | None | `200 OK` | `401 Unauthorized`, `404 Not Found` (Product not found) |
| `GET` | `/api/wishlist` | Get current user's wishlist | Required | Customer | None | None | `200 OK` | `401 Unauthorized` |
| `DELETE` | `/api/wishlist/{productId}` | Remove product from wishlist | Required | Customer | `productId` (UUID) | None | `200 OK` | `401 Unauthorized` |

---

## 8. Orders Module (`/api/orders`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Checkout cart & create order | Required | Customer | None | `{"addressId": "{{addressId}}", "paymentMethod": "COD"}` | `201 Created` | `401 Unauthorized`, `400 Bad Request` (Empty cart, address does not belong to user, insufficient inventory for cart items), `404 Not Found` (Address not found) |
| `GET` | `/api/orders` | Get user order history | Required | Customer | None | None | `200 OK` | `401 Unauthorized` |
| `GET` | `/api/orders/{orderId}` | Get order details by ID | Required | Customer | `orderId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden` (Order belongs to another user), `404 Not Found` |
| `POST` | `/api/orders/{orderId}/cancel` | Cancel order & restore inventory | Required | Customer | `orderId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request` (Order already cancelled, order already shipped or delivered) |
| `GET` | `/api/orders/admin` | View all customer orders | Required | `ROLE_ADMIN` | None | None | `200 OK` | `401 Unauthorized`, `403 Forbidden` (Non-admin customer) |
| `PUT` | `/api/orders/admin/{orderId}/status` | Update order fulfillment status | Required | `ROLE_ADMIN` | `orderId` (UUID), `status` (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request` (Invalid status string) |
| `PUT` | `/api/orders/admin/{orderId}/payment-status` | Update order payment status | Required | `ROLE_ADMIN` | `orderId` (UUID), `paymentStatus` (`PENDING`, `PAID`, `FAILED`) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request` (Invalid payment status) |

---

## 9. Product Reviews Module (`/api/products/{productId}/reviews` and `/api/reviews`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products/{productId}/reviews` | Get all reviews for a product | Public | None | `productId` (UUID) | None | `200 OK` | `404 Not Found` (Product ID does not exist) |
| `POST` | `/api/products/{productId}/reviews` | Submit product review | Required | Customer | `productId` (UUID) | `{"rating": 5, "comment": "Outstanding quality, very fresh and crunchy!"}` | `201 Created` | `401 Unauthorized`, `404 Not Found` (Product not found), `400 Bad Request` (Duplicate review by same user for product, rating < 1 or > 5, blank comment) |
| `PUT` | `/api/reviews/{reviewId}` | Edit own review | Required | Customer | `reviewId` (UUID) | `{"rating": 4, "comment": "Updated review comment"}` | `200 OK` | `401 Unauthorized`, `403 Forbidden` (Review belongs to someone else), `404 Not Found`, `400 Bad Request` (Invalid rating, blank comment) |
| `DELETE` | `/api/reviews/{reviewId}` | Delete own review | Required | Customer | `reviewId` (UUID) | None | `200 OK` | `401 Unauthorized`, `403 Forbidden` (Cannot delete another user's review), `404 Not Found` |

---

## 10. Design & HTML View Controller (`/design/*` and `/`)

| Method | Endpoint | Purpose | Auth | Role | Query / Path Params | Request Body Example | Success Status | Important Failure Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Serve storefront home HTML template | Public | None | None | None | `200 OK` | None |
| `GET` | `/design/{page}` | Serve dynamic Thymeleaf template | Public / Admin | `ROLE_ADMIN` if `page` starts with `vilora_admin_` | `page` (String) | None | `200 OK` | `403 Forbidden` (Accessing admin template without `ROLE_ADMIN`) |
