import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import SendToChat from "@/features/messages/components/SendToChat";
import type { ApiPost } from "@/features/posts/types/post.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuCardProps {
  post: ApiPost;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MenuCard = ({ post }: MenuCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/posts/${post._id}`)}
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-square bg-zinc-900"
    >
      {/* ── Image ── */}
      {post.images.length > 0 ? (
        <img
          src={post.images[0]}
          alt={post.title ?? "Menu item"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      {/* ── Gradient Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div
        className="absolute top-2 right-2 z-10"
        onClick={(event) => event.stopPropagation()}
      >
        <SendToChat
          share={{ kind: "menu_item", id: post._id }}
          iconOnly
          className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
        />
      </div>

      {/* ── Text Overlay ── */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex flex-col gap-0.5">
        {/* Title */}
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
          {post.title ?? post.content}
        </h3>

        {/* Description */}
        {post.title && post.content && (
          <p className="text-zinc-400 text-xs line-clamp-1">{post.content}</p>
        )}

        {/* Price */}
        {post.price !== undefined && (
          <div className="flex items-center gap-0.5 mt-1">
            <DollarSign size={11} className="text-[#F7C12B]" />
            <span className="text-[#F7C12B] font-bold text-xs">
              {post.price}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuCard;
