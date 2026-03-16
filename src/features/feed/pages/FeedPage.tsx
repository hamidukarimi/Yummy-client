import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import useFeedTags from "@/features/feed/hooks/useFeedTags";
import useFeed from "@/features/feed/hooks/useFeed";
import FeedTabs from "@/features/feed/components/FeedTabs";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";
import useAuth from "@/hooks/useAuth";
import type { FeedFilter } from "@/features/feed/types/feed.types";


import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";



// ─── Component ────────────────────────────────────────────────────────────────

const FeedPage = () => {
  const { user, isInitializing, restoreSession } = useAuth();
  const isAuthenticated = !!user;

  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FeedFilter>({
    type:  "all",
    label: "Explore",
  });

  const { filters, isLoading: tagsLoading } = useFeedTags();

  const {
    posts,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(activeFilter, isAuthenticated);

  // Restore session for "For You" tab
  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  // Infinite scroll — detect when user reaches bottom
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col">

      {/* ── Search bar ── */}
    <div className="px-4 pb-2 pt-1">
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate("/search")}
        className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
      >
        <Search size={16} className="text-zinc-500 shrink-0" />
        <span className="text-zinc-600 text-sm">Search pages, posts...</span>
      </motion.button>
    </div>

      {/* ── Feed Tabs ── */}
      <FeedTabs
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter)}
        isLoading={tagsLoading}
      />

      {/* ── For You empty state (not logged in) ── */}
      {activeFilter.type === "for-you" && !isAuthenticated && !isInitializing && (
        <div className="flex flex-col items-center gap-3 py-16 px-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
            <Sparkles size={24} className="text-zinc-600" />
          </div>
          <p className="text-white font-semibold text-sm">Sign in to see your feed</p>
          <p className="text-zinc-500 text-xs text-center">
            Follow pages to get personalized posts here.
          </p>
        </div>
      )}

      {/* ── For You empty state (logged in but no followed pages) ── */}
      {activeFilter.type === "for-you" && isAuthenticated && !isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 px-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
            <Sparkles size={24} className="text-zinc-600" />
          </div>
          <p className="text-white font-semibold text-sm">Your feed is empty</p>
          <p className="text-zinc-500 text-xs text-center">
            Follow some pages to see their posts here.
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      )}

      {/* ── Error ── */}
      {isError && (
        <p className="text-zinc-500 text-sm text-center py-16">
          Failed to load feed.
        </p>
      )}

      {/* ── Posts ── */}
      <AnimatePresence mode="wait">
        {!isLoading && !isError && posts.length > 0 && (
          <motion.div
            key={`${activeFilter.type}-${activeFilter.value ?? ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5 px-4 pt-2 pb-4"
          >
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Load more indicator ── */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Spinner size="sm" />}
      </div>

    </div>
  );
};

export default FeedPage;