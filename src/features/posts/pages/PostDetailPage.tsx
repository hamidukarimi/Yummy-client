import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import usePost from "@/features/posts/hooks/usePost";
import useLikePost from "@/features/posts/hooks/useLikePost";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPostType = (type: string): string =>
  type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (mins > 0) return `${mins} minutes ago`;
  return "Just now";
};

const handleShare = async (title: string, id: string) => {
  const url = `${window.location.origin}/posts/${id}`;
  if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  //   const { user }     = useAuth();

  const { post, isLoading, isError } = usePost(id ?? "");
  const { toggleLike, isPending: isLikePending } = useLikePost(id ?? "");

  // ─── Local State ─────────────────────────────────────────────────────────
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cookingRequest, setCookingRequest] = useState("");
  const [selectedSpice, setSelectedSpice] = useState<string | null>(null);

  const { user, restoreSession, isInitializing } = useAuth();

  // Restore session on public route if user not loaded
  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, []);

  const SPICE_OPTIONS = [
    "Extra Spicy",
    "Less Spicy",
    "Non-Spicy",
    "Without Ghee",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Post not found.</p>
      </div>
    );
  }

  const isLiked = user?.id
    ? post.likes.some((likeId) => likeId === user.id || likeId === user.id)
    : false;
  const pageName = post.page.name;
  const pageSlug = post.page.slug;

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">{pageName}</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-5 max-w-md mx-auto">
        {/* ── Page Info ── */}
        <div
          className="flex items-center gap-3 px-4 cursor-pointer"
          onClick={() => navigate(`/pages/${pageSlug}`)}
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
            {post.page.avatar ? (
              <img
                src={post.page.avatar}
                alt={pageName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                {pageName[0]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">{pageName}</span>
            {post.page.isVerified && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <Check size={10} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* ── Type Badge ── */}
        <div className="px-4">
          <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium">
            {formatPostType(post.type)}
          </span>
        </div>

        {/* ── Image Carousel ── */}
        {post.images.length > 0 && (
          <div className="flex flex-col gap-2 px-4">
            <div className="relative w-full rounded-2xl overflow-hidden aspect-video">
              <motion.div
                className="flex h-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (
                    info.offset.x < -50 &&
                    imageIndex < post.images.length - 1
                  ) {
                    setImageIndex((i) => i + 1);
                  } else if (info.offset.x > 50 && imageIndex > 0) {
                    setImageIndex((i) => i - 1);
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imageIndex}
                    src={post.images[imageIndex]}
                    alt={post.title ?? pageName}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-cover shrink-0"
                    draggable={false}
                  />
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Dot indicators */}
            {post.images.length > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === imageIndex
                        ? "w-4 h-2 bg-white"
                        : "w-2 h-2 bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Title + Price + Actions ── */}
        <div className="px-4 flex items-start justify-between gap-3">
          <h1 className="text-white font-bold text-xl leading-tight flex-1">
            {post.title ?? post.content}
            {post.price !== undefined && (
              <span className="text-[#F7C12B]"> - {post.price}$</span>
            )}
          </h1>

          {/* Like + Share */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              disabled={isLikePending || isInitializing}
              onClick={() => toggleLike()}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
            >
              <Heart
                size={16}
                className={
                  isLiked ? "text-red-500 fill-red-500" : "text-zinc-400"
                }
              />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => void handleShare(post.title ?? pageName, post._id)}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
            >
              <Share2 size={16} className="text-zinc-400" />
            </motion.button>
          </div>
        </div>

        {/* ── Tags ── */}
        {post.tags.length > 0 && (
          <div className="px-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-zinc-700 text-zinc-300 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {post.title && (
          <p className="px-4 text-zinc-400 text-sm leading-relaxed">
            {post.content}
          </p>
        )}

        {/* ── Likes + Time ── */}
        <div className="px-4 flex items-center gap-2">
          <Heart size={16} className="text-red-500 fill-red-500 shrink-0" />
          <span className="text-white font-semibold text-sm">
            {post.likes.length.toLocaleString()} Likes
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500 text-sm">
            Posted {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-900 mx-4" />

        {/* ── Cooking Request (future) ── */}
        <div className="px-4 flex flex-col gap-3">
          <h3 className="text-white font-semibold text-sm">
            Add a cooking request{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </h3>
          <textarea
            value={cookingRequest}
            onChange={(e) => setCookingRequest(e.target.value)}
            placeholder="e.g. Don't make it too spicy"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
          />

          {/* Spice options */}
          <div className="flex flex-wrap gap-2">
            {SPICE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() =>
                  setSelectedSpice(selectedSpice === option ? null : option)
                }
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-200 ${
                  selectedSpice === option
                    ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                    : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom — Order (future) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 px-4 py-4 flex items-center gap-3 max-w-md mx-auto">
        {/* Quantity */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-white"
          >
            <Minus size={14} />
          </motion.button>
          <span className="text-white font-bold text-sm w-4 text-center">
            {quantity}
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => q + 1)}
            className="text-white"
          >
            <Plus size={14} />
          </motion.button>
        </div>

        {/* Add to order button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-[#F7C12B] rounded-xl py-3 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} className="text-black" />
          <span className="text-black font-bold text-sm">
            Add item
            {post.price !== undefined
              ? ` - $${(post.price * quantity).toFixed(2)}`
              : ""}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default PostDetailPage;
