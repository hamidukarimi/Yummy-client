import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import Spinner from "@/components/ui/Spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  fullWidth?: boolean;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-[#F7C12B] text-black font-bold hover:bg-[#e6b425] disabled:opacity-50",
  secondary: "bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50",
  ghost:     "bg-transparent text-[#F7C12B] hover:bg-zinc-900 disabled:opacity-50",
  danger:    "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  outline:   "bg-transparent text-white border border-zinc-600 hover:bg-zinc-900 disabled:opacity-50",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Button = ({
  children,
  isLoading = false,
  variant = "primary",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled ?? isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-3 rounded-xl text-sm font-medium
        transition-colors duration-200 cursor-pointer
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...(props as object)}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
};

export default Button;