import axios from 'axios';

// Resolve base URL from environment
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999';
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const API_BASE_URL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem('vilora-auth-storage');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        const token = parsed?.state?.token;
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('Failed to parse auth token from localStorage', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Token expired or invalid: clear invalid storage and emit logout event
      const storedAuth = localStorage.getItem('vilora-auth-storage');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.state?.token) {
            console.warn('Session expired or unauthorized. Clearing authentication.');
            window.dispatchEvent(new CustomEvent('vilora:unauthorized'));
          }
        } catch (_) {}
      }
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data?.data || null,
      originalError: error,
    });
  }
);

/* ==========================================================================
   API Service Methods
   ========================================================================== */

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
};

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

export const productsApi = {
  getAll: () => apiClient.get('/products'),
  search: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/products/search${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addImageUrl: (id, imageUrl) => apiClient.post(`/products/${id}/images`, { imageUrl }),
  removeImageUrl: (id, imageUrl) =>
    apiClient.delete(`/products/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}`),
};

export const addressesApi = {
  getAll: () => apiClient.get('/addresses'),
  getById: (id) => apiClient.get(`/addresses/${id}`),
  create: (data) => apiClient.post('/addresses', data),
  update: (id, data) => apiClient.put(`/addresses/${id}`, data),
  setDefault: (id) => apiClient.patch(`/addresses/${id}/default`),
  delete: (id) => apiClient.delete(`/addresses/${id}`),
};

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (productId, quantity = 1) => apiClient.post('/cart', { productId, quantity }),
  updateQuantity: (cartItemId, quantity) =>
    apiClient.put(`/cart/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => apiClient.delete(`/cart/${cartItemId}`),
  clearCart: () => apiClient.delete('/cart'),
};

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  addItem: (productId) => apiClient.post(`/wishlist/${productId}`),
  removeItem: (productId) => apiClient.delete(`/wishlist/${productId}`),
};

export const ordersApi = {
  createOrder: (payload) => apiClient.post('/orders', payload),
  getMyOrders: () => apiClient.get('/orders'),
  getOrderById: (orderId) => apiClient.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => apiClient.post(`/orders/${orderId}/cancel`),
  // Admin Endpoints
  getAdminOrders: () => apiClient.get('/orders/admin'),
  updateStatus: (orderId, status) =>
    apiClient.put(`/orders/admin/${orderId}/status?status=${encodeURIComponent(status)}`),
  updatePaymentStatus: (orderId, paymentStatus) =>
    apiClient.put(`/orders/admin/${orderId}/payment-status?paymentStatus=${encodeURIComponent(paymentStatus)}`),
};

export const reviewsApi = {
  getProductReviews: (productId) => apiClient.get(`/products/${productId}/reviews`),
  submitReview: (productId, reviewData) => apiClient.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (reviewId, reviewData) => apiClient.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};

export { API_BASE_URL };
export default apiClient;
