import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft } from "lucide-react";
import useSearch from "@/features/search/hooks/useSearch";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage } from "@/features/pages/types/page.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = "pages" | "posts";

// ─── Page Item ────────────────────────────────────────────────────────────────

const PageResultItem = ({
  page,
  onClick,
}: {
  page: ApiPage;
  onClick: () => void;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 py-3 text-left border-b border-zinc-900 last:border-b-0 cursor-pointer"
  >
    <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
      {page.avatar ? (
        <img
          src={page.avatar}
          alt={page.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-zinc-700">
          {page.name[0]}
        </div>
      )}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-white font-semibold text-sm truncate">
        {page.name}
      </span>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-xs">
          {page.category}
        </span>
        {page.isVerified && (
          <span className="text-blue-400 text-xs">✓ Verified</span>
        )}
      </div>
    </div>
  </motion.button>
);

// ─── Component ────────────────────────────────────────────────────────────────

import { useLocation } from "react-router-dom";

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>("pages");
  const inputRef = useRef<HTMLInputElement>(null);

  const { posts, pages, postsLoading, pagesLoading, debouncedQuery } =
    useSearch(query, tab);

  // Auto focus input on mount and set query from navigation state if present
  useEffect(() => {
    inputRef.current?.focus();
    if (location.state?.query) {
      setQuery(location.state.query);
    }
    // Optionally clear the state after using it, to avoid re-using on back navigation
    // window.history.replaceState({}, document.title);
  }, [location.state]);

  const isLoading = tab === "pages" ? pagesLoading : postsLoading;
  const hasQuery = debouncedQuery.trim().length >= 1;
  const results = tab === "pages" ? pages : posts;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Centered container */}
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 lg:px-6 lg:pt-8 sticky top-0 bg-black z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="text-white shrink-0 cursor-pointer hover:bg-zinc-900 rounded-full md:p-2 transition-all"
          >
            <ChevronLeft size={22} />
          </motion.button>

          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, posts..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 lg:py-3 lg:text-base"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center border-b border-zinc-800 px-4 lg:px-6">
          {(["pages", "posts"] as SearchTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm lg:text-base font-semibold border-b-2 transition-colors duration-200 capitalize -mb-px cursor-pointer ${
                tab === t
                  ? "border-[#F7C12B] text-[#F7C12B]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="px-4 pt-5 lg:px-6 lg:pt-8">
          {/* Empty state */}
          {!hasQuery && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
                <Search size={24} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm lg:text-base">
                Search for{" "}
                {tab === "pages" ? "restaurants and pages" : "posts and food"}
              </p>
            </div>
          )}

          {/* Loading */}
          {hasQuery && isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="md" />
            </div>
          )}

          {/* No results */}
          {hasQuery && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20">
              <p className="text-zinc-500 text-sm lg:text-base">
                No {tab} found for "{debouncedQuery}"
              </p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {hasQuery && !isLoading && results.length > 0 && (
              <motion.div
                key={`${tab}-${debouncedQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Pages → list stays single column (better UX) */}
                {tab === "pages" && (
                  <div className="flex flex-col">
                    {pages.map((page) => (
                      <PageResultItem
                        key={page._id ?? page.id}
                        page={page}
                        onClick={() => navigate(`/pages/${page.slug}`)}
                      />
                    ))}
                  </div>
                )}

                {/* Posts → grid on larger screens */}
                {tab === "posts" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
