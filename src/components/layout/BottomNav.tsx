import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Mail, User, Compass } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const HIDDEN_ON = [
  "/login",
  "/register",
  "/pages/create",
  "/posts/create",
  "/search",
];

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Messages", path: "/messages", icon: Mail },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "Profile", path: "/profile", icon: User },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isPageView = /^\/pages\/[^/]+$/.test(location.pathname);
  const isPostDetail = /^\/posts\/[^/]+$/.test(location.pathname);
  const isPostEdit = /^\/posts\/[^/]+\/edit$/.test(location.pathname);
  const isPageEdit = /^\/pages\/[^/]+\/edit$/.test(location.pathname);

  if (
    HIDDEN_ON.includes(location.pathname) ||
    // isPageView ||
    isPostDetail ||
    isPostEdit ||
    isPageEdit
  )
    return null;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-900 lg:hidden"
    >
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          // Special case for home — only active on exact "/"
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer"
              aria-label={item.label}
            >
              <Icon
                size={24}
                className="transition-colors duration-200"
                color={isActive ? "#F7C12B" : "#71717a"}
                fill={isActive ? "#F7C12B" : "none"}
                strokeWidth={isActive ? 2 : 1.5}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
