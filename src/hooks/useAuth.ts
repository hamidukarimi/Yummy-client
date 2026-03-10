import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import useAuthStore from "@/store/authStore";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isInitializing, restoreSession } = context;

  return {
    user,
    isAuthenticated,
    isInitializing,
    restoreSession,
  };
};

export default useAuth;