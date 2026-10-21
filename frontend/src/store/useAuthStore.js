import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userApi } from '../api/apiClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      loginUser: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { data } = response.data;
          set({
            user: {
              id: data.id,
              fullName: data.fullName,
              email: data.email,
              role: data.role,
            },
            token: data.token,
            loading: false,
          });
          return { success: true, data };
        } catch (error) {
          const message = error.message || 'Login failed. Please check your credentials.';
          set({ error: message, loading: false });
          return { success: false, message };
        }
      },

      registerUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.register(userData);
          const { data } = response.data;
          set({
            user: {
              id: data.id,
              fullName: data.fullName,
              email: data.email,
              role: data.role,
            },
            token: data.token,
            loading: false,
          });
          return { success: true, data };
        } catch (error) {
          const message = error.message || 'Registration failed.';
          set({ error: message, loading: false });
          return { success: false, message };
        }
      },

      fetchProfile: async () => {
        if (!get().token) return null;
        try {
          const response = await userApi.getProfile();
          const profile = response.data.data;
          set((state) => ({
            user: {
              ...state.user,
              ...profile,
            },
          }));
          return profile;
        } catch (error) {
          console.warn('Could not fetch user profile', error);
          return null;
        }
      },

      logout: () => {
        try {
          authApi.logout().catch(() => {});
        } catch (_) {}
        set({ user: null, token: null, error: null });
      },

      logoutUser: () => {
        get().logout();
      },

      isLoggedIn: () => {
        return !!get().token;
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === 'ROLE_ADMIN';
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vilora-auth-storage',
    }
  )
);

// Listen for global 401 unauthorized events from apiClient
if (typeof window !== 'undefined') {
  window.addEventListener('vilora:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;
