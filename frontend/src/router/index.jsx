import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Customer Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import CategoryPage from '../pages/CategoryPage';
import ProductDetail from '../pages/ProductDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderConfirmation from '../pages/OrderConfirmation';
import Account from '../pages/Account';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';
import OrderDetail from '../pages/OrderDetail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import PolicyPage from '../pages/PolicyPage';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';

const router = createBrowserRouter([
  // Public Storefront Routes
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/shop',
    element: <Shop />,
  },
  {
    path: '/search',
    element: <Shop />,
  },
  {
    path: '/category/:id',
    element: <CategoryPage />,
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/order-confirmation/:id',
    element: (
      <ProtectedRoute>
        <OrderConfirmation />
      </ProtectedRoute>
    ),
  },

  // Customer Account Routes (Protected)
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <Account defaultTab="profile" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/addresses',
    element: (
      <ProtectedRoute>
        <Account defaultTab="addresses" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/orders',
    element: (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/orders/:id',
    element: (
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/order/:id',
    element: (
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/wishlist',
    element: (
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    ),
  },

  // Essential Static & Policy Routes
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/privacy-policy',
    element: <PolicyPage />,
  },
  {
    path: '/terms',
    element: <PolicyPage />,
  },
  {
    path: '/shipping-policy',
    element: <PolicyPage />,
  },
  {
    path: '/return-refund-policy',
    element: <PolicyPage />,
  },
  {
    path: '/faq',
    element: <PolicyPage />,
  },

  // Admin Portal Routes
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'products',
        element: <AdminProducts />,
      },
      {
        path: 'categories',
        element: <AdminCategories />,
      },
      {
        path: 'orders',
        element: <AdminOrders />,
      },
    ],
  },

  // Error & Fallback Routes
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
