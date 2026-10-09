import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface ActionItem {
  label: string;
  onClick: () => void;
}

const ActionMenu = ({
  items,
  label,
}: {
  items: ActionItem[];
  label: string;
}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:bg-zinc-900 cursor-pointer"
      >
        <MoreVertical size={18} />
      </button>
      <div
        className={`absolute right-0 z-30 mt-1 min-w-44 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl transition duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setOpen(false);
              item.onClick();
            }}
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-900 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionMenu;
