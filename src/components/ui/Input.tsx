import type { ComponentPropsWithoutRef } from "react";
import type { FieldError } from "react-hook-form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: FieldError;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = ({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          w-full px-4 py-3 rounded-xl text-sm
          border transition-colors duration-200
          outline-none bg-transparent text-white
          placeholder:text-zinc-500
          ${
            error
              ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-900"
              : "border-zinc-700 focus:border-[#F7C12B] focus:ring-2 focus:ring-[#F7C12B]/20"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-400 mt-0.5">{error.message}</p>
      )}
    </div>
  );
};

export default Input;