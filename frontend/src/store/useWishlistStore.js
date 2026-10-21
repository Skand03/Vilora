import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '../api/apiClient';
import useAuthStore from './useAuthStore';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchWishlist: async () => {
        if (!useAuthStore.getState().isLoggedIn()) {
          return;
        }
        set({ loading: true, error: null });
        try {
          const response = await wishlistApi.getWishlist();
          const rawData = response.data?.data || [];
          const mappedItems = rawData.map((item) => ({
            id: item.id,
            productId: item.productId || item.id,
            name: item.productName || item.name || 'Product',
            price: Number(item.productPrice || item.price || 0),
            image: item.productImage || item.image || '',
            rating: Number(item.productRating || item.rating || 0),
            inStock: item.inStock !== false,
          }));
          set({ items: mappedItems, loading: false });
        } catch (error) {
          console.warn('Error fetching wishlist:', error.message);
          set({ loading: false, error: error.message });
        }
      },

      addItem: async (productOrId) => {
        const product = typeof productOrId === 'object' ? productOrId : { id: productOrId };
        const pId = product.productId || product.id;

        const currentItems = get().items;
        const exists = currentItems.some((item) => (item.productId || item.id) === pId);

        if (!exists) {
          const newItem = {
            id: product.id || pId,
            productId: pId,
            name: product.name || product.productName || 'Product',
            price: Number(product.price || product.productPrice || 0),
            image: product.image || product.productImage || '',
            rating: Number(product.rating || product.productRating || 0),
            inStock: product.inStock !== false,
          };
          // Optimistic local update
          set({ items: [...currentItems, newItem] });
        }

        // If authenticated, sync with backend database
        if (useAuthStore.getState().isLoggedIn()) {
          try {
            await wishlistApi.addItem(pId);
            await get().fetchWishlist();
          } catch (error) {
            console.warn('Could not sync wishlist with backend:', error.message);
          }
        }

        return { success: true, message: 'Added to wishlist' };
      },

      removeItem: async (productId) => {
        const pId = typeof productId === 'object' ? (productId.productId || productId.id) : productId;
        
        // Optimistic local update
        set((state) => ({
          items: state.items.filter((item) => (item.productId || item.id) !== pId),
        }));

        // If authenticated, sync with backend database
        if (useAuthStore.getState().isLoggedIn()) {
          try {
            await wishlistApi.removeItem(pId);
            await get().fetchWishlist();
          } catch (error) {
            console.warn('Could not remove wishlist item from backend:', error.message);
          }
        }

        return { success: true, message: 'Removed from wishlist' };
      },

      isWishlisted: (productId) => {
        const { items } = get();
        return items.some((item) => (item.productId || item.id) === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'vilora-wishlist-storage',
    }
  )
);

export default useWishlistStore;
