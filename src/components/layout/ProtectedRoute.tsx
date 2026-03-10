import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

// ─── Persists across route changes ───────────────────────────────────────────
let sessionChecked = false;

// ─── Component ────────────────────────────────────────────────────────────────

const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing, restoreSession } = useAuth();

  useEffect(() => {
    if (sessionChecked) return;
    sessionChecked = true;
    void restoreSession();
  }, [restoreSession]);

  // Still waiting for session check — show spinner, never redirect yet
  if (!sessionChecked || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;