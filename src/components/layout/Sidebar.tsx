import { useEffect } from "react";
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
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <Home size={20} />, path: "/" },
  { label: "Saved", icon: <Bookmark size={20} />, path: "/saved" },
  { label: "Create Post", icon: <Plus size={20} />, path: "/posts/create" },
  { label: "Pages", icon: <FileText size={20} />, path: "/pages" },
  { label: "My Posts", icon: <ScrollText size={20} />, path: "/my-posts" },
  { label: "Profile", icon: <User size={20} />, path: "/profile" },
  { label: "Notifications", icon: <Bell size={20} />, path: "/notifications" },
  { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  { label: "Account", icon: <ShieldCheck size={20} />, path: "/account" },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only lock scroll on mobile/tablet when sidebar is open
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 200);
  };

  return (
    <>
      {/* ── Desktop Mini Sidebar (Visible only on lg+) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-black border-r border-zinc-900 flex-col items-center py-8 z-30">
        <div className="w-10 h-10 rounded-lg bg-[#F7C12B] flex items-center justify-center mb-10">
          <span className="text-black font-black text-lg">Y</span>
        </div>
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.slice(0, 6).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-zinc-900 text-[#F7C12B]"
                  : "text-zinc-500 hover:bg-zinc-900"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Overlay: Darker 50% for LG, Blur for Mobile ── */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 lg:backdrop-blur-none backdrop-blur-sm"
            />

            {/* ── Full Drawer ── */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-black border-r border-zinc-900 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-12 pb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F7C12B] flex items-center justify-center">
                    <span className="text-black font-black text-sm">Y</span>
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight">
                    Yummy
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto scrollbar-hide">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-left w-full ${
                        isActive
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span
                        className={
                          isActive ? "text-[#F7C12B]" : "text-zinc-500"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
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
    </>
  );
};

export default Sidebar;
