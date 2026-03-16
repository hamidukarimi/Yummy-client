import type { ReactNode } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardCard = ({
  title,
  description,
  icon,
  children,
  className = "",
}: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        bg-white rounded-2xl shadow-sm border border-zinc-100
        p-6 flex flex-col gap-4
        ${className}
      `}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
          {description && (
            <p className="text-xs text-zinc-500">{description}</p>
          )}
        </div>
      </div>

      {/* Card Content */}
      {children && (
        <div className="text-sm text-zinc-600">{children}</div>
      )}
    </motion.div>
  );
};

export default DashboardCard;