import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import useLogout from "@/hooks/useLogout";
import Button from "@/components/ui/Button";

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { logout, isPending } = useLogout();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-black border-b border-zinc-900"
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="text-lg font-bold text-[#F7C12B] tracking-tight"
        >
          Yummy
        </Link>

        {/* Right Side */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">
                {user.firstname} {user.lastname}
              </span>
              <span className="text-xs text-zinc-500">
                @{user.username}
              </span>
            </div>

            {/* Avatar — navigates to profile */}
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-[#F7C12B] text-black flex items-center justify-center text-sm font-bold uppercase hover:opacity-80 transition-opacity">
                {user.firstname[0]}{user.lastname[0]}
              </div>
            </Link>

            <Button
              variant="ghost"
              isLoading={isPending}
              onClick={() => logout()}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get started</Button>
            </Link>
          </div>
        )}

      </div>
    </motion.nav>
  );
};

export default Navbar;