// ─── Types ────────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ─── Sizes ────────────────────────────────────────────────────────────────────

const sizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-4",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Spinner = ({ size = "md", className = "" }: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full
        border-current border-t-transparent
        animate-spin
        ${sizes[size]}
        ${className}
      `}
    />
  );
};

export default Spinner;