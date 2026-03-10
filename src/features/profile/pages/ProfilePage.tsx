import { motion } from "framer-motion";
import { MoreHorizontal, UserCircle } from "lucide-react";
import useProfile from "@/features/profile/hooks/useProfile";
import LogoutButton from "@/components/ui/LogoutButton";
import Spinner from "@/components/ui/Spinner";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 max-w-md mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >

        {/* ── Header ── */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-2"
        >
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </motion.div>

        {/* ── Profile Card ── */}
        <motion.div
          variants={itemVariants}
          className="shadow-md shadow-[rgba(104,104,104,0.25)] rounded-3xl border border-zinc-800 p-6 flex flex-col items-center gap-3"
        >
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle size={64} className="text-zinc-500" />
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col items-center gap-0.5">
            <h2 className="text-xl font-bold text-white">
              {user.firstname} {user.lastname}
            </h2>
            <p className="text-sm text-zinc-400">@{user.username}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {user.following.length} Following
            </p>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3"
        >
          <div className="shadow-md shadow-[rgba(104,104,104,0.25)] rounded-2xl border border-zinc-800 p-5 flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">12</span>
            <span className="text-sm text-zinc-400">total orders</span>
          </div>
          <div className="shadow-md shadow-[rgba(104,104,104,0.25)] rounded-2xl border border-zinc-800 p-5 flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">12</span>
            <span className="text-sm text-zinc-400">bookmarks</span>
          </div>
        </motion.div>

        {/* ── Become a Restaurant Banner ── */}
        <motion.div
          variants={itemVariants}
          className="shadow-md shadow-[rgba(104,104,104,0.25)] rounded-2xl border border-zinc-800 p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-800 transition-colors"
        >
          <div className="text-4xl">👨‍🍳</div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-white">Become a Restaurant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              it's easy to start hosting your own restaurant and earn extra income
            </p>
          </div>
        </motion.div>

        {/* ── Logout ── */}
        <motion.div variants={itemVariants}>
          <LogoutButton />
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ProfilePage;