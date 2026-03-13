import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Bell } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center text-white"
        >
          <Menu size={22} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 flex items-center justify-center text-white relative"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F7C12B]" />
        </motion.button>
      </div>
    </>
  );
};

export default DashboardNavbar;
