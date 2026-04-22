import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check } from "lucide-react";
import useDiscoverPages from "@/features/pages/hooks/useDiscoverPages";
import useFollowPage from "@/features/pages/hooks/useFollowPage";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage } from "@/features/pages/types/page.types";
import useAuth from "@/hooks/useAuth";

// ─── Page Item (Responsive Card/Row) ──────────────────────────────────────────

const PageItem = ({
  page,
  userId,
}: {
  page: ApiPage;
  userId?: string;
}) => {
  const navigate = useNavigate();
  const { toggleFollow, isPending } = useFollowPage(page.slug);

  // Ownership & Follower logic
  const pageOwner = page.owner as { id?: string; _id?: string } | string;
  const ownerId = typeof pageOwner === "object" ? (pageOwner.id ?? pageOwner._id) : pageOwner;
  const isOwner = !!userId && ownerId === userId;

  const isFollowing = !!userId && (page.followers ?? []).some(
    (f) => f.toString() === userId.toString()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-4 py-3 text-left border-b border-zinc-900 last:border-b-0
                 md:border-none md:flex-col md:bg-zinc-900 md:rounded-xl md:overflow-hidden md:p-0 md:pb-3"
    >
      {/* Cover image only for md+ screens */}
      {page.coverImage && (
        <div 
          className="hidden md:block w-full h-32 bg-zinc-800 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/pages/${page.slug}`)}
        >
          <img
            src={page.coverImage}
            alt={`${page.name} cover`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content Wrapper */}
      <div className="flex items-center gap-4 w-full md:px-3 md:pt-1">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-xl md:rounded-full bg-zinc-800 overflow-hidden shrink-0 cursor-pointer"
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

        {/* Name and Info */}
        <div 
          className="flex flex-col gap-0.5 min-w-0 flex-1 cursor-pointer"
          onClick={() => navigate(`/pages/${page.slug}`)}
        >
          <div className="flex items-center gap-1">
            <span className="text-white font-semibold text-sm truncate">
              {page.name}
            </span>
            {page.isVerified && (
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <Check size={8} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <span className="text-zinc-500 text-xs truncate">
            {page.description ?? page.category}
          </span>
        </div>

        {/* Follow Button - Kept visible on both layouts */}
        {!isOwner && (
          <button
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow();
            }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all shrink-0 ${
              isFollowing
                ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                : "bg-white border-white text-black hover:bg-zinc-200"
            }`}
          >
            {isPending ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DiscoverPagesPage = () => {
  const { user, restoreSession, isInitializing } = useAuth();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  const { pages, isLoading, isError } = useDiscoverPages(search);

  return (
    <div className="min-h-screen bg-black pb-24 mx-auto max-w-7xl">
      {/* ── Search Header ── */}
      <div className="px-4 py-4">
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
        {!search && (
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-4">
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
              // Responsive Grid: 1 col on mobile, 2 on md, 3 on lg
              className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4"
            >
              {pages.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-16 col-span-full">
                  No pages found.
                </p>
              )}

              {pages.map((page) => (
                <PageItem
                  key={page._id ?? page.id}
                  page={page}
                  userId={user?.id}
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