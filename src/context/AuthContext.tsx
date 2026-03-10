import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/api/axios";
import { setToken, removeToken } from "@/utils/token";
import useAuthStore from "@/store/authStore";
import type { ApiResponse, AuthData } from "@/types/api.types";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  isInitializing: boolean;
  restoreSession: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>({
  isInitializing: false,
  restoreSession: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const restoreSession = useCallback(async () => {
    setIsInitializing(true);
    try {
      const response = await api.post<ApiResponse<AuthData>>("/api/token");
      const { accessToken, user } = response.data.data;
      setToken(accessToken);
      setUser(user);
    } catch {
      removeToken();
      clearAuth();
    } finally {
      setIsInitializing(false);
    }
  }, [setUser, clearAuth]);

  useEffect(() => {
    const handleForcedLogout = () => {
      removeToken();
      clearAuth();
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ isInitializing, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};