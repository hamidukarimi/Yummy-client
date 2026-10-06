import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import useMyPosts from "@/features/posts/hooks/useMyPosts";
import { deletePostService } from "@/features/posts/services/post.service";
import PostCard from "@/features/posts/components/PostCard";
import { useCreatePostModal } from "@/context/CreatePostModalContext";
import BottomSheet from "@/components/ui/BottomSheet";
import BottomSheetItem from "@/components/ui/BottomSheetItem";
import Spinner from "@/components/ui/Spinner";
import type { ApiPost, PostStatus } from "@/features/posts/types/post.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "pending" | "approved" | "rejected";

// ─── Sub Components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: PostStatus }) => {
  const styles: Record<PostStatus, string> = {
    pending: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
    approved: "bg-green-500/15 border-green-500/30 text-green-400",
    rejected: "bg-red-500/15 border-red-500/30 text-red-400",
  };

  const labels: Record<PostStatus, string> = {
    pending: "Pending Review",
    approved: "Published",
    rejected: "Rejected",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { openModal } = useCreatePostModal();
  const { posts, isLoading, isError, refetch } = useMyPosts();
  const [tab, setTab] = useState<Tab>("approved");
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreatePost = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      openModal();
      return;
    }
    navigate("/posts/create");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "approved", label: "Published" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

  const filteredPosts = posts.filter((p) => p.status === tab);

  const handleDelete = async () => {
    if (!selectedPost) return;
    setIsDeleting(true);
    try {
      await deletePostService(selectedPost._id);
      await refetch();
    } finally {
      setIsDeleting(false);
      setSelectedPost(null);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24  mx-auto">

      {/* ── Tabs ── */}
      <div className="flex items-center border-b border-zinc-800 px-4">
        {tabs.map(({ key, label }) => {
          const count = posts.filter((p) => p.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 -mb-px cursor-pointer ${
                tab === key
                  ? "border-[#F7C12B] text-[#F7C12B]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key
                      ? "bg-[#F7C12B] text-black"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-5">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <p className="text-zinc-500 text-sm text-center py-16">
            Failed to load posts.
          </p>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && !isError && (
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6      "
            >
              {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <p className="text-zinc-500 text-sm">
                    {tab === "approved" && "No published posts yet."}
                    {tab === "pending" && "No posts pending review."}
                    {tab === "rejected" && "No rejected posts."}
                  </p>
                  {tab !== "rejected" && (
                    <button
                      onClick={handleCreatePost}
                      className="text-[#F7C12B] text-sm hover:underline cursor-pointer"
                    >
                      Create a post
                    </button>
                  )}
                </div>
              )}

              <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-y-9 lg:mt-3">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="flex flex-col gap-2">
                    {/* ── Status badge + three dots ── */}
                    <div className="flex items-center justify-between px-1">
                      <StatusBadge status={post.status} />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPost(post)}
                        className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 cursor-pointer"
                      >
                        <span className="text-base leading-none">···</span>
                      </motion.button>
                    </div>

                    {/* ── Rejected reason ── */}
                    {post.status === "rejected" && post.rejectedReason && (
                      <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-red-400 text-xs leading-relaxed">
                          <span className="font-semibold">Reason: </span>
                          {post.rejectedReason}
                        </p>
                      </div>
                    )}

                    {/* ── Post Card ── */}
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Options Bottom Sheet ── */}
      <BottomSheet
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      >
        <BottomSheetItem
          icon={<Pencil size={18} />}
          label="Edit post"
          onClick={() => {
            const id = selectedPost?._id;
            setSelectedPost(null);
            if (id) navigate(`/posts/${id}/edit`);
          }}
        />
        <BottomSheetItem
          icon={<Trash2 size={18} />}
          label={isDeleting ? "Deleting..." : "Delete post"}
          onClick={() => void handleDelete()}
          variant="danger"
          disabled={isDeleting}
        />
      </BottomSheet>
    </div>
  );
};

export default MyPostsPage;
