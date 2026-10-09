import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ChoiceOption {
  value: string;
  label: string;
  avatar?: string;
}

const Mark = ({ option }: { option: ChoiceOption }) => {
  const letter = option.label.replace(/^From |^Message as /i, "")[0] ?? "?";
  return (
    <span className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden shrink-0">
      {option.avatar ? (
        <img src={option.avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-[11px] font-semibold text-white">
          {letter}
        </span>
      )}
    </span>
  );
};

const ChoiceMenu = ({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
}: {
  value: string;
  options: ChoiceOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!selected) return null;

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-sm text-white cursor-pointer disabled:opacity-50"
      >
        <Mark option={selected} />
        <span className="min-w-0 flex-1 truncate text-left">{selected.label}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute z-30 mt-1 left-0 right-0 min-w-full origin-top rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl overflow-hidden transition duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {options.map((option) => (
          <button
            key={option.value || "self"}
            type="button"
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left cursor-pointer hover:bg-zinc-900 ${
              option.value === value ? "text-[#F7C12B]" : "text-white"
            }`}
          >
            <Mark option={option} />
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceMenu;
