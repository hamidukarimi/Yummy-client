import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft } from "lucide-react";
import useSearch from "@/features/search/hooks/useSearch";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage } from "@/features/pages/types/page.types";
import type { PostType } from "@/features/posts/types/post.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = "pages" | "posts";

const PAGE_CATEGORIES = [
  "All",
  "Fast Food",
  "Cafe",
  "Restaurant",
  "Pizza",
  "Sushi",
  "Bakery",
  "Dessert",
  "Vegan",
  "Seafood",
  "BBQ",
  "Steakhouse",
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Other",
];

const POST_TYPES: { value: PostType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "food", label: "Food" },
  { value: "menu_item", label: "Menu item" },
  { value: "promotion", label: "Promotion" },
  { value: "announcement", label: "Announcement" },
];

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

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>("pages");
  const inputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<PostType | "">("");
  const [postCategory, setPostCategory] = useState("");
  const [postTag, setPostTag] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [pageCategory, setPageCategory] = useState("");
  const [pageTag, setPageTag] = useState("");

  const postFilters = {
    ...(postType && { type: postType }),
    ...(postCategory && { category: postCategory }),
    ...(postTag.trim() && { tag: postTag.trim() }),
    ...(minPrice !== "" &&
      !Number.isNaN(Number(minPrice)) && { minPrice: Number(minPrice) }),
    ...(maxPrice !== "" &&
      !Number.isNaN(Number(maxPrice)) && { maxPrice: Number(maxPrice) }),
  };

  const pageFilters = {
    ...(pageCategory && { category: pageCategory }),
    ...(pageTag.trim() && { tag: pageTag.trim() }),
  };

  const {
    posts,
    pages,
    postsLoading,
    pagesLoading,
    debouncedQuery,
    hasActiveCriteria,
  } = useSearch(query, tab, postFilters, pageFilters);

  useEffect(() => {
    inputRef.current?.focus();
    if (location.state?.query) {
      setQuery(location.state.query);
    }
  }, [location.state]);

  const isLoading = tab === "pages" ? pagesLoading : postsLoading;
  const results = tab === "pages" ? pages : posts;

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors duration-200 shrink-0 cursor-pointer ${
      active
        ? "bg-[#F7C12B] border-[#F7C12B] text-black"
        : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
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

        {/* ── Filters ── */}
        <div className="px-4 pt-4 lg:px-6 flex flex-col gap-3 border-b border-zinc-900 pb-4">
          {tab === "pages" && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {PAGE_CATEGORIES.map((cat) => {
                  const val = cat === "All" ? "" : cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPageCategory(val)}
                      className={chipClass(pageCategory === val)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={pageTag}
                onChange={(e) => setPageTag(e.target.value)}
                placeholder="Filter by page tag..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </>
          )}

          {tab === "posts" && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {POST_TYPES.map(({ value, label }) => (
                  <button
                    key={value || "all"}
                    type="button"
                    onClick={() => setPostType(value)}
                    className={chipClass(postType === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {PAGE_CATEGORIES.map((cat) => {
                  const val = cat === "All" ? "" : cat;
                  return (
                    <button
                      key={`post-${cat}`}
                      type="button"
                      onClick={() => setPostCategory(val)}
                      className={chipClass(postCategory === val)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={postTag}
                onChange={(e) => setPostTag(e.target.value)}
                placeholder="Filter by post tag..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min price"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max price"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-4 pt-5 lg:px-6 lg:pt-8">
          {!hasActiveCriteria && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
                <Search size={24} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm lg:text-base text-center">
                Search or use filters to find{" "}
                {tab === "pages" ? "restaurants and pages" : "posts and food"}
              </p>
            </div>
          )}

          {hasActiveCriteria && isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="md" />
            </div>
          )}

          {hasActiveCriteria && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20">
              <p className="text-zinc-500 text-sm lg:text-base">
                No {tab} found
                {debouncedQuery.trim() ? ` for "${debouncedQuery}"` : ""}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {hasActiveCriteria && !isLoading && results.length > 0 && (
              <motion.div
                key={`${tab}-${debouncedQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
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
