import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, DollarSign, Clock, Eye } from "lucide-react";
import type { ApiPost } from "@/features/posts/types/post.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: ApiPost;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPostType = (type: string): string => {
  return type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

// ─── Component ────────────────────────────────────────────────────────────────

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      {/* ── Page Author — outside and above card ── */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden border border-zinc-800 shrink-0">
          {post.page.avatar ? (
            <img
              src={post.page.avatar}
              alt={post.page.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
              {post.page.name[0]}
            </div>
          )}
        </div>
        <span className="text-white text-xs font-semibold">
          {post.page.name}
        </span>
      </div>

      {/* ── Card ── */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/posts/${post._id}`)}
        className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 cursor-pointer"
      >
        {/* ── Image ── */}
        <div className="w-full h-52">
          {post.images.length > 0 ? (
            <img
              src={post.images[0]}
              alt={post.title ?? post.page.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <span className="text-zinc-700 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="px-4 py-3 flex flex-col gap-2">
          {/* Title */}
          {post.title && (
            <h3 className="text-white font-bold text-base leading-tight">
              {post.title}
            </h3>
          )}

          {/* Content preview — if no title */}
          {!post.title && (
            <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
              {post.content}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-zinc-500 text-xs">
            {/* Likes */}
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-[#F7C12B]" />
              <span>{post.likes.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye size={12} className="text-zinc-500" />
              <span>{(post.views ?? 0).toLocaleString()}</span>
            </div>

            {/* Price */}
            {post.price !== undefined && (
              <div className="flex items-center gap-1">
                <DollarSign size={12} />
                <span>{post.price}</span>
              </div>
            )}

            {/* Type badge */}
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
              {formatPostType(post.type)}
            </span>

            {/* Time */}
            <div className="flex items-center gap-1 ml-auto">
              <Clock size={11} />
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostCard;
