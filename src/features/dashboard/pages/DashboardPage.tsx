import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import DashboardCard from "@/features/dashboard/components/DashboardCard";
import ChangePasswordForm from "@/features/user/components/ChangePasswordForm";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-zinc-50 p-6"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome back, {user?.firstname} 👋
          </h1>
          <p className="text-sm text-zinc-500">
            Here's an overview of your account.
          </p>
        </motion.div>

        {/* Account Info Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <DashboardCard title="Full Name" description="Your display name">
            {user?.firstname} {user?.lastname}
          </DashboardCard>

          <DashboardCard title="Username" description="Your unique handle">
            @{user?.username}
          </DashboardCard>

          <DashboardCard title="Email" description="Your email address">
            {user?.email}
          </DashboardCard>

          <DashboardCard title="Role" description="Your account role">
            <span
              className={`
                inline-block px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  user?.role === "admin"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-zinc-100 text-zinc-600"
                }
              `}
            >
              {user?.role}
            </span>
          </DashboardCard>

          <DashboardCard
            title="Account Status"
            description="Your current account status"
          >
            <span
              className={`
                inline-block px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  user?.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {user?.isActive ? "Active" : "Inactive"}
            </span>
          </DashboardCard>

          <DashboardCard
            title="Verified"
            description="Email verification status"
          >
            <span
              className={`
                inline-block px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  user?.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }
              `}
            >
              {user?.isVerified ? "Verified" : "Not verified"}
            </span>
          </DashboardCard>
        </motion.div>

        {/* Change Password Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-zinc-800">Security</h2>
          <ChangePasswordForm />
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DashboardPage;