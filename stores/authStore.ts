import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isLineBrowser: boolean;
  isAuthenticated: boolean;
  user: {
    lineUserId?: string;
    lineUserName?: string;
    image?: string;
  } | null;
  setLineBrowser: (isLine: boolean) => void;
  setUser: (
    user: { lineUserId: string; lineUserName: string; image: string } | null,
  ) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLineBrowser: false,
      isAuthenticated: false,
      user: null,

      setLineBrowser: (isLine) => set({ isLineBrowser: isLine }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setAuthenticated: (authenticated) =>
        set({ isAuthenticated: authenticated }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLineBrowser: state.isLineBrowser,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
