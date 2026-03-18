import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X, Check } from "lucide-react";
import useDiscoverPages from "@/features/pages/hooks/useDiscoverPages";
import useFollowPage from "@/features/pages/hooks/useFollowPage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPageBySlugService } from "@/features/pages/services/page.service";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage } from "@/features/pages/types/page.types";
import useAuth from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageRowProps {
  page:      ApiPage;
  userId?:   string;
  onPress:   () => void;
}

// ─── Page Row ─────────────────────────────────────────────────────────────────

const PageRow = ({ page, userId, onPress }: PageRowProps) => {
  const navigate = useNavigate();

  // Fix ownership check
  const pageOwner = page.owner as { id?: string; _id?: string } | string;
  const ownerId = typeof pageOwner === "object"
    ? (pageOwner.id ?? pageOwner._id)
    : pageOwner;
  const isOwner = !!userId && ownerId === userId;

  const { toggleFollow, isPending } = useFollowPage(page.slug);

  // Fix follower comparison — convert all to strings
  const followersCount = page.followers?.length ?? 0;
  const isFollowing = !!userId && (page.followers ?? []).some(
    (f) => f.toString() === userId.toString()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3 border-b border-zinc-900 last:border-b-0"
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shrink-0 cursor-pointer"
        onClick={() => navigate(`/pages/${page.slug}`)}
      >
        {page.avatar ? (
          <img src={page.avatar} alt={page.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-zinc-700">
            {page.name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="flex flex-col gap-0.5 flex-1 min-w-0 cursor-pointer"
        onClick={() => navigate(`/pages/${page.slug}`)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-white font-semibold text-sm truncate">
            {page.name}
          </span>
          {page.isVerified && (
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Check size={9} className="text-white" />
            </div>
          )}
        </div>
        <span className="text-zinc-500 text-xs truncate">
          {page.description ?? page.category}
        </span>
        <span className="text-zinc-600 text-xs">
          {followersCount.toLocaleString()} followers
        </span>
      </div>

      {/* Follow button */}
      {!isOwner && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={isPending}
          onClick={() => toggleFollow()}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors duration-200 shrink-0 ${
            isFollowing
              ? "bg-zinc-900 border-zinc-700 text-zinc-400"
              : "bg-transparent border-zinc-600 text-white hover:bg-zinc-900"
          }`}
        >
          {isPending ? "..." : isFollowing ? "Following" : "Follow"}
        </motion.button>
      )}
    </motion.div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const DiscoverPagesPage = () => {
  const navigate    = useNavigate();
  const { user, restoreSession, isInitializing } = useAuth();
  const [search, setSearch] = useState("");

  // Restore session since /discover is public
  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  const { pages, isLoading, isError } = useDiscoverPages(search);

  return (
    <div className="min-h-screen bg-black pb-24 max-w-md mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="text-white shrink-0"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="text-lg font-bold text-white">Discover Pages</h1>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4">

        {/* Section title */}
        {!search && (
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-3">
            Follow suggestions
          </p>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <p className="text-zinc-500 text-sm text-center py-16">
            Failed to load pages.
          </p>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && !isError && (
            <motion.div
              key={search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {pages.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-16">
                  No pages found.
                </p>
              )}

              {pages.map((page) => (
                <PageRow
                  key={page._id ?? page.id}
                  page={page}
                  userId={user?.id}
                  onPress={() => navigate(`/pages/${page.slug}`)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiscoverPagesPage;