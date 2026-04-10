import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import useMyPages from "@/features/pages/hooks/useMyPages";
import useAllPages from "@/features/pages/hooks/useAllPages";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage } from "@/features/pages/types/page.types";
import useFollowedPages from "@/features/pages/hooks/useFollowedPages";
import { useCreatePageModal } from "@/context/CreatePostModalContext";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "my" | "all" | "followed";

const CATEGORIES = [
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

// ─── Sub Components ───────────────────────────────────────────────────────────

const PageItem = ({
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
    className="w-full flex items-center gap-4 py-3 text-left cursor-pointer 
               md:flex-col md:bg-zinc-900 md:rounded-xl md:overflow-hidden"
  >
    {/* Cover image only for md+ screens */}
    {page.coverImage && (
      <div className="hidden md:block w-full h-32 md:h-40 bg-zinc-800 overflow-hidden">
        <img
          src={page.coverImage}
          alt={`${page.name} cover`}
          className="w-full h-full object-cover"
        />
      </div>
    )}

    {/* Avatar + name + description */}
    <div className="flex items-center gap-4 w-full md:p-3">
      <div className="w-12 h-12 rounded-xl md:rounded-full bg-zinc-800 overflow-hidden shrink-0">
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
        <span className="text-zinc-500 text-xs truncate">
          {page.description ?? page.category}
        </span>
      </div>
    </div>
  </motion.button>
);


// ─── Component ────────────────────────────────────────────────────────────────

const MyPagesPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { openModal } = useCreatePageModal();

  const {
    pages: myPages,
    isLoading: myLoading,
    isError: myError,
  } = useMyPages();
  const {
    pages: allPages,
    isLoading: allLoading,
    isError: allError,
  } = useAllPages(search, category);
  const {
    pages: followedPages,
    isLoading: followedLoading,
    isError: followedError,
  } = useFollowedPages();


    const handleCreatePage = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      openModal();
      return;
    }
    navigate("/pages/create");
  };

  return (
    <div className="min-h-screen bg-black px-4 pt-5 pb-24  mx-auto">

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 mb-5">
        {(["all", "my", "followed"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${
              tab === t
                ? "bg-zinc-800 border-zinc-600 text-white"
                : "bg-transparent border-zinc-800 text-zinc-500 hover:text-white"
            }`}
          >
            {t === "my" ? "My Pages" : t === "all" ? "All Pages" : "Followed"}
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-zinc-800 mb-5" />

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {/* ── My Pages Tab ── */}
        {tab === "my" && (
          <motion.div
            key="my"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">
                Pages you manage
              </h2>
              <button
                onClick={handleCreatePage}
                className="text-[#F7C12B] text-sm font-medium hover:underline cursor-pointer"
              >
                + New
              </button>
            </div>

            {myLoading && (
              <div className="flex justify-center py-10">
                <Spinner size="md" />
              </div>
            )}
            {myError && (
              <p className="text-zinc-500 text-sm text-center py-10">
                Failed to load pages.
              </p>
            )}

            {!myLoading && !myError && myPages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <p className="text-zinc-500 text-sm">
                  You don't have any pages yet.
                </p>
                <button
                  onClick={handleCreatePage}
                  className="text-[#F7C12B] text-sm font-medium hover:underline"
                >
                  Create your first page
                </button>
              </div>
            )}

            {!myLoading && !myError && myPages.length > 0 && (
              <div className="flex flex-col md:gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 divide-y divide-zinc-900">
                {myPages.map((page) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/pages/${page.slug}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── All Pages Tab ── */}
        {tab === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
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

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const val = cat === "All" ? "" : cat;
                const isActive = category === val;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                        : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Results */}
            {allLoading && (
              <div className="flex justify-center py-10">
                <Spinner size="md" />
              </div>
            )}
            {allError && (
              <p className="text-zinc-500 text-sm text-center py-10">
                Failed to load pages.
              </p>
            )}

            {!allLoading && !allError && allPages.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-10">
                No pages found.
              </p>
            )}

            {!allLoading && !allError && allPages.length > 0 && (
              <div className="flex flex-col md:gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 divide-y divide-zinc-900">
                {allPages.map((page) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/pages/${page.slug}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Followed Pages Tab ── */}
        {tab === "followed" && (
          <motion.div
            key="followed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-white font-bold text-base mb-4">
              Pages you follow
            </h2>

            {followedLoading && (
              <div className="flex justify-center py-10">
                <Spinner size="md" />
              </div>
            )}

            {followedError && (
              <p className="text-zinc-500 text-sm text-center py-10">
                Failed to load followed pages.
              </p>
            )}

            {!followedLoading &&
              !followedError &&
              followedPages.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-2">
                    <span className="text-2xl">🔖</span>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    No followed pages yet
                  </p>
                  <p className="text-zinc-500 text-xs text-center">
                    Pages you follow will appear here.
                  </p>
                  <button
                    onClick={() => setTab("all")}
                    className="text-[#F7C12B] text-sm font-medium hover:underline mt-1"
                  >
                    Discover pages
                  </button>
                </div>
              )}

            {!followedLoading && !followedError && followedPages.length > 0 && (
              <div className="flex flex-col md:gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 divide-y">
                {followedPages.map((page) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/pages/${page.slug}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPagesPage;
