import { useRef } from "react";
import { motion } from "framer-motion";
import type { FeedFilter } from "@/features/feed/types/feed.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedTabsProps {
  filters:       FeedFilter[];
  activeFilter:  FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  isLoading:     boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FeedTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
}: FeedTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-16 rounded-full bg-zinc-900 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2"
    >
      {filters.map((filter) => {
        const isActive = filter.type === activeFilter.type &&
          filter.value === activeFilter.value;

        return (
          <motion.button
            key={`${filter.type}-${filter.value ?? ""}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors duration-200 shrink-0 cursor-pointer ${
              isActive
                ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default FeedTabs;