import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (userData, authToken) => {
        set({
          user: userData,
          token: authToken,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
        });
      },

      isLoggedIn: () => {
        const { token } = get();
        return !!token;
      },
    }),
    {
      name: 'vilora-auth-storage',
    }
  )
);

export default useAuthStore;
