import { create } from 'zustand';
import { cartApi } from '../api/apiClient';
import useAuthStore from './useAuthStore';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchCart: async () => {
    if (!useAuthStore.getState().isLoggedIn()) {
      set({ items: [], loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await cartApi.getCart();
      const rawData = response.data?.data || [];
      const mappedItems = rawData.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName || 'Product',
        price: Number(item.productPrice || 0),
        image: item.productImage || '',
        quantity: item.quantity || 1,
        itemTotal: Number(item.itemTotal || (Number(item.productPrice || 0) * (item.quantity || 1))),
      }));
      set({ items: mappedItems, loading: false });
    } catch (error) {
      console.warn('Error fetching cart:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  addItem: async (productOrId, quantity = 1) => {
    if (!useAuthStore.getState().isLoggedIn()) {
      return { success: false, requireAuth: true, message: 'Please sign in to add items to your cart' };
    }
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;
    set({ loading: true, error: null });
    try {
      await cartApi.addItem(productId, quantity);
      await get().fetchCart();
      return { success: true, message: 'Added to cart successfully' };
    } catch (error) {
      const msg = error.message || 'Could not add item to cart';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  updateQty: async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return get().removeItem(cartItemId);
    }
    set({ loading: true, error: null });
    try {
      await cartApi.updateQuantity(cartItemId, quantity);
      await get().fetchCart();
      return { success: true };
    } catch (error) {
      const msg = error.message || 'Could not update item quantity';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  removeItem: async (cartItemId) => {
    set({ loading: true, error: null });
    try {
      await cartApi.removeItem(cartItemId);
      await get().fetchCart();
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      const msg = error.message || 'Could not remove item';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await cartApi.clearCart();
      set({ items: [], loading: false });
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      const msg = error.message || 'Could not clear cart';
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  cartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.itemTotal || item.price * item.quantity), 0);
  },

  cartCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;
