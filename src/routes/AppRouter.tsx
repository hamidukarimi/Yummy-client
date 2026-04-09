import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicRoute from "@/components/layout/PublicRoute";
import BottomNav from "@/components/layout/BottomNav";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import HomePage from "@/features/home/pages/HomePage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import CreatePagePage from "@/pages/CreatePagePage";
import PagePage from "@/pages/PagePage";
import MyPages from "@/pages/MyPagesPage";
import CreatePost from "@/pages/CreatePostPage";
import PostDetail from "@/pages/PostDetailPage";
import EditPost from "@/pages/EditPostPage";
import EditPage from "@/pages/EditPagePage";
import MyPosts from "@/pages/MyPostsPage";
import Notifications from "@/pages/NotificationsPage";
import Search from "@/pages/SearchPage";
import DiscoverPages from "@/pages/DiscoverPagesPage";
import Saved from "@/pages/SavedPage";
import EditProfile from "@/pages/EditProfilePage";
import ChangePassword from "@/pages/ChangePasswordPage";
import HomeNavbar from "@/components/layout/HomeNavbar";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
         <div className="sticky top-0 z-40 bg-black border-b border-zinc-900 lg:ml-[80px]">
        <HomeNavbar />
      </div>

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pages/create" element={<CreatePagePage />} />
              <Route path="/posts/create" element={<CreatePost />} />
              <Route path="/posts/:id/edit" element={<EditPost />} />
              <Route path="/pages/:slug/edit" element={<EditPage />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route
                path="/profile/change-password"
                element={<ChangePassword />}
              />
            </Route>

            {/* Page view is public */}
            <Route path="/pages" element={<MyPages />} />
            <Route path="/pages/:slug" element={<PagePage />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/discover" element={<DiscoverPages />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
