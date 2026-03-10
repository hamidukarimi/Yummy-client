import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import useLogout from "@/hooks/useLogout";

// ─── Component ────────────────────────────────────────────────────────────────

const LogoutButton = () => {
  const { logout, isPending } = useLogout();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => logout()}
      disabled={isPending}
      className="
        w-full flex items-center gap-3 px-5 py-4
        shadow-md shadow-[rgba(104,104,104,0.25)] rounded-2xl border border-zinc-800
        text-white text-sm font-medium
        hover:bg-zinc-800 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
      "
    >
      <LogOut size={18} className="text-zinc-400" />
      {isPending ? "Signing out..." : "Log Out"}
    </motion.button>
  );
};

export default LogoutButton;