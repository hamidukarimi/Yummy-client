import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  variant?: "error" | "success" | "warning" | "info";
  visible?: boolean;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const variantStyles: Record<string, string> = {
  error: "bg-red-950 border-red-800 text-red-400",
  success: "bg-green-950 border-green-800 text-green-400",
  warning: "bg-yellow-950 border-yellow-800 text-yellow-400",
  info: "bg-blue-950 border-blue-800 text-blue-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Alert = ({ message, type, variant, visible = true }: AlertProps) => {
  const resolvedType = type ?? variant ?? "error";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          role="alert"
          className={`
            w-full px-4 py-3 rounded-xl border text-sm font-medium
            ${variantStyles[resolvedType]}
          `}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
