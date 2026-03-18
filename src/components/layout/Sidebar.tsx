import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  // Home,
  FileText,
  User,
  Bell,
  Settings,
  ShieldCheck,
  X,
  Plus,
  ScrollText,
  Home,
  Compass,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <Home size={20} />, path: "/" },
  { label: "Discover",      icon: <Compass size={20} />,     path: "/discover"      },
  { label: "Create Post", icon: <Plus size={20} />, path: "/posts/create" },
  { label: "Pages", icon: <FileText size={20} />, path: "/pages" },
  { label: "My Posts", icon: <ScrollText size={20} />, path: "/my-posts" },
  { label: "Profile", icon: <User size={20} />, path: "/profile" },
  { label: "Notifications", icon: <Bell size={20} />, path: "/notifications" },
  { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  { label: "Account", icon: <ShieldCheck size={20} />, path: "/account" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />

          {/* ── Drawer ── */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-black border-r border-zinc-900 z-50 flex flex-col"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-12 pb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F7C12B] flex items-center justify-center">
                  <span className="text-black font-black text-sm">Y</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">
                  Yummy
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* ── Nav Items ── */}
            <nav className="flex flex-col gap-1 px-3 flex-1">
              {NAV_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.path;

                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-200 text-left w-full ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                    }`}
                  >
                    <span
                      className={isActive ? "text-[#F7C12B]" : "text-zinc-500"}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>

                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="ml-auto w-1 h-5 rounded-full bg-[#F7C12B]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* ── Bottom ── */}
            <div className="px-5 pb-10 pt-4 border-t border-zinc-900">
              <p className="text-zinc-600 text-xs">Yummy © 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
