import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell, Search, Mail, PlusCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useCreatePostModal } from "@/context/CreatePostModalContext";
import useUnreadCount from "@/features/notifications/hooks/useUnreadCount";
import useAuth from "@/hooks/useAuth";
import logo from "../../assets/yummy-logo.png";
import { useLocation } from "react-router-dom";

const HIDDEN_ON = [
  "/login",
  "/register",
  "/pages/create",
  "/posts/create",
  "/search",
];

const HomeNavbar = () => {
  const location = useLocation();

  const isPageEdit = /^\/pages\/[^/]+\/edit$/.test(location.pathname);
  // Search input state and handler
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search`, { state: { query: searchValue } });
    }
  };
  const isPostEdit = /^\/posts\/[^/]+\/edit$/.test(location.pathname);
  const isPostDetail = /^\/posts\/[^/]+$/.test(location.pathname);
  // const isPageView = /^\/pages\/[^/]+$/.test(location.pathname);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const hasAttempted = useRef(false);
  const { user, isInitializing, restoreSession } = useAuth();
  const { openModal } = useCreatePostModal();
  const unreadCount = useUnreadCount(!!user);

  const handleCreatePost = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      openModal();
      return;
    }
    navigate("/posts/create");
  };

  useEffect(() => {
    if (!hasAttempted.current && !user && !isInitializing) {
      hasAttempted.current = true;
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  if (
    HIDDEN_ON.includes(location.pathname) ||
    isPageEdit ||
    isPostEdit ||
    isPostDetail
  )
    return null;

  return (
    <>
      {/* 1. Pass the onOpen prop here to allow Sidebar to open itself from the mini-state */}
      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Wrapper: Black background for the full width */}
      <nav className=" bg-black text-white px-4 pt-3 pb-3 md:px-8 md:py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* LEFT: Menu + Logo */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)} // This handles the mobile/navbar menu button
              className="w-9 h-9 flex lg:hidden items-center justify-center text-white cursor-pointer"
            >
              <Menu size={22} />
            </motion.button>

            {/* "Yummy" Text: ONLY visible on md: and up */}
            <div className="hidden md:flex items-center justify-center ">
              <img src={logo} alt="Yummy Logo" className="w-24 " />
            </div>
          </div>
          {/* CENTER: Search Bar */}
          <div className="hidden lg:flex flex-grow max-w-2xl mx-10">
            <div className="relative w-full flex items-center">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Yummy..."
                className="w-full bg-transparent border border-[#F7C12B] rounded-full py-2 pl-12 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#F7C12B]"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    handleSearch();
                  }
                }}
              />
              {/* <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#F7C12B] text-black rounded-full px-3 py-1 font-semibold text-xs hover:bg-yellow-400 transition"
                onClick={handleSearch}
                aria-label="Search"
                type="button"
                disabled={!searchValue.trim()}
              >
                Search
              </button> */}
            </div>
          </div>{" "}
          {/* Added this closing div */}
          {/* RIGHT: Desktop Icons (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/messages")}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Mail size={22} />
            </button>

            <button
              onClick={handleCreatePost}
              className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-white/12 transition cursor-pointer"
            >
              <PlusCircle size={22} />
              <span className="text-sm font-medium">Create</span>
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/notifications")}
              className="cursor-pointer relative hover:opacity-80 transition-opacity"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F7C12B] flex items-center justify-center">
                  <span className="text-black font-bold text-[10px] leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </motion.button>

            {/* Profile Avatar */}
            <div
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-600 cursor-pointer hover:border-[#F7C12B] transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                  <span className="text-xs">🐘</span>
                </div>
              )}
            </div>
          </div>
          {/* MOBILE RIGHT: Notification Icon */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 flex items-center justify-center text-white relative cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F7C12B] flex items-center justify-center">
                  <span className="text-black font-bold text-xs leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HomeNavbar;
