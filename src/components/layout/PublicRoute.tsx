import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

// ─── Component ────────────────────────────────────────────────────────────────

const PublicRoute = () => {
  const { isAuthenticated, isInitializing, restoreSession } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    void restoreSession();
  }, [restoreSession]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;