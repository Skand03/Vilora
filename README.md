# 🌿 Vilora Naturals — Full-Stack E-Commerce Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%2B-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgREST%20%2B%20Storage-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**Vilora Naturals** is an enterprise-grade, production-ready e-commerce web application specialized in premium organic dry fruits, nuts, berries, seeds, and curated gift hampers. 

Built with a high-performance **React 18 + Vite** frontend and a robust **Spring Boot 3.5.5** backend connected directly to **Supabase (PostgreSQL + PostgREST + Storage)**.

---

## 🌟 Key Highlights & Features

### 🛒 Customer Storefront
- **Modern Organic UI/UX**: Designed with a luxury botanical palette (forest green, warm gold, cream), fluid micro-animations, glassmorphism, and responsive layouts across mobile, tablet, and desktop.
- **Interactive Product Catalog**: Instant multi-category filtering, keyword search, price range filter, organic filter, stock filter, and multi-criteria sorting (price, rating, newest).
- **Persistent Wishlist**: Real-time optimistic wishlist toggle (0ms UI latency) with auto-sync to backend and local storage persistence.
- **Cart & Dynamic Inventory Management**: Real-time stock validation, quantity adjusters, subtotal calculation, free shipping threshold progress, and promo codes.
- **Multi-Step Checkout**: Saved addresses, delivery address management, payment method selection (Razorpay / COD / Card), order placement, and automatic stock deduction.
- **Customer Account & Order History**: Comprehensive customer dashboard to track order statuses, view historical purchases, itemized receipts, and manage profile/addresses.
- **Product Reviews & Ratings**: Verified customer ratings and feedback system with 5-star scoring and automated average rating recalculation.

### 🛡️ Administrative Portal (`/admin`)
- **Admin Dashboard**: Live metrics for revenue, total orders, active inventory, and top categories.
- **Order Management**: Real-time status pipeline transitions (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` / `CANCELLED`) and payment status updates.
- **Product Catalog Management**: Add, update, deactivate products, adjust live stock levels, and upload product images to Supabase Storage.
- **Category Control**: Create, edit, and organize product categories.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│              Client Browser (React 18 SPA)             │
│  - Vite + React Router DOM + Tailwind CSS              │
│  - Zustand State (Auth, Cart, Wishlist)                │
│  - Lucide Icons + Heroicons                            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (Axios)
                            ▼
┌────────────────────────────────────────────────────────┐
│           Spring Boot 3.5.5 Backend (Java 21)          │
│  - Spring Security + Stateless JWT Authentication      │
│  - BCrypt Password Hashing                             │
│  - Role-Based Access Control (ROLE_CUSTOMER, ROLE_ADMIN)│
│  - REST Controllers & DTO Validation                   │
│  - HttpClient + Jackson Custom SupabaseClient           │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / PostgREST & S3 API
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Cloud                       │
│  - PostgreSQL Database (public schema)                 │
│  - PostgREST REST API Layer                            │
│  - Supabase Storage Bucket ('product-images')          │
└────────────────────────────────────────────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Zustand, Axios, Lucide React |
| **Backend** | Spring Boot 3.5.5, Java 21, Spring Security, jjwt (0.11.5), Lombok |
| **Database & Storage** | Supabase PostgreSQL, Supabase PostgREST REST API, Supabase Storage |
| **Authentication** | Stateless JWT (HS512), BCrypt (Strength 12) |
| **Testing & Tooling** | JUnit 5, Mockito, Postman Collection v2.1, Maven |

---

## 📁 Repository Directory Structure

```text
Vilora/
├── frontend/                          # React + Vite Frontend Application
│   ├── src/
│   │   ├── api/apiClient.js           # Central Axios client with interceptors
│   │   ├── components/                # Reusable UI components & layouts
│   │   │   ├── layout/Navbar.jsx      # Sticky responsive navigation & search
│   │   │   ├── layout/Footer.jsx      # Storefront footer & policy links
│   │   │   ├── ui/ProductCard.jsx     # Product showcase card with instant wishlist
│   │   │   └── AdminRoute.jsx         # RBAC guard for admin routes
│   │   ├── pages/                     # Application views
│   │   │   ├── Home.jsx               # Hero, highlights, featured categories
│   │   │   ├── Shop.jsx               # Catalog with multi-filter and sort
│   │   │   ├── ProductDetail.jsx      # Product specs, gallery, reviews
│   │   │   ├── Cart.jsx               # Shopping cart & stock check
│   │   │   ├── Checkout.jsx           # Multi-step checkout & address selector
│   │   │   ├── Wishlist.jsx           # Saved items collection
│   │   │   ├── Orders.jsx             # Order history
│   │   │   ├── OrderDetail.jsx        # Order breakdown & status timeline
│   │   │   ├── Account.jsx            # User profile & address book
│   │   │   ├── Login.jsx              # Customer login
│   │   │   ├── Register.jsx           # Customer registration
│   │   │   └── admin/                 # Admin management views
│   │   │       ├── AdminDashboard.jsx # Analytics & KPIs
│   │   │       ├── AdminOrders.jsx    # Order fulfillment pipeline
│   │   │       ├── AdminProducts.jsx  # Inventory CRUD
│   │   │       └── AdminCategories.jsx# Category manager
│   │   ├── store/                     # Zustand state management
│   │   └── router/index.jsx           # Application routing configuration
│   ├── package.json
│   └── vite.config.js
├── src/main/java/com/org/vilora/      # Spring Boot Backend
│   ├── client/SupabaseClient.java     # Direct HTTP PostgREST integration
│   ├── config/                        # SecurityConfig, JwtUtils, AdminBootstrap
│   ├── controller/                    # REST API Controllers (10 controllers)
│   ├── dto/                           # Request & Response DTOs
│   ├── entity/                        # Domain entities
│   ├── repository/                    # Data access layer
│   └── service/                       # Business logic services
├── src/main/resources/
│   └── application.properties         # Backend configuration & environment bindings
├── postman/                           # Importable Postman Collection & Environments
├── docs/                              # Full API inventory & specifications
├── supabase_schema.sql                # Complete PostgreSQL DDL & initial seeds
├── pom.xml                            # Maven dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java Development Kit (JDK) 21** or higher
- **Node.js 18.x** or higher and **npm 9+**
- **Maven 3.8+** (or use the included `./mvnw` wrapper)

---

### 2. Configure Environment

The backend reads settings from `src/main/resources/application.properties` with fallback defaults. You can override them using environment variables:

```bash
# Server port
PORT=9999

# Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-or-anon-key
SUPABASE_BUCKET_NAME=product-images

# JWT Security
JWT_SECRET=your-256-bit-or-512-bit-secret-key
JWT_EXPIRATION_MS=86400000

# Admin Bootstrap Credentials
ADMIN_BOOTSTRAP_EMAIL=skandchaubey03@gmail.com
ADMIN_BOOTSTRAP_PASSWORD=Admin@123456
ADMIN_BOOTSTRAP_NAME=Skand Chaubey
```

---

### 3. Setup Supabase Database
Run the schema script in your Supabase SQL Editor:
```sql
-- Located in the root directory:
supabase_schema.sql
```
This creates all tables (`users`, `categories`, `products`, `addresses`, `cart_items`, `wishlist_items`, `orders`, `order_items`, `reviews`) and initial seed data.

---

### 4. Run Backend Server

```bash
# From repository root:
# Windows (PowerShell / CMD)
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```
The backend starts at: `http://localhost:9999`

---

### 5. Run Frontend Development Server

```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
The customer storefront and admin dashboard will be live at: `http://localhost:3000`

---

## 🔑 Default Administrator Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `skandchaubey03@gmail.com` | `Admin@123456` | Full Store & Portal Access (`ROLE_ADMIN`) |
| **System Admin** | `skandchaubey@gmail.com` | `Admin@123456` | Full Store & Portal Access (`ROLE_ADMIN`) |
| **Store Manager**| `admin@viloranaturals.com` | `AdminSecurePassword123!` | Full Store & Portal Access (`ROLE_ADMIN`) |

*Access the Admin Portal by signing in and navigating to [`http://localhost:3000/admin`](http://localhost:3000/admin).*

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Customer/Admin | Fetch current authenticated user profile |

### 🥜 Products & Search (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List all active products |
| `GET` | `/api/products/{id}` | Public | Get product details by ID |
| `GET` | `/api/products/search` | Public | Multi-category filter, search, sort & pagination |
| `POST` | `/api/products` | Admin | Create a new product |
| `PUT` | `/api/products/{id}` | Admin | Update product details & inventory |
| `DELETE` | `/api/products/{id}` | Admin | Deactivate/delete a product |
| `POST` | `/api/products/{id}/images` | Admin | Attach product image URL |
| `DELETE` | `/api/products/{id}/images` | Admin | Remove product image URL |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all active categories |
| `GET` | `/api/categories/{id}` | Public | Get category details |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PUT` | `/api/categories/{id}` | Admin | Update existing category |
| `DELETE` | `/api/categories/{id}` | Admin | Deactivate category |

### 🛍️ Cart & Wishlist (`/api/cart`, `/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | Get customer's cart items |
| `POST` | `/api/cart` | Customer | Add product to cart (stock verified) |
| `PUT` | `/api/cart/{cartItemId}` | Customer | Update quantity |
| `DELETE` | `/api/cart/{cartItemId}` | Customer | Remove item from cart |
| `DELETE` | `/api/cart` | Customer | Clear cart |
| `GET` | `/api/wishlist` | Customer | Get customer's wishlist items |
| `POST` | `/api/wishlist/{productId}` | Customer | Add product to wishlist |
| `DELETE` | `/api/wishlist/{productId}` | Customer | Remove product from wishlist |

### 📦 Orders & Checkout (`/api/orders`, `/api/admin/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Create order, deduct inventory, clear cart |
| `GET` | `/api/orders` | Customer | Retrieve customer order history |
| `GET` | `/api/orders/{id}` | Customer | Get itemized order details |
| `POST` | `/api/orders/{id}/cancel` | Customer | Cancel pending order & restore inventory |
| `GET` | `/api/admin/orders` | Admin | View all customer orders across store |
| `PUT` | `/api/admin/orders/{id}/status` | Admin | Update fulfillment status |
| `PUT` | `/api/admin/orders/{id}/payment-status` | Admin | Update payment status |

### ⭐ Reviews & Ratings (`/api/products/{productId}/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/{productId}/reviews` | Public | List reviews for product |
| `POST` | `/api/products/{productId}/reviews` | Customer | Submit review (1 per customer per product) |
| `PUT` | `/api/reviews/{reviewId}` | Customer | Edit customer's review |
| `DELETE` | `/api/reviews/{reviewId}` | Customer | Remove customer's review |

---

## 📮 Postman Collection

Import the included files located in the `postman/` directory directly into Postman:
- **Collection**: `postman/Vilora_Naturals_API.postman_collection.json`
- **Environment**: `postman/Vilora_Local.postman_environment.json`

Includes automated test scripts that capture JWT tokens upon login and automatically populate `{{authToken}}` across all authenticated requests.

---

## 🧪 Testing & Quality Assurance

```bash
# Run backend compilation & verification
.\mvnw.cmd test-compile

# Build frontend production bundle
cd frontend
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
