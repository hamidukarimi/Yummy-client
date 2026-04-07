import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, DollarSign, Clock, Eye, Bookmark } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useToggleSave from "@/features/saved/hooks/useToggleSave";
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
  const { user } = useAuth();
  const { toggleSave, isPending } = useToggleSave(post._id);

  const isSaved = user?.savedPosts?.includes(post._id) ?? false;

  return (
    <div className="flex flex-col gap-2">
      {/* ── Page Author ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
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

        {/* Save button */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <Bookmark
              size={16}
              className={
                isSaved ? "text-[#F7C12B] fill-[#F7C12B]" : "text-zinc-500"
              }
            />
          </motion.button>
        )}
      </div>

      {/* ── Card ── */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/posts/${post._id}`)}
        className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 cursor-pointer"
      >
        {/* ── Image ── */}
        <div className="w-full h-52 md:h-56">
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
          {post.title && (
            <h3 className="text-white font-bold text-base leading-tight">
              {post.title}
            </h3>
          )}
          {!post.title && (
            <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
              {post.content}
            </p>
          )}

          <div className="flex items-center gap-4 text-zinc-500 text-xs">
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-[#F7C12B]" />
              <span>{post.likes.length}</span>
            </div>
            {post.price !== undefined && (
              <div className="flex items-center gap-1">
                <DollarSign size={12} />
                <span>{post.price}</span>
              </div>
            )}
            {post.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{post.views.toLocaleString()}</span>
              </div>
            )}
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
              {formatPostType(post.type)}
            </span>
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
