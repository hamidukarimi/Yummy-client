import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BottomSheetItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BottomSheetItem = ({
  icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
}: BottomSheetItemProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 px-5 py-4
        border-b border-zinc-900 last:border-b-0
        transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
        ${
          variant === "danger"
            ? "text-red-400 hover:bg-red-500/10"
            : "text-white hover:bg-zinc-900"
        }
      `}
    >
      <span className={variant === "danger" ? "text-red-400" : "text-zinc-400"}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default BottomSheetItem;
