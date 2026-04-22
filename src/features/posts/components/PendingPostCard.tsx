import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Clock, Pencil, Trash2 } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import BottomSheetItem from "@/components/ui/BottomSheetItem";
import { deletePostService } from "@/features/posts/services/post.service";
import type { ApiPost } from "@/features/posts/types/post.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingPostCardProps {
  post: ApiPost;
  onDelete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PendingPostCard = ({ post, onDelete }: PendingPostCardProps) => {
  const navigate = useNavigate();
  const [optionsOpen, setOptionsOpen] = useState(false);

  const handleDelete = async () => {
    await deletePostService(post._id);
    onDelete();
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
        {/* ── Image or placeholder ── */}
        <div className="w-full h-48 bg-zinc-900">
          {post.images.length > 0 ? (
            <img
              src={post.images[0]}
              alt={post.title ?? "Post"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-700 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* ── Dark overlay ── */}
        <div className="absolute inset-0 bg-black/60" />

        {/* ── Pending badge ── */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
          <Clock size={11} className="text-[#F7C12B]" />
          <span className="text-[#F7C12B] text-xs font-semibold">
            Pending Review
          </span>
        </div>

        {/* ── Three dots ── */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOptionsOpen(true)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center cursor-pointer"
        >
          <MoreHorizontal size={15} className="text-white" />
        </motion.button>

        {/* ── Content ── */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/90 to-transparent">
          {post.title && (
            <h3 className="text-white font-bold text-sm leading-tight truncate">
              {post.title}
            </h3>
          )}
          <p className="text-zinc-400 text-xs line-clamp-1 mt-0.5">
            {post.content}
          </p>
          {post.price !== undefined && (
            <span className="text-[#F7C12B] font-bold text-xs">
              ${post.price}
            </span>
          )}
        </div>
      </div>

      {/* ── Options Sheet ── */}
      <BottomSheet isOpen={optionsOpen} onClose={() => setOptionsOpen(false)}>
        <BottomSheetItem
          icon={<Pencil size={18} />}
          label="Edit post"
          onClick={() => {
            setOptionsOpen(false);
            navigate(`/posts/${post._id}/edit`);
          }}
        />
        <BottomSheetItem
          icon={<Trash2 size={18} />}
          label="Delete post"
          onClick={() => {
            setOptionsOpen(false);
            void handleDelete();
          }}
          variant="danger"
        />
      </BottomSheet>
    </>
  );
};

export default PendingPostCard;
