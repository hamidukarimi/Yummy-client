import { motion } from "framer-motion";
import {
  MoreHorizontal,
  ChevronRight,
  KeyRound,
  MonitorSmartphone,
  BadgeCheck,
} from "lucide-react";
import useProfile from "@/features/profile/hooks/useProfile";
import LogoutButton from "@/components/ui/LogoutButton";
import Spinner from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyPagesService } from "@/features/pages/services/page.service";
import { getMyPostsService } from "@/features/posts/services/post.service";
import useAuthStore from "@/store/authStore";
import { getFollowedPagesService } from "@/features/pages/services/page.service";

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { user, isLoading, isError } = useProfile();

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data: myPages } = useQuery({
    queryKey: ["pages", "my"],
    queryFn: getMyPagesService,
    enabled: !!user,
  });

  const { data: myPosts } = useQuery({
    queryKey: ["posts", "my"],
    queryFn: getMyPostsService,
    enabled: !!user,
  });

  const { data: followedPages } = useQuery({
    queryKey: ["pages", "followed"],
    queryFn: getFollowedPagesService,
    enabled: !!user,
  });

  const followingCount = followedPages?.length ?? 0;
  const savedCount = authUser?.savedPosts?.length ?? 0;
  const pagesCount = myPages?.length ?? 0;
  const postsCount = myPosts?.posts?.length ?? 0;

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
    <div className="lg:ml-[82px] min-h-screen bg-black px-4 py-8 lg:px-8 max-w-6xl mx-auto pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* ── Header ── */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Profile</h1>
          <button
            onClick={() => navigate("/profile/edit")}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-all hover:scale-105 cursor-pointer"
          >
            <MoreHorizontal size={20} />
          </button>
        </motion.div>

        {/* ── Main Responsive Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Profile & Stats (40% width on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Profile Card */}
            <motion.div
              variants={itemVariants}
              className="shadow-xl shadow-white/5 rounded-3xl border border-zinc-800 p-8 flex flex-col items-center gap-4 bg-zinc-900/30 backdrop-blur-sm"
            >
              <div className="relative group">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-zinc-700 p-1 border-2 border-[#F7C12B] overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstname}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <img
                      src="./default.jpg"
                      alt={`${user.firstname}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-zinc-400">@{user.username}</p>
              </div>

              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                <span className="text-[#F7C12B] font-bold text-sm">
                  {followingCount}
                </span>
                <span className="text-zinc-400 text-sm font-medium">Following Pages</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              {[
                { label: "saved posts", count: savedCount, path: "/saved" },
                { label: "my pages", count: pagesCount, path: "/pages" },
                { label: "my posts", count: postsCount, path: "/my-posts" },
                { label: "orders", count: "—", path: null, comingSoon: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileTap={stat.path ? { scale: 0.96 } : {}}
                  onClick={() => stat.path && navigate(stat.path)}
                  className={`rounded-2xl border border-zinc-800 p-6 flex flex-col gap-1 transition-all ${
                    stat.path 
                      ? "cursor-pointer bg-zinc-900/20 hover:bg-zinc-900 hover:border-zinc-700" 
                      : "opacity-40"
                  }`}
                >
                  <span className="text-3xl font-bold text-white">{stat.count}</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Actions & Quick Links (60% width on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-500 ml-2 uppercase tracking-widest">Account Actions</h3>
              
              <QuickLink 
                icon="🧭" 
                title="Discover Pages" 
                subtitle="Find and follow restaurants" 
                onClick={() => navigate("/discover")} 
              />
              
              <QuickLink 
                icon="👨‍🍳" 
                title="Become a Restaurant" 
                subtitle="Start hosting your own restaurant" 
                onClick={() => navigate("/pages")} 
              />

              <QuickLink 
                icon={<KeyRound size={22} className="text-[#F7C12B]" />} 
                title="Change password" 
                subtitle="Update your sign-in password" 
                onClick={() => navigate("/profile/change-password")} 
              />

              <QuickLink
                icon={
                  <MonitorSmartphone
                    size={22}
                    className="text-[#F7C12B]"
                  />
                }
                title="Active sessions"
                subtitle="Review and log out other devices"
                onClick={() => navigate("/profile/sessions")}
              />

              {authUser?.role === "admin" && (
                <QuickLink
                  icon={
                    <BadgeCheck
                      size={22}
                      className="text-[#F7C12B]"
                    />
                  }
                  title="Page verification"
                  subtitle="Review pending restaurant verification requests"
                  onClick={() => navigate("/admin/page-verifications")}
                />
              )}
            </motion.div>

            {/* Logout Section */}
            <motion.div variants={itemVariants} className="mt-4">
              <div className="p-1 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <LogoutButton />
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

// Helper Component for Links
const QuickLink = ({ icon, title, subtitle, onClick }: any) => (
  <motion.div
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="group rounded-2xl border border-zinc-800 p-5 flex items-center justify-between cursor-pointer bg-zinc-900/10 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-base font-bold text-white group-hover:text-[#F7C12B] transition-colors">{title}</h3>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
  </motion.div>
);

export default ProfilePage;