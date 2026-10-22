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

## ☁️ Deploying Backend on Render (Docker Runtime)

Follow this step-by-step guide to deploy the Vilora Naturals Spring Boot backend to **Render** using the provided `Dockerfile`.

### 1. Create a New Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository (`Vilora` or `Vilora-E-commerce-Platform`).
4. Configure the following service settings:
   - **Name**: `vilora-backend` (or your chosen name)
   - **Region**: Select the region closest to your Supabase project (e.g., *Singapore*, *Frankfurt*, *Oregon*).
   - **Branch**: `main`
   - **Root Directory**: Leave blank (defaults to repository root where `Dockerfile` and `pom.xml` reside).
   - **Runtime**: **Docker** *(Render detects the root `Dockerfile` automatically)*.
   - **Instance Type**: **Free** (or Starter/Standard).

### 2. Configure Environment Variables in Render
In the **Environment** section of your Render Web Service creation page (or under the **Environment** tab of an existing service), add the following environment variable keys and your real values:

| Environment Variable | Required | Description / Example |
| :--- | :---: | :--- |
| `PORT` | Optional | Set to `10000` *(Render sets this automatically)* |
| `SUPABASE_URL` | **Yes** | Your Supabase project URL (`https://your-project-ref.supabase.co`) |
| `SUPABASE_KEY` | **Yes** | Supabase `service_role` key (or `anon` key) for server data access |
| `SUPABASE_BUCKET_NAME` | **Yes** | Supabase Storage bucket for product images (`product-images`) |
| `JWT_SECRET` | **Yes** | 64+ char HMAC-SHA-512 hex/base64 key |
| `JWT_EXPIRATION_MS` | **Yes** | Token lifetime in ms (e.g., `86400000` for 24h) |
| `CORS_ALLOWED_ORIGINS` | **Yes** | Your Vercel frontend URL (e.g., `https://vilora.vercel.app`) |
| `FRONTEND_URL` | Optional | Same as `CORS_ALLOWED_ORIGINS` |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional | Seed admin email (e.g., `admin@viloranaturals.com`) |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | Seed admin password |
| `ADMIN_BOOTSTRAP_NAME` | Optional | Seed admin name (e.g., `Vilora Administrator`) |

> [!NOTE]
> Render provides secure environment variable storage. Never commit real keys or secrets to Git.

### 3. Advanced Settings (Health Check)
Expand the **Advanced** section:
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: **Yes** (deploys automatically on new pushes to `main`).

Click **Create Web Service**. Render will build the Docker container and start your Spring Boot application.

---

## 🔗 Connecting Your Vercel Frontend to Render

Your frontend is hosted on **Vercel**. To connect it to your newly deployed Render backend:

1. Go to your **Vercel Dashboard** and open your Vilora project.
2. Navigate to **Settings** ➔ **Environment Variables**.
3. Add or update the variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-service-name.onrender.com` *(replace with your actual Render URL, without a trailing slash)*
4. Click **Save** and trigger a **Redeploy** on Vercel so the production bundle builds with the Render backend URL.

---

## 🔍 Testing & Verifying the Deployed API

Once Render completes deployment (status shows **Live**), test the following endpoints in your browser, terminal, or Postman:

### 1. Health Check
```bash
curl -X GET https://your-service-name.onrender.com/api/health
```
Expected response (`HTTP 200 OK`):
```json
{
  "service": "Vilora Naturals API",
  "status": "UP",
  "timestamp": 1729573800000
}
```

### 2. Public Catalog Verification
```bash
curl -X GET https://your-service-name.onrender.com/api/products
```
Expected response: Array of active products with prices, stock levels, and category data.

### 3. Customer Authentication
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"skandchaubey03@gmail.com","password":"Admin@123456"}'
```
Expected response: Returns JWT authentication token and `ROLE_ADMIN` permissions.

---

## 🛠️ Common Deployment Troubleshooting

### 1. Free-Tier Cold Starts
- **Symptom**: The first API call takes 30-50 seconds to respond.
- **Cause**: Render's free tier spins down inactive web services after 15 minutes of inactivity.
- **Solution**: The backend automatically recovers on the first request. The frontend Axios client is configured with a 15-second timeout and retry awareness.

### 2. CORS Errors in the Browser Console
- **Symptom**: `Access to XMLHttpRequest at '...' from origin 'https://your-app.vercel.app' has been blocked by CORS policy`.
- **Solution**: Ensure your Vercel URL is added to the `CORS_ALLOWED_ORIGINS` environment variable in your Render dashboard (e.g. `https://your-app.vercel.app`). Note that all `https://*.vercel.app` domains are allowed by default.

### 3. Supabase 401 / 404 Errors
- **Symptom**: Backend logs show `Supabase select [...] returned status 401`.
- **Solution**: Verify that `SUPABASE_KEY` in Render matches your active Supabase **service_role** or **anon** key from Supabase Dashboard > Project Settings > API.

### 4. Port Binding Issues (502 Bad Gateway)
- **Symptom**: Render deployment fails with `Timed out waiting for port`.
- **Solution**: Render assigns a random `PORT` environment variable (defaulting to 10000). The application is configured to automatically listen on `${PORT:-10000}`.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
