import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import useUnreadCount from "@/features/notifications/hooks/useUnreadCount";
import useAuth from "@/hooks/useAuth";

const HomeNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate                       = useNavigate();
  const { user, isInitializing, restoreSession } = useAuth();
  const unreadCount                    = useUnreadCount(!!user);

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex items-center justify-between px-4 pt-3 pb-3">
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
    </>
  );
};

export default HomeNavbar;