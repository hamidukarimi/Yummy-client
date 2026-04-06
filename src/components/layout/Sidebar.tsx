import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  User,
  Bell,
  Settings,
  ShieldCheck,
  X,
  Plus,
  ScrollText,
  Bookmark,
  Menu,
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
  { label: "Home",          icon: <Home size={20} />,       path: "/"              },
  { label: "Saved",         icon: <Bookmark size={20} />,   path: "/saved"         },
  { label: "Create Post",   icon: <Plus size={20} />,       path: "/posts/create"  },
  { label: "Pages",         icon: <FileText size={20} />,   path: "/pages"      },
  { label: "My Posts",      icon: <ScrollText size={20} />, path: "/my-posts"      },
  { label: "Profile",       icon: <User size={20} />,       path: "/profile"       },
  { label: "Notifications", icon: <Bell size={20} />,       path: "/notifications" },
  { label: "Settings",      icon: <Settings size={20} />,   path: "/settings"      },
  { label: "Account",       icon: <ShieldCheck size={20} />,path: "/account"       },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [desktopExpanded, setDesktopExpanded] = useState(true);

  // Lock body scroll on mobile when open
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) onClose();
    setTimeout(() => navigate(path), isMobile ? 200 : 0);
  };

  return (
    <>
      {/* ── Mobile sidebar (< lg) ── */}
      <div className="lg:hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              />

              {/* Drawer */}
              <motion.div
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-72 bg-black border-r border-zinc-900 z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-12 pb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F7C12B] flex items-center justify-center">
                      <span className="text-black font-black text-sm">Y</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">Yummy</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Nav */}
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
                        <span className={isActive ? "text-[#F7C12B]" : "text-zinc-500"}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveBar"
                            className="ml-auto w-1 h-5 rounded-full bg-[#F7C12B]"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="px-5 pb-10 pt-4 border-t border-zinc-900">
                  <p className="text-zinc-600 text-xs">Yummy © 2026</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop sidebar (>= lg) — always visible, expand/collapse ── */}
      <motion.div
        animate={{ width: desktopExpanded ? 240 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full bg-black border-r border-zinc-900 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-6 shrink-0">
          <AnimatePresence>
            {desktopExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F7C12B] flex items-center justify-center shrink-0">
                  <span className="text-black font-black text-sm">Y</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                  Yummy
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed logo */}
          {!desktopExpanded && (
            <div className="w-8 h-8 rounded-lg bg-[#F7C12B] flex items-center justify-center mx-auto">
              <span className="text-black font-black text-sm">Y</span>
            </div>
          )}

          {/* Toggle button — only show when expanded */}
          {desktopExpanded && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDesktopExpanded(false)}
              className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <Menu size={16} />
            </motion.button>
          )}
        </div>

        {/* Menu toggle button when collapsed */}
        {!desktopExpanded && (
          <div className="flex justify-center mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDesktopExpanded(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu size={16} />
            </motion.button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate(item.path)}
                title={!desktopExpanded ? item.label : undefined}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 text-left w-full ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/80 hover:text-white cursor-pointer"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-[#F7C12B]" : "text-zinc-500"}`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {desktopExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && desktopExpanded && (
                  <motion.div
                    layoutId="desktopActiveBar"
                    className="ml-auto w-1 h-5 rounded-full bg-[#F7C12B] shrink-0"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-zinc-900 shrink-0">
          {desktopExpanded ? (
            <p className="text-zinc-600 text-xs">Yummy © 2026</p>
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-800 mx-auto" />
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;