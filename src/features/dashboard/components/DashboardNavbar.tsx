import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell, Search } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import useUnreadCount from "@/features/notifications/hooks/useUnreadCount";
import useAuth from "@/hooks/useAuth";

const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const unreadCount = useUnreadCount(!!user);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col gap-3 px-4 pt-5 pb-3">
        {/* ── Top row: menu + bell ── */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-white"
          >
            <Menu size={22} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/notifications")}
            className="w-9 h-9 flex items-center justify-center text-white relative"
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

        {/* ── Search bar ── */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
        >
          <Search size={16} className="text-zinc-500 shrink-0" />
          <span className="text-zinc-600 text-sm">Search pages, posts...</span>
        </motion.button>
      </div>
    </>
  );
};

export default DashboardNavbar;
