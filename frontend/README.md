# VILORA Organic Essentials - Frontend

Premium organic e-commerce platform built with React 18 + Vite + Tailwind CSS.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first styling
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **Framer Motion** - Smooth animations
- **React Hot Toast** - Beautiful notifications
- **Swiper** - Touch slider
- **Headless UI** - Unstyled accessible components
- **React Icons** - Icon library

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   └── ScrollToTop.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Account.jsx
│   │   ├── Orders.jsx
│   │   ├── Wishlist.jsx
│   │   ├── OrderDetail.jsx
│   │   └── NotFound.jsx
│   ├── router/         # Route configuration
│   │   └── index.jsx
│   ├── store/          # Zustand stores
│   │   ├── useAuthStore.js
│   │   ├── useCartStore.js
│   │   └── useWishlistStore.js
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Custom Theme

### Colors
- **Forest**: `#1A3C34` (primary dark)
- **Forest Deep**: `#0F2A24` (darker variant)
- **Gold**: `#C9963C` (accent)
- **Gold Light**: `#E8B84B` (lighter accent)
- **Cream**: `#FDF8F0` (background)
- **Sage**: `#E3EDE9` (light neutral)
- **Pale Gold**: `#F5E9CC` (light warm)

### Fonts
- **Display**: Cormorant Garamond (headings)
- **Sans**: DM Sans (body text)
- **Mono**: JetBrains Mono (code)

### Border Radius
- **xl**: 12px
- **2xl**: 16px
- **pill**: 100px

## Routes

### Public Routes
- `/` - Home
- `/shop` - Product listing
- `/product/:id` - Product detail
- `/login` - Login
- `/register` - Register
- `/cart` - Shopping cart
- `/checkout` - Checkout

### Protected Routes (require authentication)
- `/account` - User account dashboard
- `/account/orders` - Order history
- `/account/wishlist` - Saved items
- `/order/:id` - Order detail

### Other
- `/404` - Not found page
- `*` - Redirects to 404

## State Management

### Auth Store (`useAuthStore`)
```javascript
const { user, token, login, logout, isLoggedIn } = useAuthStore();
```

### Cart Store (`useCartStore`)
```javascript
const { items, addItem, removeItem, updateQty, clearCart, cartTotal, cartCount } = useCartStore();
```

### Wishlist Store (`useWishlistStore`)
```javascript
const { items, addItem, removeItem, isWishlisted } = useWishlistStore();
```

## API Configuration

The Vite dev server is configured to proxy API requests to `http://localhost:8080`:

```javascript
// Any request to /api/* will be forwarded to the backend
axios.get('/api/products') // → http://localhost:8080/api/products
```

## Next Steps

All placeholder pages are ready. You can now:
1. Build out individual page components
2. Create reusable UI components (Button, Card, Input, etc.)
3. Implement API integration with Axios
4. Add authentication flow
5. Build product catalog and filtering
6. Implement cart and checkout logic
