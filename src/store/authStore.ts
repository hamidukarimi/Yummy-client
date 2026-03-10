import { create } from "zustand";
import type { ApiUser } from "@/types/api.types";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: ApiUser) => void;
  clearAuth: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: ApiUser) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));

export default useAuthStore;