import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, ChevronLeft } from "lucide-react";
import useSavedPosts from "@/features/saved/hooks/useSavedPosts";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";
import useAuth from "@/hooks/useAuth";

const SavedPage = () => {
  const navigate = useNavigate();
  const { user, restoreSession, isInitializing } = useAuth();
  const { posts, isLoading, isError } = useSavedPosts();

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  return (
    <div className="min-h-screen bg-black pb-24 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="text-white"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="text-lg font-bold text-white">Saved Posts</h1>
      </div>

      {/* ── Content ── */}
      <div className="px-4">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <p className="text-zinc-500 text-sm text-center py-16">
            Failed to load saved posts.
          </p>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
              <Bookmark size={24} className="text-zinc-600" />
            </div>
            <p className="text-white font-semibold text-sm">
              No saved posts yet
            </p>
            <p className="text-zinc-500 text-xs text-center">
              Tap the bookmark icon on any post to save it here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-[#F7C12B] text-sm hover:underline mt-1"
            >
              Explore posts
            </button>
          </div>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5"
          >
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
