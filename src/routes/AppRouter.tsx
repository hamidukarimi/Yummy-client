import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicRoute from "@/components/layout/PublicRoute";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import CreatePagePage from "@/pages/CreatePagePage";
import PagePage from "@/pages/PagePage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pages/create" element={<CreatePagePage />} />
            </Route>

            {/* Page view is public */}
            <Route path="/pages/:slug" element={<PagePage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppRouter;