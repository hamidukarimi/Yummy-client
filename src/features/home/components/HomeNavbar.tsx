import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell, Search, Mail, PlusCircle } from "lucide-react"; 
import Sidebar from "@/components/layout/Sidebar";
import useUnreadCount from "@/features/notifications/hooks/useUnreadCount";
import useAuth from "@/hooks/useAuth";
import useSidebarStore from "@/store/sidebarStore";

const HomeNavbar = () => {
  const { toggle } = useSidebarStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isInitializing, restoreSession } = useAuth();
  const unreadCount = useUnreadCount(!!user);

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  return (
    <>
      {/* Sidebar with Toggle Logic */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <nav className="bg-black text-white px-4 pt-3 pb-3 md:px-8 md:py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle()}
              className="w-9 h-9 flex items-center justify-center text-white lg:hidden"
            >
              <Menu size={22} />
            </motion.button>
            <span className="hidden md:block text-2xl font-bold tracking-tight">
              Yummy
            </span>
          </div>

          {/* CENTER (Desktop Search) */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-10">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search For Properties"
                className="w-full bg-transparent border border-[#F7C12B] rounded-full py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#F7C12B]"
              />
            </div>
          </div>

          {/* RIGHT (Desktop Icons) */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/messages")} className="hover:opacity-80 transition-opacity"><Mail size={22} /></button>
            <button onClick={() => navigate("/posts/create")} className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-white/10 transition">
              <PlusCircle size={22} /><span className="text-sm font-medium">Create</span>
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/notifications")}
              className="relative hover:opacity-80 transition-opacity"
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
            <div onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full overflow-hidden border border-gray-600">
               {user?.avatar ? (
                 <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-blue-900 flex items-center justify-center text-xs">U</div>
               )}
            </div>
          </div>

          {/* MOBILE RIGHT */}
          <div className="md:hidden">
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
        </div>
      </nav>
    </>
  );
};

export default HomeNavbar;