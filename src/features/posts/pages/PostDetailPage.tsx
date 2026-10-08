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
  Eye,
  MoreHorizontal,
} from "lucide-react";

import usePost from "@/features/posts/hooks/usePost";
import useLikePost from "@/features/posts/hooks/useLikePost";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import PostOptionsSheet from "@/features/posts/components/PostOptionsSheet";
import SendToChat from "@/features/messages/components/SendToChat";
import type { ChatShare } from "@/features/messages/types/message.types";
import PostComments from "@/features/comments/components/PostComments";
import { deletePostService } from "@/features/posts/services/post.service";

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

  const { post, isOwner: isPostOwner, isLoading, isError } = usePost(id ?? "");
  const { toggleLike, isPending: isLikePending } = useLikePost(id ?? "");

  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cookingRequest, setCookingRequest] = useState("");
  const [selectedSpice, setSelectedSpice] = useState<string | null>(null);

  const { user, restoreSession, isInitializing } = useAuth();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

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
    ? post.likes.some((likeId) => likeId === user.id)
    : false;

  const pageName = post.page.name;
  const pageSlug = post.page.slug;
  const chatShare: ChatShare = {
    kind: post.type === "menu_item" ? "menu_item" : "post",
    id: post._id,
  };

  return (
    <div className="min-h-screen bg-black pb-32 md:pb-0 md:h-screen md:overflow-hidden">
      {/* ── Desktop Nav Header (MD+) ── */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-[#F7C12B] transition-colors"
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-bold">{pageName}</span>
        </motion.button>
        <div className="flex gap-4 items-center">
          <SendToChat
            share={chatShare}
            iconOnly
            className="text-zinc-400 hover:text-white cursor-pointer"
          />
          <Share2
            className="text-zinc-400 cursor-pointer hover:text-white"
            onClick={() => handleShare(post.title ?? "", post._id)}
          />
          <MoreHorizontal
            className="text-zinc-400 cursor-pointer hover:text-white"
            onClick={() => setOptionsOpen(true)}
          />
        </div>
      </div>

      {/* ── Main Layout Wrapper ── */}
      <div className="md:flex md:h-[calc(100vh-73px)] max-w-[1600px] mx-auto">
        
        {/* ── LEFT: Cinematic Media Stage (Desktop Only) ── */}
        <div className="hidden md:block md:w-1/2 lg:w-[60%] md:h-full md:bg-zinc-950 flex flex-col justify-center relative border-r border-zinc-900">
          <div className="flex flex-col gap-6 px-12 py-8 h-full justify-center">
            
            {/* Large Image */}
            <div className="relative w-full overflow-hidden aspect-video md:aspect-square lg:aspect-[4/3] md:rounded-3xl md:shadow-2xl md:shadow-black/50">
              <motion.div
                className="flex h-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 && imageIndex < post.images.length - 1)
                    setImageIndex((i) => i + 1);
                  else if (info.offset.x > 50 && imageIndex > 0)
                    setImageIndex((i) => i - 1);
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imageIndex}
                    src={post.images[imageIndex]}
                    alt={post.title ?? pageName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover shrink-0"
                    draggable={false}
                  />
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Thumbnail Strip - Desktop Only */}
            {post.images.length > 1 && (
              <div className="flex gap-3 px-2 overflow-x-auto pb-2 no-scrollbar">
                {post.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      i === imageIndex
                        ? "border-[#F7C12B] scale-105"
                        : "border-transparent hover:border-zinc-700"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Details & Scrollable Content ── */}
        <div className="w-full md:w-1/2 lg:w-[40%] md:h-full md:overflow-y-auto custom-scrollbar md:bg-black">
          <div className="flex flex-col gap-5 mx-auto py-5 md:py-10">
            
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3 md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-white"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">{pageName}</span>
              </motion.button>
            </div>

            {/* Page Info */}
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
                <span className="text-white font-bold text-base md:text-xl">{pageName}</span>
                {post.page.isVerified && (
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Type Badge */}
            <div className="px-4">
              <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium uppercase tracking-wider">
                {formatPostType(post.type)}
              </span>
            </div>

            {/* Mobile Image Carousel - Unchanged */}
            <div className="md:hidden flex flex-col gap-2 px-4">
              <div className="relative w-full rounded-2xl overflow-hidden aspect-video">
                <motion.div
                  className="flex h-full"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50 && imageIndex < post.images.length - 1)
                      setImageIndex((i) => i + 1);
                    else if (info.offset.x > 50 && imageIndex > 0)
                      setImageIndex((i) => i - 1);
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

              {post.images.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === imageIndex ? "w-4 h-2 bg-white" : "w-2 h-2 bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title + Price + Actions */}
            <div className="px-4 flex items-start justify-between gap-3">
              <h1 className="text-white font-bold text-xl md:text-3xl lg:text-4xl leading-tight flex-1">
                {post.title ?? post.content}
                {post.price !== undefined && (
                  <span className="text-[#F7C12B]"> - {post.price}$</span>
                )}
              </h1>

              {/* Mobile Actions */}
              <div className="flex items-center gap-2 shrink-0 mt-0.5 md:hidden">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleLike()}
                  disabled={isLikePending}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                >
                  <Heart size={16} className={isLiked ? "text-red-500 fill-red-500" : "text-zinc-400"} />
                </motion.button>

                <SendToChat
                  share={chatShare}
                  iconOnly
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 cursor-pointer"
                />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => void handleShare(post.title ?? "", post._id)}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center "
                >
                  <Share2 size={16} className="text-zinc-400" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setOptionsOpen(true)}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                >
                  <MoreHorizontal size={16} className="text-zinc-400" />
                </motion.button>
              </div>
            </div>

            {/* Desktop Like/Stat bar */}
            <div className="hidden md:flex px-4 gap-6">
              <button
                onClick={() => toggleLike()}
                className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Heart size={24} className={isLiked ? "text-red-500 fill-red-500" : ""} />
                <span className="font-bold">{post.likes.length.toLocaleString()}</span>
              </button>
              <div className="flex items-center gap-2 text-zinc-400">
                <Eye size={24} />
                <span className="font-bold">{(post.views ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="px-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/tags/${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 rounded-full border border-zinc-700 text-zinc-300 text-xs md:text-sm hover:border-[#F7C12B] hover:text-[#F7C12B] cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {post.title && (
              <p className="px-4 text-zinc-400 text-sm md:text-lg leading-relaxed">
                {post.content}
              </p>
            )}

            {/* Mobile Likes + Time */}
            <div className="px-4 flex items-center gap-3 md:hidden">
              <div className="flex items-center gap-1.5">
                <Heart size={16} className="text-red-500 fill-red-500 shrink-0" />
                <span className="text-white font-semibold text-sm">
                  {post.likes.length.toLocaleString()} Likes
                </span>
              </div>
              <span className="text-zinc-600">·</span>
              <div className="flex items-center gap-1.5">
                <Eye size={16} className="text-zinc-500 shrink-0" />
                <span className="text-zinc-500 text-sm">
                  {(post.views ?? 0).toLocaleString()} Views
                </span>
              </div>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500 text-sm">Posted {timeAgo(post.createdAt)}</span>
            </div>

            <div className="h-px bg-zinc-900 mx-4" />

            <PostComments
              postId={post._id}
              canModerate={isPostOwner || user?.role === "admin"}
            />

            {/* Cooking Request */}
            <div className="px-4 flex flex-col gap-3">
              <h3 className="text-white font-semibold text-sm md:text-base">
                Add a cooking request <span className="text-zinc-500 font-normal">(optional)</span>
              </h3>
              <textarea
                value={cookingRequest}
                onChange={(e) => setCookingRequest(e.target.value)}
                placeholder="e.g. Don't make it too spicy"
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm md:text-base text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B] resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {SPICE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedSpice(selectedSpice === option ? null : option)}
                    className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-colors cursor-pointer ${
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

            {/* Desktop Only Order Bar */}
            <div className="hidden md:flex px-4 py-8 mt-auto flex-col gap-4 sticky bottom-0 bg-black/80 backdrop-blur-xl border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 bg-zinc-900 rounded-2xl p-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-white hover:text-[#F7C12B]"
                  >
                    <Minus />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-white hover:text-[#F7C12B]"
                  >
                    <Plus />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-sm font-bold uppercase">Total Price</p>
                  <p className="text-3xl font-black text-[#F7C12B]">
                    ${(post.price ? post.price * quantity : 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <button className="w-full bg-[#F7C12B] hover:bg-yellow-400 text-black py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-yellow-400/10">
                <ShoppingCart /> Add to My Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Order Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 px-4 py-4 flex items-center gap-3 z-50">
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-white cursor-pointer"
          >
            <Minus size={14} />
          </motion.button>
          <span className="text-white font-bold text-sm w-4 text-center">{quantity}</span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => q + 1)}
            className="text-white cursor-pointer"
          >
            <Plus size={14} />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-[#F7C12B] rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingCart size={16} className="text-black" />
          <span className="text-black font-bold text-sm">
            Add item {post.price !== undefined ? ` - $${(post.price * quantity).toFixed(2)}` : ""}
          </span>
        </motion.button>
      </div>

      <SendToChat
        share={chatShare}
        open={sendOpen}
        onOpenChange={setSendOpen}
        hideTrigger
      />

      <PostOptionsSheet
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        postId={post._id}
        isOwner={isPostOwner}
        onSendToChat={() => setSendOpen(true)}
        onDelete={async () => {
          await deletePostService(post._id);
          navigate(-1);
        }}
      />
    </div>
  );
};

export default PostDetailPage;