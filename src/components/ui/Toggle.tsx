import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, disabled = false }: ToggleProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-300
        focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer shrink-0
        ${checked ? "bg-[#F7C12B]" : "bg-zinc-700"}
      `}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`
          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
          ${checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"}
        `}
      />
    </button>
  );
};

export default Toggle;