import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Globe,
  Share2,
  Pencil,
  BarChart2,
  Bookmark,
  Eye,
  Check,
  Search,
} from "lucide-react";
import usePage from "@/features/pages/hooks/usePage";
import useFollowPage from "@/features/pages/hooks/useFollowPage";
import {
  getPagePostsService,
  getMyPagePostsService,
} from "@/features/posts/services/post.service";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import PostCard from "@/features/posts/components/PostCard";
import MenuCard from "@/features/posts/components/MenuCard";
import type {
  WorkingHours,
  WorkingHoursDay,
} from "@/features/pages/types/page.types";
import PendingPostCard from "@/features/posts/components/PendingPostCard";
import { useCreatePostModal } from "@/context/CreatePostModalContext";

// ─── Constants ────────────────────────────────────────────────────────────────

type PageTab = "posts" | "menu" | "hours";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCurrentDayKey = (): keyof WorkingHours => {
  const days: (keyof WorkingHours)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
};

const parseTime = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatTime = (time: string): string => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const getOpenStatus = (workingHours: WorkingHours) => {
  const dayKey = getCurrentDayKey();
  const today = workingHours[dayKey] as WorkingHoursDay;
  if (today.isClosed) return { isOpen: false, label: "Closed today" };
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const open = parseTime(today.open);
  const close = parseTime(today.close);
  if (current >= open && current < close) {
    return {
      isOpen: true,
      label: `Open now · Closes ${formatTime(today.close)}`,
    };
  }
  if (current < open) {
    return { isOpen: false, label: `Opens at ${formatTime(today.open)}` };
  }
  return { isOpen: false, label: "Closed now" };
};

const handleShare = async (name: string, slug: string) => {
  if (navigator.share) {
    await navigator.share({
      title: name,
      url: `${window.location.origin}/pages/${slug}`,
    });
  } else {
    await navigator.clipboard.writeText(
      `${window.location.origin}/pages/${slug}`,
    );
    alert("Link copied to clipboard!");
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const PageViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openModal } = useCreatePostModal();
  const [tab, setTab] = useState<PageTab>("posts");
  const [menuSearch, setMenuSearch] = useState("");

  const handleCreatePost = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      openModal();
      return;
    }
    navigate("/posts/create");
  };

  const { data, isLoading, isError } = usePage(slug ?? "");
  const { toggleFollow, isPending: isFollowPending } = useFollowPage(
    slug ?? "",
  );

  const pageId = data?.page._id;
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "page", pageId],
    queryFn: () => getPagePostsService(pageId!),
    enabled: !!pageId,
  });

  const posts = postsData?.posts ?? [];

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["posts", "page", pageId, "menu_item"],
    queryFn: () => getPagePostsService(pageId!, "menu_item"),
    enabled: !!pageId,
  });

  const isOwner = data?.isOwner ?? false;

  const menuItems = menuData?.posts ?? [];

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["posts", "page", pageId, "pending"],
    queryFn: () => getMyPagePostsService(pageId!),
    enabled: !!pageId && isOwner,
  });

  const pendingPosts =
    pendingData?.posts.filter((p) => p.status === "pending") ?? [];

  const filteredMenuItems = menuSearch.trim()
    ? menuItems.filter((p) =>
        [p.title, p.content, ...p.tags]
          .filter(Boolean)
          .some((field) =>
            field!.toLowerCase().includes(menuSearch.toLowerCase()),
          ),
      )
    : menuItems;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Page not found.</p>
      </div>
    );
  }

  const { page, followersCount, isFollowing } = data;
  const openStatus = getOpenStatus(page.workingHours);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* ── Cover Image ── */}
      <div className="relative w-full h-56">
        {page.coverImage ? (
          <img
            src={page.coverImage}
            alt={page.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <ChevronLeft size={20} />
          </motion.button>

          {isOwner && (
            <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
              <BarChart2 size={14} className="text-white" />
              <span className="text-white text-xs font-medium">Stats</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <Eye size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <BarChart2 size={16} />
                </motion.button>
              </>
            )}
            {!isOwner && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white"
              >
                <Share2 size={16} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Avatar + Name row */}
        <div className="absolute -bottom-16 left-4 right-4 flex items-end gap-3">
          <div className="w-32 h-32 rounded-full border-4 border-black bg-zinc-800 overflow-hidden shrink-0">
            {page.avatar ? (
              <img
                src={page.avatar}
                alt={page.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-white">
                {page.name[0]}
              </div>
            )}
          </div>

          <section className="relative w-full bottom-13">
            <div className="absolute top-0 flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {page.name}
                </h1>
                {page.isVerified && (
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white stroke-3" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#F7C12B] text-black text-sm font-bold">
                  {page.category}
                </span>
                <span className="text-zinc-400 text-md">
                  {followersCount} followers
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-22 flex flex-col gap-5 max-w-md mx-auto">
        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-3"
        >
          {isOwner ? (
            <>
              <Button
                fullWidth
                onClick={() => navigate(`/pages/${page.slug}/edit`)}
              >
                Edit Page
              </Button>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <BarChart2 size={15} className="text-zinc-400" />
                <span className="text-white text-sm font-medium">
                  {followersCount}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 opacity-50 cursor-not-allowed">
                <Bookmark size={15} className="text-zinc-400" />
                <span className="text-zinc-400 text-sm">Insights</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => void handleShare(page.name, page.slug)}
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                <Share2 size={16} />
              </motion.button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant={isFollowing ? "outline" : "primary"}
                isLoading={isFollowPending}
                onClick={() => toggleFollow()}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => void handleShare(page.name, page.slug)}
              >
                <Share2 size={15} />
                Share
              </Button>
            </>
          )}
        </motion.div>

        {/* ── Description ── */}
        {page.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-zinc-400 text-sm leading-relaxed"
          >
            {page.description}
          </motion.p>
        )}

        {/* ── Contact Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          {page.location?.city && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-zinc-400 shrink-0" />
              <span className="text-white text-sm">
                {[page.location.city, page.location.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {page.phone && (
            <a
              href={`tel:${page.phone}`}
              className="flex items-center gap-3 group"
            >
              <Phone size={16} className="text-zinc-400 shrink-0" />
              <span className="text-white text-sm group-hover:text-[#F7C12B] transition-colors">
                {page.phone}
              </span>
            </a>
          )}
          {page.website && (
            <a
              href={page.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <Globe size={16} className="text-zinc-400 shrink-0" />
              <span className="text-white text-sm group-hover:text-[#F7C12B] transition-colors truncate">
                {page.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
        </motion.div>

        {/* ── Tags ── */}
        {page.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-wrap gap-2"
          >
            {page.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-zinc-700 text-zinc-300 text-xs"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-0 mt-2">
          {(["posts", "menu", "hours"] as PageTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors duration-200 capitalize -mb-px ${
                tab === t
                  ? "border-[#F7C12B] text-[#F7C12B]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t === "hours"
                ? "Working Hours"
                : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {/* ── Posts Tab ── */}
          {tab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* ── Pending Posts (owner only) ── */}
              {isOwner && pendingPosts.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">
                    Pending Review ({pendingPosts.length})
                  </h3>
                  {pendingPosts.map((post) => (
                    <PendingPostCard
                      key={post._id}
                      post={post}
                      onDelete={() => void refetchPending()}
                    />
                  ))}
                  {/* Divider between pending and published */}
                  {posts.length > 0 && (
                    <div className="flex items-center gap-3 my-1">
                      <div className="h-px bg-zinc-800 flex-1" />
                      <span className="text-zinc-600 text-xs">Published</span>
                      <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Published Posts ── */}
              {postsLoading && (
                <div className="flex justify-center py-10">
                  <Spinner size="md" />
                </div>
              )}

              {!postsLoading &&
                posts.length === 0 &&
                pendingPosts.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12">
                    <p className="text-zinc-500 text-sm">No posts yet.</p>
                    {isOwner && (
                      <button
                        onClick={handleCreatePost}
                        className="text-[#F7C12B] text-sm hover:underline"
                      >
                        Create your first post
                      </button>
                    )}
                  </div>
                )}

              {!postsLoading &&
                posts.map((post) => <PostCard key={post._id} post={post} />)}
            </motion.div>
          )}

          {/* ── Menu Tab ── */}
          {tab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Search */}
              {menuItems.length > 0 && (
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              )}

              {menuLoading && (
                <div className="flex justify-center py-10">
                  <Spinner size="md" />
                </div>
              )}

              {!menuLoading && menuItems.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    No menu items yet
                  </p>
                  {isOwner && (
                    <button
                      onClick={handleCreatePost}
                      className="text-[#F7C12B] text-sm hover:underline"
                    >
                      Add your first menu item
                    </button>
                  )}
                </div>
              )}

              {!menuLoading &&
                filteredMenuItems.length === 0 &&
                menuItems.length > 0 && (
                  <p className="text-zinc-500 text-sm text-center py-8">
                    No items match your search.
                  </p>
                )}

              {!menuLoading && filteredMenuItems.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {filteredMenuItems.map((post) => (
                    <MenuCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Working Hours Tab ── */}
          {tab === "hours" && (
            <motion.div
              key="hours"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    openStatus.isOpen ? "bg-green-500" : "bg-zinc-600"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    openStatus.isOpen ? "text-green-400" : "text-zinc-400"
                  }`}
                >
                  {openStatus.label}
                </span>
              </div>

              <div className="flex flex-col">
                {DAYS.map(({ key, label }) => {
                  const day = page.workingHours[key] as WorkingHoursDay;
                  const isToday = key === getCurrentDayKey();
                  const isClosed = day.isClosed;
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between py-2.5 border-b border-zinc-900 ${
                        isToday ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      <span
                        className={`text-sm ${isToday ? "font-semibold" : ""}`}
                      >
                        {label}
                      </span>
                      <span
                        className={`text-sm ${
                          isClosed
                            ? "text-zinc-600"
                            : isToday
                              ? "text-[#F7C12B] font-medium"
                              : ""
                        }`}
                      >
                        {isClosed
                          ? "Closed"
                          : `${formatTime(day.open)} - ${formatTime(day.close)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Owner FAB ── */}
      {isOwner && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/pages/${page.slug}/edit`)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#F7C12B] flex items-center justify-center shadow-lg z-40"
        >
          <Pencil size={22} className="text-black" />
        </motion.button>
      )}
    </div>
  );
};

export default PageViewPage;
